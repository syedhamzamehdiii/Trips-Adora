import React, { useEffect, useMemo, useState } from 'react'
import weatherBg from '../../assests/weather.jpg'
import { getClimateForProduct } from '../services/climateService'

/**
 * ClimateWidget
 * Lightweight weather UI for the product detail climate section.
 * Accepts basic props; falls back to sensible demo values when absent.
 */
export default function ClimateWidget({ productName, productLocation }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getClimateForProduct({ name: productName, location: productLocation })
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) setError('Unable to load live weather. Showing design preview.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [productName, productLocation])

  const title = useMemo(() => `${data?.meta?.place || 'Destination'} — Today’s Weather`, [data])
  const dateLabel = useMemo(() => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }), [])
  const updatedAt = useMemo(() => `Last Updated at ${data?.updatedAt || ''}`, [data])
  const today = data?.today || { high: 32, low: 18, windDir: 'Northwest', windRange: '4 – 12 mph', condition: 'Clear' }
  const forecasts = data?.forecasts || []
  const description = useMemo(() => {
    if (data?.description) return data.description
    const place = data?.meta?.place || 'your destination'
    const cond = (today?.condition || 'Clear').toLowerCase()
    const hi = today?.high
    const lo = today?.low
    const wind = today?.windRange
    return `Today in ${place}, conditions are ${cond} with daytime highs near ${hi} °C and nighttime lows around ${lo} °C. Winds are about ${wind}.`
  }, [data, today])

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${weatherBg})` }}
      >
        {/* soft dark-to-transparent overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/5" />
        <div className="relative p-5 sm:p-7">
            <h2 className="text-white text-xl sm:text-2xl font-bold drop-shadow">{title}</h2>
            <p className="text-white/90 text-xs sm:text-sm mt-1 drop-shadow">{dateLabel}</p>
            <p className="text-white/80 text-xs mt-2 drop-shadow">{updatedAt}</p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3">
                <div className="text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-white/80 flex items-center justify-center">
                      <div className="w-8 h-8 bg-yellow-300 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4 text-2xl sm:text-3xl font-semibold">
                      <span className="flex items-center">↑ {today.high}°</span>
                      <span className="flex items-center">↓ {today.low}°</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <span className="inline-flex items-center gap-2">↘ {today.windDir}</span>
                    <span className="ml-2 opacity-90">{today.windRange}</span>
                  </div>
                </div>

                <div className="mt-4 bg-white/95 rounded-xl p-4 text-gray-800 shadow whitespace-pre-line">
                  {error ? (
                    <p className="text-sm text-red-600">{error}</p>
                  ) : (
                    <p className="text-sm leading-relaxed">{description}</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {(forecasts.length ? forecasts : [
                  { label: 'Tomorrow', high: today.high, low: today.low, windDir: today.windDir, windRange: today.windRange, condition: 'Clear' }
                ]).map((f, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-yellow-300 rounded-full shrink-0" />
                      <div className="flex-1">
                        <div className="text-gray-900 font-semibold text-sm">{f.label}</div>
                        <div className="text-gray-600 text-xs">All Day {f.condition}</div>
                        <div className="mt-2 flex items-center gap-4 text-gray-900">
                          <span className="text-lg font-bold">↑ {f.high}°</span>
                          <span className="text-lg font-bold">↓ {f.low}°</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">↘ {f.windDir} · {f.windRange}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}


