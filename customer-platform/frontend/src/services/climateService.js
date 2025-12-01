// Simple client-side climate service with conservative caching
// - Attempts to resolve a place from product title/location
// - Uses GPT (OpenAI) to refine extraction (best-effort; falls back to heuristics)
// - Fetches weather via OpenWeather Geocoding + Weather/Forecast

const OPEN_WEATHER_KEY = '8425ac6accbc9e1ed2942388d299241b'

const CACHE_TTL_MS = 3 * 60 * 60 * 1000 // 3 hours
const inMemory = new Map() // coalesce same-key requests within a session

function getCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }))
  } catch {}
}

function normalizePlace(p) {
  return String(p || '').trim()
}

// Lightweight heuristic as first pass, to avoid Gemini calls when possible
function heuristicExtractPlace(name, location) {
  if (location && location.length >= 3) return normalizePlace(location)
  if (!name) return ''
  // Try patterns: "in X", "to X", commas, words with capital letters
  const inMatch = name.match(/\b(?:in|to|at)\s+([A-Z][\w\-\s]+)/i)
  if (inMatch) return normalizePlace(inMatch[1])
  const parts = name.split(/[-–:|,]/).map(s => s.trim()).filter(Boolean)
  if (parts.length > 1) {
    // Prefer the last part often containing location
    const candidate = parts[parts.length - 1]
    if (/[A-Za-z]/.test(candidate)) return normalizePlace(candidate)
  }
  // Fallback: take 2-3 capitalized words as a guess
  const raw = (name.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/g) || [])[0] || ''
  const stopwords = /(Adventure|Tour(?:ing)?|Trip|Day|Private|Guided|Experience|Valley|Mount|Mountain|Tourism|Package|City|Best|Ultimate|Journey|Explore|Discovery)\b/gi
  const cleaned = raw.replace(stopwords, '').replace(/\s{2,}/g, ' ').trim()
  return normalizePlace(cleaned || raw)
}

async function openAIExtractPlace(name) {
  if (!name) return null
  const openaiKey = process.env.REACT_APP_OPENAI_KEY
  if (!openaiKey) return null
  try {
    const url = 'https://api.openai.com/v1/chat/completions'
    const system = 'You extract destinations for weather lookup. Respond ONLY with JSON.'
    const user = `From this product title, extract a destination suitable for OpenWeather geocoding. Return strict JSON with keys: city, region, country, fallbackQuery. Title: "${name}"`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    })
    if (!res.ok) throw new Error('openai failed ' + res.status)
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || ''
    const match = text.match(/\{[\s\S]*\}/)
    const obj = match ? JSON.parse(match[0]) : null
    if (!obj) return null
    return {
      city: normalizePlace(obj.city),
      region: normalizePlace(obj.region),
      country: normalizePlace(obj.country),
      fallbackQuery: normalizePlace(obj.fallbackQuery)
    }
  } catch (e) {
    console.warn('openAIExtractPlace failed', e)
    return null
  }
}

async function openAIGenerateNarrative(place, today, forecasts) {
  const openaiKey = process.env.REACT_APP_OPENAI_KEY
  if (!openaiKey) return ''
  try {
    const url = 'https://api.openai.com/v1/chat/completions'
    const system = 'You are a travel weather narrator. Write a brief, friendly, natural-language bulletin for travelers.'
    const bullets = [
      `Location: ${place}`,
      `Today condition: ${today?.condition ?? ''}`,
      `High: ${today?.high ?? ''} °C`,
      `Low: ${today?.low ?? ''} °C`,
      `Wind: ${today?.windRange ?? ''}`
    ].join('\n')
    const outlook = (Array.isArray(forecasts) ? forecasts : []).slice(0,3).map((d,i)=>{
      return `${d.label}: ${d.condition || ''}, ${d.high ?? ''}°/${d.low ?? ''}°`
    }).join('\n')
    const user = `Using the data below, craft a 2-3 sentence overview like this style:\n"Today at Mount Fuji, the weather is cool and clear... At the summit..."\nAvoid location-specific landmarks; keep it general for the given location. Keep units in °C and wind as provided.\n\nDATA\n${bullets}\nNext days:\n${outlook}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    })
    if (!res.ok) throw new Error('openai generation failed ' + res.status)
    const data = await res.json()
    const text = (data?.choices?.[0]?.message?.content || '').trim()
    return text
  } catch (e) {
    console.warn('openAIGenerateNarrative failed', e)
    return ''
  }
}

async function geocode(place) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(place)}&limit=5&appid=${OPEN_WEATHER_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('geocoding failed')
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) throw new Error('place not found')
  // Prefer entries with both name and country present
  const best = data.find(x => x?.name && x?.country) || data[0]
  const { lat, lon, name, country, state } = best
  return { lat, lon, label: [name, state, country].filter(Boolean).join(', ') }
}

async function fetchCurrent(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather failed')
  return res.json()
}

async function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('forecast failed')
  return res.json()
}

function selectDailySlices(list) {
  if (!Array.isArray(list)) return []
  // pick around 12:00 local time entries for next 3 days
  const byDay = {}
  for (const item of list) {
    const d = new Date(item.dt * 1000)
    const dayKey = d.toISOString().slice(0, 10)
    const hour = d.getUTCHours()
    const score = Math.abs(12 - hour)
    if (!byDay[dayKey] || score < byDay[dayKey].score) byDay[dayKey] = { score, item }
  }
  return Object.values(byDay).slice(1, 4).map(x => x.item) // skip today, next 3
}

export async function getClimateForProduct({ name, location }) {
  const cacheKey = `climate:v1:${name}|${location}`
  if (inMemory.has(cacheKey)) return inMemory.get(cacheKey)
  const cached = getCache(cacheKey)
  if (cached) return cached

  // Resolve place (avoid AI unless absolutely necessary)
  let place = heuristicExtractPlace(name, location)
  if (!place) place = normalizePlace(location)
  if (!place) throw new Error('Unable to resolve place for weather')

  // Geocode and fetch weather
  const promise = (async () => {
    // Try multiple candidate strings to improve geocoding reliability
    const candidates = []
    if (location) candidates.push(normalizePlace(location))
    if (place) candidates.push(place)
    if (location && place) {
      const countryHint = String(location).split(',').map(s => s.trim()).filter(Boolean).pop()
      if (countryHint && !place.toLowerCase().includes(countryHint.toLowerCase())) {
        candidates.push(`${place}, ${countryHint}`)
      }
    }
    let geo = null
    let lastErr = null
    for (const cand of candidates) {
      if (!cand) continue
      try {
        geo = await geocode(cand)
        if (geo) break
      } catch (e) {
        lastErr = e
      }
    }
    if (!geo) {
      // Ask GPT for structured location and retry with best candidates
      const ai = await openAIExtractPlace(name)
      if (ai) {
        const aiCandidates = []
        if (ai.city && ai.country) aiCandidates.push(`${ai.city}, ${ai.country}`)
        if (ai.region && ai.country) aiCandidates.push(`${ai.region}, ${ai.country}`)
        if (ai.fallbackQuery) aiCandidates.push(ai.fallbackQuery)
        for (const cand of aiCandidates) {
          try {
            geo = await geocode(cand)
            if (geo) break
          } catch (e) { lastErr = e }
        }
      }
    }
    if (!geo && place) {
      // Small country guesser for common ambiguous regions
      const lower = place.toLowerCase()
      const guesses = []
      if (/hunza|karimabad|khunjerab/.test(lower)) guesses.push(`${place}, Pakistan`)
      if (/fuji|tokyo|kyoto|osaka/.test(lower)) guesses.push(`${place}, Japan`)
      for (const cand of guesses) {
        try {
          geo = await geocode(cand)
          if (geo) break
        } catch (e) { lastErr = e }
      }
    }
    if (!geo) throw lastErr || new Error('place not found')
    const [current, forecast] = await Promise.all([
      fetchCurrent(geo.lat, geo.lon),
      fetchForecast(geo.lat, geo.lon)
    ])

  const nextDays = selectDailySlices(forecast.list)
  const mapCond = (code) => {
    // Basic mapping to simple labels
    if (code >= 200 && code < 600) return 'Rain'
    if (code >= 600 && code < 700) return 'Snow'
    if (code === 800) return 'Clear'
    if (code > 800) return 'Cloudy'
    return 'Clear'
  }

  const result = {
    meta: { place: geo.label },
    today: {
      high: Math.round(current.main?.temp_max ?? current.main?.temp ?? 0),
      low: Math.round(current.main?.temp_min ?? current.main?.temp ?? 0),
      windDir: '',
      windRange: `${Math.round(current.wind?.speed ?? 0)} m/s`,
      condition: (current.weather && current.weather[0] && current.weather[0].main) || ''
    },
    forecasts: nextDays.map(d => ({
      label: new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
      high: Math.round(d.main?.temp_max ?? d.main?.temp ?? 0),
      low: Math.round(d.main?.temp_min ?? d.main?.temp ?? 0),
      windDir: '',
      windRange: `${Math.round(d.wind?.speed ?? 0)} m/s`,
      condition: mapCond(d.weather?.[0]?.id)
    })),
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Generate a narrative once and cache it along with the weather
  try {
    const narrative = await openAIGenerateNarrative(result.meta.place, result.today, result.forecasts)
    if (narrative) result.description = narrative
  } catch (_) {}

    setCache(cacheKey, result)
    return result
  })().catch(async (err) => {
    // Graceful fallback: use provided location or a well-known city to avoid blank UI
    console.warn('climateService error', err)
    try {
      const fallbackPlace = location || 'Tokyo'
      const geo2 = await geocode(fallbackPlace)
      const [current2, forecast2] = await Promise.all([
        fetchCurrent(geo2.lat, geo2.lon),
        fetchForecast(geo2.lat, geo2.lon)
      ])
      const nextDays2 = selectDailySlices(forecast2.list)
      const result2 = {
        meta: { place: geo2.label },
        today: {
          high: Math.round(current2.main?.temp_max ?? current2.main?.temp ?? 0),
          low: Math.round(current2.main?.temp_min ?? current2.main?.temp ?? 0),
          windDir: '',
          windRange: `${Math.round(current2.wind?.speed ?? 0)} m/s`
        },
        forecasts: nextDays2.map(d => ({
          label: new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
          high: Math.round(d.main?.temp_max ?? d.main?.temp ?? 0),
          low: Math.round(d.main?.temp_min ?? d.main?.temp ?? 0),
          windDir: '',
          windRange: `${Math.round(d.wind?.speed ?? 0)} m/s`,
          condition: (d.weather && d.weather[0] && d.weather[0].main) || 'Clear'
        })),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setCache(cacheKey, result2)
      return result2
    } catch (e2) {
      throw err
    }
  })

  inMemory.set(cacheKey, promise)
  try {
    const res = await promise
    return res
  } finally {
    inMemory.delete(cacheKey)
  }
}


