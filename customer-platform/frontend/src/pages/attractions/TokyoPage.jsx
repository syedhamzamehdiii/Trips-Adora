import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiMapPin, FiMap, FiCoffee, FiBookOpen, FiStar, FiActivity } from 'react-icons/fi'
import { BsHeart, BsHeartFill } from 'react-icons/bs'
import MainHeader from '../../components/MainHeader'
import Footer from '../../components/Footer'

const cardBase = 'bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200'

const SectionTitle = ({ title, subtitle }) => (
  <div className="text-center mb-6">
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-2xl font-bold text-gray-900 mt-1">{subtitle}</p>}
  </div>
)

const TokyoPage = () => {
  const [favorites, setFavorites] = useState(new Set())
  const navigate = useNavigate()
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tokyo_favorites')
      if (raw) setFavorites(new Set(JSON.parse(raw)))
    } catch (_) {}
  }, [])

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      try { localStorage.setItem('tokyo_favorites', JSON.stringify(Array.from(next))) } catch (_) {}
      return next
    })
  }

  const tokyoTips = [
    {
      title: "Best ramen shops open past midnight",
      description: "Ichiran in Shibuya serves amazing tonkotsu ramen 24/7. Perfect after a night out!",
      icon: "🍜"
    },
    {
      title: "Secret cherry blossom viewing spots",
      description: "Ueno Park and Shinjuku Gyoen offer stunning hanami without the overwhelming crowds of main attractions.",
      icon: "🌸"
    },
    {
      title: "Best time to visit Tokyo Skytree",
      description: "Go at sunset (around 6 PM) for breathtaking 360-degree views as the city lights up below.",
      icon: "🗼"
    },
    {
      title: "Hidden izakaya alleys",
      description: "Golden Gai in Shinjuku has tiny bars in retro buildings. Hoppy Street in Asakusa for local vibe!",
      icon: "🍻"
    },
    {
      title: "Quiet temple escapes",
      description: "Senso-ji early morning (6 AM) or Nezu Shrine for beautiful azalea gardens without crowds.",
      icon: "⛩️"
    },
    {
      title: "Local sushi secrets",
      description: "Tsukiji Outer Market still has amazing sushi! Try the tuna bowls and tamago-yaki vendors.",
      icon: "🍣"
    }
  ]

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tokyoTips.length)
  }

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tokyoTips.length) % tokyoTips.length)
  }

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      {/* Hero */}
      <div
        className="relative h-[520px] w-full"
        style={{
          backgroundImage: "url('/assests/golden-pavilion-kinkakuji-temple-kyoto-japan 1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-end pb-10">
          <div className="text-white max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-snug drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">
              <span className="block">Where Ancient Tradition</span>
              <span className="block mt-2">Meets Futuristic Innovation.</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              Experience the vibrant energy of japan's capital city, where neon-lit skyscrapers stand alongside serene temples, and cutting-edge technology harmonizes with timeless traditions.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* What we love */}
        <SectionTitle title="What we Love Here:" subtitle="Tokyo speaks in feelings, not just sights" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            {title:'Urban Adventures',desc:'Explore bustling neighborhoods like Shibuya, Harajuku, and Akihabara', icon: <FiMap className="w-5 h-5 text-white"/>},
            {title:'Culinary Hotspot',desc:'Discover world-class sushi, ramen, and street food delights', icon: <FiCoffee className="w-5 h-5 text-white"/>},
            {title:'History and Culture',desc:'Visit ancient temples and traditional japanese gardens', icon: <FiBookOpen className="w-5 h-5 text-white"/>},
            {title:'Iconic Landmarks',desc:'Tokyo Tower, Skytree, and the Imperial Palace', icon: <FiStar className="w-5 h-5 text-white"/>},
            {title:'Theme Park Fun',desc:'Tokyo Disneyland, Disneysea, and teamlab Borderless', icon: <FiActivity className="w-5 h-5 text-white"/>}
          ].map((i,idx)=> (
            <div key={idx} className={`${cardBase} p-6 bg-[#dbe6ff] border-0`}> 
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-3 shadow-sm">{i.icon}</div>
              <div className="text-gray-900 font-semibold text-xl leading-snug">{i.title}</div>
              <div className="text-gray-700 text-base mt-2 leading-relaxed">{i.desc}</div>
            </div>
          ))}
        </div>

        {/* Top Experiences */}
        <SectionTitle title="Top Experiences in Tokyo" subtitle="Handpicked activities you won’t want to miss" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {id:'exp-1',img:"/assests/33a78a0dcdf1d1823e83ba3352cf0334658964af.jpg",title:'Tokyo Skytree Admission & sky walk',desc:"Experience breathtaking 360 view from japan’s tallest tower"},
            {id:'exp-2',img:"/assests/82d848c3646f04ab0dc2a3ae700c08e4a248ad7a.jpg",title:'Tsukiji Outer Market food Tour',desc:'Taste the freshest sushi and local delicacies with expert guide'},
            {id:'exp-3',img:"/assests/7e86a0361d13544523f4aa1161b01cf29ab92c0a.jpg",title:'Team lab Borderless Digital Art Museum',desc:'Immerse yourself in interactive art installations'},
            {id:'exp-4',img:"/assests/bc0a1ae484b4f753f6128e80884b55998abfe858.jpg",title:'Mt. Fuji & Hakone Day Trip',desc:"Full day adventure to Japan’s most iconic mountain"},
          ].map((c)=> (
            <div
              key={c.id}
              className={`${cardBase} overflow-hidden cursor-pointer`}
              onClick={() => navigate('/product-details', { state: { product: c } })}
            >
              <div className="relative">
                <img src={c.img} alt="" className="h-44 w-full object-cover" />
                <button
                  onClick={() => toggleFavorite(c.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow"
                  aria-label="Toggle favourite"
                >
                  {favorites.has(c.id) ? (
                    <BsHeartFill className="text-red-500 w-5 h-5" />
                  ) : (
                    <BsHeart className="text-gray-700 w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                <div className="text-sm text-gray-600 mt-1">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Map preview (static, styled like screenshot) */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Navigate Tokyo</h3>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">Explore Before You Go</h4>
            <p className="text-base text-gray-600 mt-2">Hover over the markers to discover Tokyo's iconic locations and hidden treasures.</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden">
            <img src="/assests/tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan 2 (1).png" className="w-full h-[360px] object-cover" />
            <div className="absolute inset-0 bg-blue-900/40"></div>
            <div className="absolute left-4 bottom-4 text-white text-sm bg-blue-900/60 px-3 py-1 rounded-full">• Major Attractions</div>
            <div className="absolute left-8 top-1/3 bg-white rounded-xl shadow-md px-4 py-2 flex items-start gap-2">
              <FiMapPin className="text-blue-600 mt-1" />
              <div>
                <div className="text-gray-900 font-semibold text-sm">Shinjuku</div>
                <div className="text-gray-600 text-xs">Neon-lit entertainment district</div>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Tips */}
        <div className="mb-12">
          <SectionTitle title="Travel Trips for Tokyo" subtitle="Make the most of your visit with insider knowledge" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {n:1,title:'Best time to visit',desc:'Spring (march–may) for Cherry blossoms or autumn (september–november) for fall colors'},
              {n:2,title:'Transportation',desc:'Get a suica or pasmo IC card for seamless travel on trains and buses'},
              {n:3,title:'Language',desc:'English signage is common in major areas, but download a translation app for convenience'},
              {n:4,title:'Etiquette',desc:'Remove shoes when entering home and some restaurants; bow when greeting'}
            ].map((t) => (
              <div key={t.n} className={`${cardBase} p-5`}>
                <div className="flex items-start gap-3">
                  <div className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-[#1d236b] text-white font-bold flex items-center justify-center shadow leading-none">{t.n}</div>
                  <div>
                    <div className="text-gray-900 font-semibold text-base">{t.title}</div>
                    <div className="text-gray-600 text-sm mt-2 leading-relaxed">{t.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insider Knowledge */}
        <div className="mb-12">
          <SectionTitle title="Insider Knowledge" subtitle="Tokyo Secrets from Locals" />
          <p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">Pro tips you won't find in guidebooks — straight from people who call Tokyo home.</p>
          <div className={`${cardBase} p-8 relative overflow-hidden mx-auto max-w-4xl`}> 
            <button 
              onClick={prevTip}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-700 grid place-items-center shadow-sm hover:bg-gray-50 transition">‹</button>
            <button 
              onClick={nextTip}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-700 grid place-items-center shadow-sm hover:bg-gray-50 transition">›</button>

            <div className="max-w-3xl mx-auto text-center transition-all duration-300">
              <div className="mx-auto mb-6 w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                <div className="text-8xl md:text-9xl">{tokyoTips[currentTip].icon}</div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">{tokyoTips[currentTip].title}</h4>
              <p className="text-gray-700 mb-5">{tokyoTips[currentTip].description}</p>
              <button className="px-5 py-2 bg-[#1d236b] text-white rounded-lg text-sm shadow">Get Complete Tokyo Guide</button>
              
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {tokyoTips.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTip(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentTip ? 'bg-[#1d236b] w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Journey */}
        <div className="mb-16">
          <SectionTitle title="Visual Journey" subtitle="See Tokyo in Motion" />
          <p className="text-center text-gray-600 mb-6 max-w-4xl mx-auto">Experience Japan's culture, nightlife, and landmarks in stunning 4K quality.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
              {img:"/assests/33a78a0dcdf1d1823e83ba3352cf0334658964af.jpg", title:'Tokyo Nightlife', time:'4:23'},
              {img:"/assests/82d848c3646f04ab0dc2a3ae700c08e4a248ad7a.jpg", title:'Traditional Culture', time:'5:18'},
              {img:"/assests/7e86a0361d13544523f4aa1161b01cf29ab92c0a.jpg", title:'Street Food Tour', time:'3:22'},
              {img:"/assests/bc0a1ae484b4f753f6128e80884b55998abfe858.jpg", title:'Digital Art Museums', time:'7:10'}
            ].map((v,idx)=> (
            <div
              key={idx}
              className={`${cardBase} overflow-hidden cursor-pointer`}
              onClick={() => navigate('/product-details', { state: { video: v } })}
            >
                <div className="relative">
                  <img src={v.img} className="h-40 w-full object-cover" />
                  <button className="absolute left-4 bottom-4 w-10 h-10 bg-white rounded-full grid place-items-center shadow">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-900"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="text-gray-900 font-semibold text-base">{v.title}</div>
                  <div className="text-gray-800 text-xs flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                    <FiClock className="w-4 h-4"/>
                    <span className="ml-1">{v.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default TokyoPage


