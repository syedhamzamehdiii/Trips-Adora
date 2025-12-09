import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainHeader from '../../components/MainHeader'
import Footer from '../../components/Footer'
import { Bus } from "lucide-react"
import { Mountain, Eye, MapPin, Search, Play, Star as StarIcon, Calendar, List, Check, X, Camera, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPublishedProducts } from '../../services/productService'

const TokyoSkytreePage = () => {
  const navigate = useNavigate()
  const productsSectionRef = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const handleScrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Fetch Skytree-related products
  useEffect(() => {
    const fetchSkytreeProducts = async () => {
      try {
        setLoading(true)
        const searchTerms = ['tokyo skytree', 'skytree', 'oshiage', 'sumida', 'tokyo tower skytree']
        let allProducts = []
        for (const term of searchTerms) {
          const response = await getPublishedProducts({ search: term, page_size: 50 })
          if (response && response.products) {
            allProducts = [...allProducts, ...response.products]
          }
        }
        const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values())
        const filtered = uniqueProducts.filter(p => {
          const text = `${p.title || ''} ${p.description || ''} ${p.destination || ''} ${p.location || ''}`.toLowerCase()
          return searchTerms.some(term => text.includes(term.toLowerCase()))
        })
        setProducts(filtered.slice(0, 4))
      } catch (err) {
        console.error('Error fetching Skytree products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchSkytreeProducts()
  }, [])

  const handleBookNow = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Get or initialize cart from localStorage
    const savedCart = localStorage.getItem('cart')
    const cart = savedCart ? JSON.parse(savedCart) : []
    
    // Create cart item object
    const cartItem = {
      id: item.url, // Use URL as ID for now
      name: item.title,
      image: item.img,
      price: item.price,
      rating: item.rating,
      reviews: '384',
      tags: ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
      host: 'TripsAdora',
      duration: '8 hours',
      groupSize: 'Up to 12',
      location: 'Tokyo Skytree, Japan'
    }
    
    // Check if item is already in cart
    const isInCart = cart.some(item => item.id === cartItem.id)
    
    if (!isInCart) {
      // Add to cart
      const updatedCart = [...cart, cartItem]
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    }
    
    // Navigate to cart page
    navigate('/cart')
  }
  const heroImg = '/assests/Screenshot 2025-11-03 at 12.08.32 PM.png'
  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <div className="pt-4">
        {/* Hero */}
        <section className='relative w-full overflow-hidden'>
          <div className='relative h-[380px] sm:h-[460px] lg:h-[520px]'>
            <img src={heroImg} alt='Tokyo Skytree' className='absolute inset-0 w-full h-full object-cover' />
            <div className='absolute inset-0 bg-black/30'></div>
            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center'>
              <h1 style={{fontFamily:'Poppins'}} className='text-white text-[26px] sm:text-[34px] lg:text-[44px] font-bold leading-snug max-w-3xl'>
                Tokyo Skytree — Where Sky <br />Meets the City.
              </h1>
              <p style={{ fontFamily: 'Poppins' }} className="text-white/90 font-bold text-[18px] sm:text-[24px] mt-3 sm:mt-4 max-w-2xl">
                Japan's tallest tower, offering breathtaking 360° views of Tokyo from 634 meters above.
              </p>

              {/* hero feature pills */}
              <div className='mt-5 sm:mt-6 flex flex-wrap gap-3'>
                <div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
                  <svg className='w-4 h-4 text-[#284078]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 2v20M5 9l7-7 7 7'/></svg>
                  <span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>Height 634m</span>
                </div>
                <div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
                  <svg className='w-4 h-4 text-[#284078]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l3 3'/></svg>
                  <span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>Best Views Day & Night</span>
                </div>
                <div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
                  <svg className='w-4 h-4 text-[#284078]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z'/><circle cx='12' cy='10' r='3'/></svg>
                  <span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>Oshiage Station</span>
                </div>
              </div>

              {/* hero buttons */}
              <div className='mt-3 flex flex-wrap gap-3'>
                <div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
                  <svg className='w-4 h-4 text-[#8C8B8B]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='11' cy='12' r='1.5'/><path d='M5 12h6m0 0l6 3-6-3 6-3-6 3Z'/></svg>
                  <span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>View Experience</span>
                </div>
                <div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
                  <svg className='w-4 h-4 text-[#8C8B8B]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M8 5v14l11-7-11-7z'/></svg>
                  <span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>WatchTraveler Stories</span>
                </div>
              </div>
            </div>
          </div>
          <div className='w-full border-t border-[#E9ECF1] bg-white'></div>
        </section>

       

        {/* Tokyo Skytree at a Glance */}
        <section className='py-10 bg-[#ffffff]'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 style={{fontFamily:'Poppins'}} className='text-center text-[#302E2E] text-xl sm:text-2xl font-bold'>Tokyo Skytree at a Glance</h2>
            <p style={{fontFamily:'Poppins'}} className='text-center text-[#B0B3B9] font-medium mt-1 text-sm'>Discover the many facets of Japan's tallest broadcasting tower</p>
            <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
              {[
                {title:'360° Observation Decks',desc:'Tembo Deck & Galleria with stunning city views',Icon: Eye},
                {title:'Shopping & Dining',desc:'Tokyo Skytree Town with 300+ shops',Icon: List},
                {title:'Light Shows',desc:'Illumination displays featuring traditional colors',Icon: Camera},
                {title:'Solamachi Complex',desc:'Entertainment, aquarium, and cultural exhibits',Icon: ImageIcon},
              ].map((item,idx)=> (
                <div key={idx} className='rounded-xl bg-[#D9E3FF] shadow-sm p-6 text-center'>
                  <div className='mx-auto w-9 h-9 rounded-full bg-[#3B69E2] grid place-items-center mb-3'>
                    <item.Icon className='w-5 h-5 text-white' />
                  </div>
                  <h3 style={{fontFamily:'Poppins'}} className='text-[#302E2E] text-[24px] font-bold'>{item.title}</h3>
                  <p style={{fontFamily:'Poppins'}} className='text-[#6b7280] font-medium text-sm mt-1'>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exclusive Experience */}
        <section className="py-10 bg-[#F3F7FF] border-t border-[#E9ECF1]" ref={productsSectionRef} id="exclusive-experience">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 style={{ fontFamily: "Poppins" }} className="text-center text-[#302E2E] text-xl sm:text-2xl font-bold">
              Exclusive Experience
            </h2>
            <p style={{ fontFamily: "Poppins" }} className="text-center text-[#B0B3B9] font-medium mt-1 text-sm">
              Hand-picked tours and activities to make your visit unforgettable
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[#E9ECF1] rounded-xl overflow-hidden shadow-sm animate-pulse h-full">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p style={{ fontFamily: "Poppins" }} className="text-[#6b7280] font-medium">
                    No Tokyo Skytree experiences available right now. Check back soon!
                  </p>
                </div>
              ) : (
                products.map((product, i) => {
                  const fullDesc = product.description || product.tagline || 'Experience Tokyo Skytree'
                  const truncatedDesc = fullDesc.length > 100 ? fullDesc.substring(0, 100) + '...' : fullDesc
                  let imageUrl = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=400&fit=crop&q=80'
                  if (product.hero_image) {
                    imageUrl = typeof product.hero_image === 'string' ? product.hero_image : product.hero_image.url || imageUrl
                  } else if (product.images && product.images.length > 0) {
                    const firstImage = product.images[0]
                    imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || imageUrl
                  }
                  const item = {
                    id: product.id,
                    img: imageUrl,
                    title: product.title || 'Tokyo Skytree Experience',
                    desc: truncatedDesc,
                    badges: [
                      product.category && { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), bg: "#D3DFFF" },
                      product.activity_type && { label: product.activity_type, bg: "#CDFFD3" },
                    ].filter(Boolean).slice(0, 2),
                    price: product.price ? `$${Math.round(product.price).toLocaleString()}` : 'Price on request',
                    rating: product.rating || 0,
                    url: `/products/${product.id}`,
                    reviews: product.reviews_count?.toString() || '0',
                    location: product.location || product.destination || 'Tokyo Skytree, Japan'
                  }
                  return (
                    <Link to={item.url} key={item.id || i} className="block group focus:outline-none h-full">
                      <div className="bg-white border border-[#E9ECF1] rounded-xl overflow-hidden shadow-sm flex flex-col group-hover:shadow-md transition-shadow h-full">
                        <div className="h-40 bg-[#E1E3FF] relative rounded-xl overflow-hidden">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 flex items-center gap-2">
                            {item.badges.map((b, idx2) => (
                              <span key={idx2} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#E9ECF1]" style={{ fontFamily: "Poppins", backgroundColor: b.bg, color: "#284078" }}>
                                {b.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <h4 style={{ fontFamily: "Poppins" }} className="text-[#284078] font-bold text-base">
                            {item.title}
                          </h4>
                          <p style={{ fontFamily: "Poppins" }} className="text-[#6b7280] font-medium text-base mt-1 flex-1">
                            {item.desc}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F7F9FF] border border-[#E1E3FF]">
                              <StarIcon className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" stroke="none" />
                              <span className="text-[12px] text-[#302E2E] bg-[#E9ECF1]" style={{ fontFamily: "Poppins" }}>
                                {item.rating}
                              </span>
                            </span>
                            <span className="px-2 py-1 rounded-full bg-[#E9ECF1] border border-[#E9ECF1] text-[12px] font-bold text-[#302E2E]" style={{ fontFamily: "Poppins" }}>
                              {item.price}
                            </span>
                          </div>

                          <button 
                            onClick={(e) => handleBookNow(e, item)}
                            style={{ fontFamily: "Poppins" }} 
                            className="mt-3 bg-[#284078] text-white w-full py-2 rounded-md text-sm text-[14px] text-center hover:bg-[#1e2d56] transition"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {/* Insider Knowledge timeline */}
        <section className='py-12 bg-white relative'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <div className='absolute left-3 sm:left-6 top-0 bottom-0 w-[3px] bg-[#93B0FC] rounded-full'></div>
            <div className='text-center mb-8'>
              <h3 style={{fontFamily:'Poppins'}} className='text-xl sm:text-2xl font-bold text-[#302E2E]'>Insider Knowledge</h3>
              <p style={{fontFamily:'Poppins'}} className='text-[#B0B3B9] font-medium text-sm'>Expert tips to help you make the most of your Tokyo Skytree visit</p>
            </div>
            <div className='space-y-6'>
              {[
                {title:'Best Time to Visit',content: (
                  <div className='grid sm:grid-cols-2 gap-3'>
                    {[
                      {time:'Morning (9-11 AM)',desc:'Fewer crowds, clear views'},
                      {time:'Sunset (5-7 PM)',desc:'Golden hour and city lights'},
                      {time:'Evening (7-9 PM)',desc:'Tokyo Illumination spectacular'},
                      {time:'Weekdays',desc:'Avoid weekend rush hours'}
                    ].map((m,i)=> (
                      <div key={i} className='rounded-lg border py-5 border-[#E9ECF1] bg-[#FFFFFF] px-4 py-3'>
                        <p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-bold text-sm'>{m.time}</p>
                        <p style={{fontFamily:'Poppins'}} className='text-[#6b7280] font-medium text-xs mt-0.5'>{m.desc}</p>
                      </div>
                    ))}
                  </div>
                )},
                {title:'How to Visit',content:(
                  <ol className='space-y-3'>
                    <p className='font-medium text-[#302E2E]'>Step-by-Step Guide</p>
                    {[
                      'Take Tobu Skytree Line to Oshiage Station (exit A2)',
                      'Book tickets online in advance to save time',
                      'Visit Tembo Deck first (350m), then Tembo Galleria (450m)',
                      'Allow 2-3 hours for complete experience',
                      'Enjoy shopping and dining at Solamachi complex',
                    ].map((t,i)=> (
                      <li key={i} className='flex items-start gap-3 py-2'>
                        <span className='mt-0.5 grid place-items-center w-6 h-6 rounded-full bg-[#284078] text-[#FFFFFF] font-bold text-xs' style={{fontFamily:'Poppins'}}>{i+1}</span>
                        <p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-medium text-sm'>{t}</p>
                      </li>
                    ))}
                  </ol>
                )},
                {title:"Visitor Etiquette",content:(
                  <ul className='space-y-3'>
                    <p className='font-medium text-[#302E2E]'>Important Guidelines</p>
                    {[
                      {ok:true,text:'Book tickets in advance online for discounts'},
                      {ok:true,text:'Arrive 15 minutes before your time slot'},
                      {ok:false,text:"Don't bring large bags or luggage"},
                      {ok:true,text:'Use designated smoking areas only'},
                      {ok:false,text:"Don't touch the glass on observation deck"},
                    ].map((r,idx)=> (
                      <li key={idx} className='flex items-center gap-3 py-2 ms-4'>
                        <span className={`grid place-items-center w-7 h-7 rounded-full border ${r.ok ? 'border-[#34A853] text-[#34A853]' : 'border-[#C42121] text-[#C42121]'}`}>
                          <svg className='w-4 h-4' viewBox='0 0 20 20' fill='currentColor'>
                            {r.ok ? <path d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'/> : <path d='M4.293 4.293a1 1 0 011.414 0L12 10.586l6.293-6.293a1 1 0 111.414 1.414L13.414 12l6.293 6.293a1 1 0 01-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 01-1.414-1.414L10.586 12 4.293 5.707a1 1 0 010-1.414z'/>}
                          </svg>
                        </span>
                        <p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-medium text-sm'>{r.text}</p>
                      </li>
                    ))}
                  </ul>
                )},
                {title:'Best Photo Spots',content:(
                  <div className='space-y-3'>
                    {['Tembo Deck Windows','Skywalk Glass Floor','Entrance Area','Solamachi Rooftop'].map((n,i)=> (
                      <div key={i} className='flex items-center justify-between rounded-lg border border-[#D9E3FF] bg-[#FFFFFF] px-4 py-4'>
                        <div>
                          <p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-bold text-sm'>{n}</p>
                          <p style={{fontFamily:'Poppins'}} className='text-[#6b7280] font-medium text-xs'>Stunning views</p>
                        </div>
                        <span style={{fontFamily:'Poppins'}} className='text-[#284078] bg-[#E1E3FF] rounded-full px-2 py-0.5 text-xs text-[14px]'>Sunset</span>
                      </div>
                    ))}
                  </div>
                )}
              ].map((sec,idx)=> (
                <div key={idx} className='relative bg-[#F7F9FF] border border-[#E9ECF1] rounded-xl p-4 sm:p-6 ml-8'>
                  <div className='absolute -left-18 sm:-left-14 top-3 w-9 h-9 rounded-full bg-[#2D4A7C] border-4 border-[#E8EEF7] grid place-items-center text-white'>
                    <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      {idx===0 && <><rect x='3' y='4' width='18' height='18' rx='2' ry='2'/><line x1='3' y1='10' x2='21' y2='10'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='16' y1='2' x2='16' y2='6'/></>}
                      {idx===1 && <><path d='M3 20 L9 11 L13 16 L21 6'/><path d='M3 20 L21 20'/></>}
                      {idx===2 && <><path d='M12 2L15.09 8.26L22 9L17 13L18.18 20L12 16.77L5.82 20L7 13L2 9L8.91 8.26L12 2Z'/></>}
                      {idx===3 && <><path d='M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z'/><circle cx='12' cy='13' r='4'/></>}
                    </svg>
                  </div>
                  <h4 style={{fontFamily:'Poppins'}} className='text-[#302E2E] text-[24px] font-bold'>{sec.title}</h4>
                  <div className='mt-2'>
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plan Your Visit */}
        <section className='py-10 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h3 style={{fontFamily:'Poppins'}} className='text-center text-[#302E2E] text-xl sm:text-2xl font-bold'>Plan Your Visit</h3>
            <p style={{fontFamily:'Poppins'}} className='text-center text-[#B0B3B9] font-medium text-sm'>Everything you need to know for a seamless Tokyo Skytree experience</p>
            
            <div className="mt-7 flex flex-wrap justify-center gap-10">
              {[
                {
                  title: 'Getting There',
                  img: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?auto=format&fit=crop&w=1400&q=80', // Tokyo subway/commute
                  steps: [
                    { name: 'Tobu Skytree Line', info: 'Oshiage Station – 3 min walk' },
                    { name: 'Tokyo Metro', info: 'Hanzomon Line – 10 min walk' },
                    { name: 'JR Tobu Line', info: 'Kinshicho Station – 15 min walk' },
                    { name: 'Direct Bus', info: 'Tourist shuttle from major hotels' },
                  ],
                },
                {
                  title: 'Ticket Options',
                  img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=80',
                  steps: [
                    { name: 'Tembo Deck (350m)', info: 'Standard observation deck entry' },
                    { name: 'Tembo Galleria (450m)', info: 'Premium glass skywalk experience' },
                    { name: 'Combo Fast Pass', info: 'Skip queues + both decks' },
                    { name: 'Sunset Ticket', info: 'Special evening viewing slot' },
                  ],
                },
                {
                  title: 'Shopping & Dining',
                  img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1400&q=80',
                  steps: [
                    { name: 'Solamachi Complex', info: '300+ shops and restaurants' },
                    { name: 'Character Street', info: 'Pokemon, Hello Kitty stores' },
                    { name: 'Tokyo Skytree Mall', info: 'Fashion and souvenirs' },
                    { name: 'Observation Cafe', info: 'Dining with a view' },
                  ],
                },
                {
                  title: 'Nearby Attractions',
                  img: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80', // Sumida river / Skytree skyline
                  steps: [
                    { name: 'Sumida Aquarium', info: 'Underwater world experience' },
                    { name: 'Konica Minolta Planetarium', info: 'Star shows and astronomy' },
                    { name: 'Edo Museum', info: 'Traditional Japanese culture' },
                    { name: 'Senso-ji Temple', info: 'Historic Buddhist temple 15 min away' },
                  ],
                },
              ].map((card, idx) => (
                <div key={idx} className="w-full sm:w-[45%] lg:w-[40%] xl:w-[35%] rounded-xl border border-[#E9ECF1] overflow-hidden">
                  <div className="h-36 relative">
                    <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-[#3B69E2] pointer-events-none"></div>
                    <div className="absolute flex items-center left-4 bottom-3 text-white px-3 py-1 rounded-md text-sm font-semibold" style={{ fontFamily: 'Poppins' }}>
                      <div className="w-7 h-7 bg-[#284078] rounded-full flex items-center justify-center">
                        <Bus size={20} color="#FFFFFF" strokeWidth={2} />
                      </div>
                      {card.title}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-[#F7F9FF]">
                    {card.steps.map((step, n) => (
                      <div key={n} className="flex items-start gap-3 rounded-lg bg-white border border-[#E9ECF1] px-4 py-3">
                        <span className="grid place-items-center w-6 h-6 rounded-full bg-[#284078] text-white font-bold text-xs" style={{ fontFamily: 'Poppins' }}>
                          {n + 1}
                        </span>
                        <div>
                          <p style={{ fontFamily: 'Poppins' }} className="text-[#302E2E] font-bold text-sm">
                            {step.name}
                          </p>
                          <p style={{ fontFamily: 'Poppins' }} className="text-[#6b7280] font-medium text-xs">
                            {step.info}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pro tips + CTA */}
        <section className='py-8'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6'>
            <div className='w-full bg-[#3AA863] text-white rounded-2xl px-6 py-6'>
              <p style={{fontFamily:'Poppins'}} className='font-semibold text-base'>Pro Tips</p>
              <p style={{fontFamily:'Poppins'}} className='font-medium text-base mt-1'>Book tickets online 1-2 weeks in advance for 10% discount. Sunset time slots sell out fast – book early! Visit on weekdays to avoid 2+ hour queues on weekends.</p>
            </div>
          </div>
        </section>

        <div className='rounded-2xl h-full bg-gradient-to-r from-[#E9ECF1] via-[#B0B3B9] to-[#E9ECF1] border border-[#E9ECF1] px-6 py-10 text-center'>
          <h4 style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-bold text-2xl'>Experience Tokyo from Above</h4>
          <p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-medium text-[18px] mt-2 text-center'>
            Let Tokyo Skytree elevate your journey. Plan your visit today and see the world's tallest broadcasting tower from the inside out.
          </p>
          <div className='mt-6 flex items-center justify-center gap-3'>
              <button 
                onClick={handleScrollToProducts}
                style={{fontFamily:'Poppins'}} 
                className='bg-[#284078] text-white px-6 py-2.5 rounded-md text-sm font-semibold'
              >
                Start Your Adventure
              </button>
            <Link to="/search" style={{fontFamily:'Poppins'}} className='bg-white text-[#302E2E] border border-[#E9ECF1] px-6 py-2.5 rounded-md text-sm font-semibold inline-block'>View All Experience</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default TokyoSkytreePage

