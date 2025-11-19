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

const FukuokaPage = () => {
  const [favorites, setFavorites] = useState(new Set())
  const navigate = useNavigate()
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fukuoka_favorites')
      if (raw) setFavorites(new Set(JSON.parse(raw)))
    } catch (_) {}
  }, [])

  const toggleFavorite = (e, id, item) => {
    e.stopPropagation()
    
    // Get or initialize wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist')
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : []
    
    // Check if tour is already in wishlist
    const isInWishlist = wishlist.some(item => item.id === id)
    
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        // Also remove from wishlist
        const updatedWishlist = wishlist.filter(item => item.id !== id)
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
        try {
          window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: updatedWishlist }))
        } catch (_) {}
      } else {
        next.add(id)
        
        // Add to wishlist if not already there
        if (!isInWishlist && item) {
          const tourForWishlist = {
            id: item.id,
            name: item.title || item.name,
            image: item.img || item.image,
            price: item.price || '$245/person',
            rating: 4.8,
            reviews: '384',
            tags: ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
            host: 'TripsAdora',
            oldPrice: null,
            isPrivate: true,
            isTripadurasChoice: false,
            duration: '8 hours',
            groupSize: 'Up to 12',
            location: 'Fukuoka Japan'
          }
          
          const updatedWishlist = [...wishlist, tourForWishlist]
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
          try {
            window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: updatedWishlist }))
          } catch (_) {}
        }
      }
      try { localStorage.setItem('fukuoka_favorites', JSON.stringify(Array.from(next))) } catch (_) {}
      return next
    })
  }

  const fukuokaTips = [
    {
      title: "Best yatai stalls for authentic tonkotsu",
      description: "Local favorite Nagahama Ramen serves the creamiest tonkotsu broth. Arrive early to beat the crowds!",
      icon: "🍜"
    },
    {
      title: "Hidden beach escapes",
      description: "Momochi Beach is great, but Nokonoshima Island and Uminonakamichi Seaside Park offer quieter alternatives!",
      icon: "🏖️"
    },
    {
      title: "Best time to visit Fukuoka Castle",
      description: "Visit during cherry blossom season (late March) or autumn for stunning castle grounds without summer crowds.",
      icon: "🏯"
    },
    {
      title: "Local seafood secrets",
      description: "Nakasu district has amazing fish markets. Try horse mackerel sashimi and fugu restaurants if you're adventurous!",
      icon: "🐟"
    },
    {
      title: "Authentic hot spring experiences",
      description: "Day trips to Beppu and Yufuin offer better onsen experiences than in-city options. Book early!",
      icon: "♨️"
    },
    {
      title: "Karaage fried chicken gems",
      description: "Fukuoka is the birthplace of karaage! Try Hakata-style karaage at izakayas in Tenjin district.",
      icon: "🍗"
    }
  ]

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % fukuokaTips.length)
  }

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + fukuokaTips.length) % fukuokaTips.length)
  }

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      {/* Hero */}
      <div
        className="relative h-[520px] w-full"
        style={{
          backgroundImage: "url('/assests/Fukuoka.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-end pb-10">
          <div className="text-white max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-snug drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">
              <span className="block">Where Coastal Beauty</span>
              <span className="block mt-2">Meets Authentic Flavor.</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              Discover Kyushu's vibrant gateway city, known for pristine beaches, legendary ramen, and the perfect blend of urban energy and seaside tranquility.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* What we love */}
        <SectionTitle title="What we Love Here:" subtitle="Fukuoka speaks in taste, not just views" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            {title:'Ramen Paradise',desc:'Try authentic tonkotsu ramen at yatai food stalls and famous ramen shops', icon: <FiCoffee className="w-5 h-5 text-white"/>},
            {title:'Beach Destinations',desc:'Relax at Momochi Beach and scenic islands like Nokonoshima', icon: <FiStar className="w-5 h-5 text-white"/>},
            {title:'Historical Sites',desc:'Explore ancient ruins of Dazaifu Tenmangu and Ohori Park', icon: <FiBookOpen className="w-5 h-5 text-white"/>},
            {title:'Shopping Paradise',desc:'Shop at Canal City Hakata and Tenjin downtown district', icon: <FiMap className="w-5 h-5 text-white"/>},
            {title:'Hot Springs',desc:'Unwind in nearby onsen towns like Beppu and Yufuin', icon: <FiActivity className="w-5 h-5 text-white"/>}
          ].map((i,idx)=> (
            <div key={idx} className={`${cardBase} p-6 bg-[#dbe6ff] border-0`}> 
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-3 shadow-sm">{i.icon}</div>
              <div className="text-gray-900 font-semibold text-xl leading-snug">{i.title}</div>
              <div className="text-gray-700 text-base mt-2 leading-relaxed">{i.desc}</div>
            </div>
          ))}
        </div>

        {/* Top Experiences */}
        <SectionTitle title="Top Experiences in Fukuoka" subtitle="Handpicked activities you won't want to miss" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {id:'exp-1',img:"/assests/Screenshot 2025-11-03 at 11.07.29 AM.png",title:'Hakata Ramen Food Tour',desc:"Discover authentic tonkotsu ramen at famous yatai stalls"},
            {id:'exp-2',img:"/assests/Screenshot 2025-11-03 at 11.07.41 AM.png",title:'Ohori Park & Ancient Castle Ruins',desc:'Stroll through historic gardens and peaceful lake views'},
            {id:'exp-3',img:"/assests/Screenshot 2025-11-03 at 11.07.53 AM.png",title:'Momochi Beach & Seaside Mall',desc:'Enjoy beach activities and modern shopping complex'},
            {id:'exp-4',img:"/assests/Screenshot 2025-11-03 at 11.07.29 AM.png",title:'Dazaifu Tenmangu Shrine Visit',desc:"Experience beautiful plum blossoms and shrine architecture"},
          ].map((c)=> (
            <div
              key={c.id}
              className={`${cardBase} overflow-hidden cursor-pointer`}
              onClick={() => navigate('/product-details', { state: { product: c } })}
            >
              <div className="relative">
                <img src={c.img} alt="" className="h-44 w-full object-cover" />
                <button
                  onClick={(e) => toggleFavorite(e, c.id, c)}
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

        {/* Map preview */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Navigate Fukuoka</h3>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">Explore Before You Go</h4>
            <p className="text-base text-gray-600 mt-2">Hover over the markers to discover Fukuoka's beaches and authentic experiences.</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden">
            <img src="/assests/tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan 2 (1).png" className="w-full h-[360px] object-cover" />
            <div className="absolute inset-0 bg-blue-900/40"></div>
            <div className="absolute left-4 bottom-4 text-white text-sm bg-blue-900/60 px-3 py-1 rounded-full">• Major Attractions</div>
            <div className="absolute left-8 top-1/3 bg-white rounded-xl shadow-md px-4 py-2 flex items-start gap-2">
              <FiMapPin className="text-blue-600 mt-1" />
              <div>
                <div className="text-gray-900 font-semibold text-sm">Hakata</div>
                <div className="text-gray-600 text-xs">Ramen and yatai district</div>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Tips */}
        <div className="mb-12">
          <SectionTitle title="Travel Trips for Fukuoka" subtitle="Make the most of your visit with insider knowledge" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {n:1,title:'Best time to visit',desc:'Spring (march–april) for plum blossoms or autumn (november–december) for mild weather'},
              {n:2,title:'Transportation',desc:'Use subway and buses with IC card; airport subway connects directly to city'},
              {n:3,title:'Food Culture',desc:'Try yatai food stalls along Nakasu river; cash preferred, most open evenings'},
              {n:4,title:'Beach Etiquette',desc:'Respect local customs; keep beaches clean and swim only in designated areas'}
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
          <SectionTitle title="Insider Knowledge" subtitle="Fukuoka Secrets from Locals" />
          <p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">Pro tips you won't find in guidebooks — straight from people who call Fukuoka home.</p>
          <div className={`${cardBase} p-8 relative overflow-hidden mx-auto max-w-4xl`}> 
            <button 
              onClick={prevTip}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-700 grid place-items-center shadow-sm hover:bg-gray-50 transition">‹</button>
            <button 
              onClick={nextTip}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-700 grid place-items-center shadow-sm hover:bg-gray-50 transition">›</button>

            <div className="max-w-3xl mx-auto text-center transition-all duration-300">
              <div className="mx-auto mb-6 w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                <div className="text-8xl md:text-9xl">{fukuokaTips[currentTip].icon}</div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">{fukuokaTips[currentTip].title}</h4>
              <p className="text-gray-700 mb-5">{fukuokaTips[currentTip].description}</p>
              <button className="px-5 py-2 bg-[#1d236b] text-white rounded-lg text-sm shadow">Get Complete Fukuoka Guide</button>
              
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {fukuokaTips.map((_, idx) => (
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
          <SectionTitle title="Visual Journey" subtitle="See Fukuoka in Motion" />
          <p className="text-center text-gray-600 mb-6 max-w-4xl mx-auto">Experience Japan's coastal beauty, ramen culture, and hidden beaches in stunning 4K quality.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
              {img:"/assests/Screenshot 2025-11-03 at 11.07.29 AM.png", title:'Coastal Beaches', time:'6:18'},
              {img:"/assests/Screenshot 2025-11-03 at 11.07.41 AM.png", title:'Ramen Culture', time:'5:33'},
              {img:"/assests/Screenshot 2025-11-03 at 11.07.53 AM.png", title:'City Life', time:'4:27'},
              {img:"/assests/Screenshot 2025-11-03 at 11.07.29 AM.png", title:'Historic Shrines', time:'5:55'}
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

export default FukuokaPage
