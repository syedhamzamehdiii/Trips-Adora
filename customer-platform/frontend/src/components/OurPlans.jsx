import React from 'react'
import helicopter from "../../assests/helicopter.jpg";
import sunshine from "../../assests/sun-shine.jpg";
import house from "../../assests/house.jpg";
import mountfuj from "../../assests/mount-fuj.jpg";
import { Bus } from "lucide-react";

import { Mountain, Eye, MapPin, Search, Play, Star as StarIcon, Calendar, List, Check, X, Camera, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


const OurPlans = () => {
    const navigate = useNavigate()
    const hero = '/assests/mount fuji.jpg'

    const handleBookNow = (e, item) => {
        e.preventDefault()
        e.stopPropagation()

        const savedCart = localStorage.getItem('cart')
        const cart = savedCart ? JSON.parse(savedCart) : []

        const cartItem = {
            id: item.url,
            name: item.title,
            image: item.img,
            price: item.price,
            rating: item.rating,
            reviews: '428',
            tags: ['Sightseeing','Local Food','Private Transport','HiddenGems','Photo Spots'],
            host: 'TripsAdora',
            duration: '8 hours',
            groupSize: 'Up to 12',
            location: 'Mount Fuji, Japan'
        }

        if (!cart.some(p => p.id === cartItem.id)) {
            localStorage.setItem('cart', JSON.stringify([...cart, cartItem]))
        }

        navigate('/cart')
    }

    return(
        <>
		{/* Hero */}
		<section className='relative w-full overflow-hidden'>
			<div className='relative h-[380px] sm:h-[460px] lg:h-[520px]'>
				<img src={hero} alt='Mount Fuji' className='absolute inset-0 w-full h-full object-cover' />
				<div className='absolute inset-0 bg-black/30'></div>
				<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center'>
					<h1 style={{fontFamily:'Poppins'}} className='text-white text-[26px] sm:text-[34px] lg:text-[44px] font-bold leading-snug max-w-3xl'>
						Mount Fuji — Where Heaven  <br />Touches Japan.
					</h1>
				<p
  style={{ fontFamily: 'Poppins' }}
  className="text-white/90 font-bold text-[18px] sm:text-[24px] mt-3 sm:mt-4 max-w-2xl"
>
  Japan's highest peak, a sacred symbol blending nature, spirituality, and art.
</p>

					{/* hero feature pills */}
					<div className='mt-5 sm:mt-6 flex flex-wrap gap-3'>
						<div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
							<svg className='w-4 h-4 text-[#284078]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 2v20M5 9l7-7 7 7'/></svg>
							<span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>Height 3,776m</span>
						</div>
						<div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
							<svg className='w-4 h-4 text-[#284078]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l3 3'/></svg>
							<span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>Best Viewing Oct- Feb</span>
						</div>
						<div className='flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#E9ECF1]'>
							<svg className='w-4 h-4 text-[#284078]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z'/><circle cx='12' cy='10' r='3'/></svg>
							<span style={{fontFamily:'Poppins', color:'#8C8B8B'}} className='text-[13px] font-medium'>From Tokyo 100 km</span>
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

		

		{/* Mount Fuji at a Glance */}
		<section className='py-10 bg-[#ffffff]'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<h2 style={{fontFamily:'Poppins'}} className='text-center text-[#302E2E] text-xl sm:text-2xl font-bold'>Mount Fuji at a Glance</h2>
				<p style={{fontFamily:'Poppins'}} className='text-center text-[#B0B3B9] font-medium mt-1 text-sm'>Discover the many facets of Japan's most iconic mountain</p>
				<div className='mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
					{[
						{title:'Cultural Significance',desc:"Fuji's role in Shinto & Buddhism",Icon: Mountain},
						{title:'Natural & Wildlife',desc:'Flora/Fauna around Fuji Five Lakes',Icon: ImageIcon},
						{title:'Festivals',desc:'Fujisan Fire festival, Cherry Blossom week',Icon: Calendar},
						{title:'Art & Poetry',desc:'Fuji in Ukiyo-e prints',Icon: Camera},
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
		<section className="py-10 bg-[#F3F7FF] border-t border-[#E9ECF1]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2
      style={{ fontFamily: "Poppins" }}
      className="text-center text-[#302E2E] text-xl sm:text-2xl font-bold"
    >
      Exclusive Experience
    </h2>
    <p
      style={{ fontFamily: "Poppins" }}
      className="text-center text-[#B0B3B9] font-medium mt-1 text-sm"
    >
      Hand-picked tours and activities to make your visit unforgettable
    </p>

    <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          img: mountfuj,
          title: "Mount Fuji Day Trip from Tokyo",
          desc: "Experience Japan’s most iconic peak on a comfortable guided tour from Tokyo.",
          badges: [
            { label: "Family Friendly", bg: "#CDFFD3" },
            { label: "Popular", bg: "#D3DFFF" },
          ],
          price: "$2,800",
          rating: 4.9,
          url: "/tours/mount-fuji-day-trip",
        },
        {
          img: sunshine,
          title: "Overnight Mount Fuji Climb",
          desc: "Climb Japan’s highest peak overnight and witness the magical sunrise.",
          badges: [
            { label: "Early Bird", bg: "#FFF1BB" },
            { label: "Adventure", bg: "#F1D8D3" },
          ],
          price: "$3,500",
          rating: 4.8,
          url: "/tours/overnight-mount-fuji-climb",
        },
        {
          img: house,
          title: "Traditional Ryokan Retreat",
          desc: "Relax in a traditional Japanese inn featuring private onsen hot springs.",
          badges: [
            { label: "Luxury", bg: "#D3DFFF" },
            { label: "Wellness", bg: "#CDFFD3" },
          ],
          price: "$4,200",
          rating: 4.7,
          url: "/stays/ryokan-retreat",
        },
        {
          img: helicopter,
          title: "Mount Fuji Helicopter Tour",
          desc: "Get a bird’s-eye view of Mount Fuji, Fuji Five Lakes, and the Tokyo skyline.",
          badges: [
            { label: "Luxury", bg: "#D3DFFF" },
            { label: "Adventure", bg: "#F1D8D3" },
          ],
          price: "$5,600",
          rating: 5.0,
          url: "/tours/mount-fuji-helicopter",
        },
      ].map((item, i) => (
        <Link to={item.url} key={i} className="block group focus:outline-none h-full">
        <div className="bg-white border border-[#E9ECF1] rounded-xl overflow-hidden shadow-sm flex flex-col h-full group-hover:shadow-md transition-shadow">
          <div className="h-40 bg-[#E1E3FF] relative rounded-xl overflow-hidden">
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {/* top badges */}
            <div className="absolute top-2 left-2 flex items-center gap-2">
              {item.badges.map((b, idx2) => (
                <span
                  key={idx2}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#E9ECF1]"
                  style={{
                    fontFamily: "Poppins",
                    backgroundColor: b.bg,
                    color: "#284078",
                  }}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h4
              style={{ fontFamily: "Poppins" }}
              className="text-[#284078] font-bold text-base"
            >
              {item.title}
            </h4>
            <p
              style={{ fontFamily: "Poppins" }}
              className="text-[#6b7280] font-medium text-base mt-1 flex-1"
            >
              {item.desc}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F7F9FF] border border-[#E1E3FF]">
                <StarIcon
                  className="w-3.5 h-3.5 text-yellow-400"
                  fill="currentColor"
                  stroke="none"
                />
                <span
                  className="text-[12px] text-[#302E2E] bg-[#E9ECF1]"
                  style={{ fontFamily: "Poppins" }}
                >
                  {item.rating}
                </span>
              </span>
              <span
                className="px-2 py-1 rounded-full bg-[#E9ECF1] border border-[#E9ECF1] text-[12px] font-bold text-[#302E2E]"
                style={{ fontFamily: "Poppins" }}
              >
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
      ))}
    </div>
  </div>
</section>


		{/* Insider Knowledge timeline */}
		<section className='py-12 bg-white relative'>
			<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
				{/* vertical blue line */}
				<div className='absolute left-3 sm:left-6 top-0 bottom-0 w-[3px] bg-[#93B0FC] rounded-full'></div>
				<div className='text-center mb-8'>
					<h3 style={{fontFamily:'Poppins'}} className='text-xl sm:text-2xl font-bold text-[#302E2E]'>Insider Knowledge</h3>
					<p style={{fontFamily:'Poppins'}} className='text-[#B0B3B9] font-medium text-sm'>Expert tips to help you make the most of your Mount Fuji adventure</p>
				</div>
				<div className='space-y-6'>
					{[
						{title:'When to Go',content: (
							<div className='grid sm:grid-cols-2 gap-3'>
								{['Jan–March','Apr–Jun','Jul–Sep','Oct–Dec'].map((m,i)=> (
									<div key={i} className='rounded-lg border py-5 border-[#E9ECF1] bg-[#FFFFFF] px-4 py-3'>
										<p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-bold text-sm'>{m}</p>
										<p style={{fontFamily:'Poppins'}} className='text-[#6b7280] font-medium text-xs mt-0.5'>Cherry blossoms, mild weather</p>
									</div>
								))}
							</div>
						)},
						{title:'How to Climb',content:(
							
							<ol className='space-y-3'>
								<p className='font-medium text-[#302E2E]'>Step-by-Step Journey</p>
								{[
									'Start at 5th Station (2,300m) – accessible by bus',
									'Choose your route: Yoshida Trail (most popular)',
									'Climb 5–7 hours to mountain huts for rest',
									'Summit at dawn for unforgettable sunrise',
									'Descend 3–5 hours, visit volcanic crater',
								].map((t,i)=> (
									<li key={i} className='flex items-start gap-3 py-2'>
										<span className='mt-0.5 grid place-items-center w-6 h-6 rounded-full bg-[#284078] text-[#FFFFFF]  font-bold text-xs' style={{fontFamily:'Poppins'}}>{i+1}</span>
										<p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-medium text-sm'>{t}</p>
									</li>
								))}
							</ol>
						)},
						{title:"Cultural Etiquette",content:(
							<ul className='space-y-3 '>
								<p className='font-medium weight text-[#302E2E]'>Local Dos and Don'ts</p>
								{[
									{ok:true,text:'Bow respectfully at shrines and temples'},
									{ok:true,text:'Take all trash with you – leave no trace'},
									{ok:false,text:"Don't climb off-season (Oct–Jun)"},
									{ok:true,text:'Dress modestly in sacred areas'},
									{ok:false,text:"Don't remove volcanic rocks as souvenirs"},
								].map((r,idx)=> (
									<li key={idx} className='flex items-center gap-3 py-2 ms-4'>
										<span className={`grid place-items-center w-7 h-7 rounded-full border ${r.ok ? 'border-[#34A853] text-[#34A853]' : 'border-[#C42121] text-[#C42121]'}`}>
											<svg className='w-4 h-4' viewBox='0 0 20 20' fill='currentColor'>
												{r.ok ? <path d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'/> : <path d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' stroke='currentColor' viewBox='0 0 20 20'  fill='currentColor'/>}
											</svg>
										</span>
										<p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-medium text-sm'>{r.text}</p>
									</li>
								))}
							</ul>
						)},
						{title:'Secret Photo Spots',content:(
							<div className='space-y-3'>
								{['Chureito Pagoda','Lake Kawaguchiko','Oshino Hakkai','Fuji Subaru Line at a Glance'].map((n,i)=> (
									<div key={i} className='flex items-center justify-between rounded-lg border border-[#D9E3FF] bg-[#FFFFFF] px-4 py-4'>
										<div>
											<p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-bold text-sm'>{n}</p>
											<p style={{fontFamily:'Poppins'}} className='text-[#6b7280] font-medium text-xs'>Iconic views</p>
										</div>
										<span style={{fontFamily:'Poppins'}} className='text-[#284078] bg-[#E1E3FF] rounded-full px-2 py-0.5 text-xs text-[14px]'>Sunrise</span>
									</div>
								))}
							</div>
						)}
					].map((sec,idx)=> (
						<div key={idx} className='relative bg-[#F7F9FF] border border-[#E9ECF1] rounded-xl p-4 sm:p-6 ml-8'>
							{/* left icon dot */}
					<div className='absolute -left-18 sm:-left-14 top-3 w-9 h-9 rounded-full bg-[#2D4A7C] border-4 border-[#E8EEF7] grid place-items-center text-white'>
  <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    {idx===0 && (
      <>
        <rect x='3' y='4' width='18' height='18' rx='2' ry='2'/>
        <line x1='3' y1='10' x2='21' y2='10'/>
        <line x1='8' y1='2' x2='8' y2='6'/>
        <line x1='16' y1='2' x2='16' y2='6'/>
      </>
    )}
    {idx===1 && (
      <>
        <path d='M3 20 L9 11 L13 16 L21 6'/>
        <path d='M3 20 L21 20'/>
      </>
    )}
    {idx===2 && (
      <>
        <line x1='12' y1='2' x2='12' y2='12'/>
        <line x1='12' y1='2' x2='10' y2='7'/>
        <line x1='12' y1='2' x2='14' y2='7'/>
        <line x1='12' y1='12' x2='12' y2='22'/>
        <path d='M18 7 L18 12 C18 13.1 17.1 14 16 14 L16 14 C14.9 14 14 13.1 14 12 L14 7'/>
        <circle cx='18' cy='17' r='3'/>
      </>
    )}
    {idx===3 && (
      <>
        <path d='M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z'/>
        <circle cx='12' cy='13' r='4'/>
      </>
    )}
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
				<div className='max-w-7xl mx-auto px-4  sm:px-6 lg:px-8'>
					<h3 style={{fontFamily:'Poppins'}} className='text-center text-[#302E2E] text-xl sm:text-2xl font-bold'>Plan Your Visit</h3>
					<p style={{fontFamily:'Poppins'}} className='text-center text-[#B0B3B9] font-medium text-sm'>Everything you need to know for a seamless Mount Fuji experience</p>
				
					<div className="mt-7 flex flex-wrap justify-center gap-10">
		  {[
		    {
		      title: 'Getting There',
		      img: mountfuj,
		      url: '/plan/getting-there',
		      steps: [
		        { name: 'Bullet Train (Shinkansen)', info: 'Tokyo to Shin-Fuji – 1 hour' },
		        { name: 'Express Bus', info: 'Tokyo to Kawaguchiko – 2 hours' },
		        { name: 'Rental Car', info: 'Drive from Tokyo – 2.5 hours' },
		        { name: 'Private Transfer', info: 'Direct from your hotel – 2 hours' },
		      ],
		    },
		    {
		      title: 'Where to Stay',
		      img: sunshine,
		      url: '/plan/where-to-stay',
		      steps: [
		        { name: 'Ryokan Inn', info: 'Traditional stay with onsen baths' },
		        { name: 'Mountain Lodge', info: 'Scenic views near Fuji Five Lakes' },
		        { name: 'Luxury Resort', info: 'Spa, fine dining, and lakefront' },
		        { name: 'Budget Hotel', info: 'Comfortable rooms near train station' },
		      ],
		    },
		    {
		      title: 'Local Cuisine',
		      img: house,
		      url: '/plan/local-cuisine',
		      steps: [
		        { name: 'Hōtō Noodles', info: 'Fuji’s signature comfort dish' },
		        { name: 'Fresh Trout', info: 'Grilled over charcoal' },
		        { name: 'Matcha Desserts', info: 'Local tea-infused sweets' },
		        { name: 'Sake Tasting', info: 'Brewed in the foothills of Fuji' },
		      ],
		    },
		    {
		      title: 'Tickets & Permits',
		      img: helicopter,
		      url: '/plan/tickets-and-permits',
		      steps: [
		        { name: 'Climbing Pass', info: 'Available during July–September' },
		        { name: 'Bus Pass', info: 'Unlimited local routes around Fuji' },
		        { name: 'Museum Entry', info: 'Mount Fuji World Heritage Center' },
		        { name: 'Tour Booking', info: 'Online or at visitor center' },
		      ],
		    },
		  ].map((card, idx) => (
		    <Link to={card.url} key={idx} className="w-full sm:w-[45%] lg:w-[40%] xl:w-[35%] rounded-xl border border-[#E9ECF1] overflow-hidden block group">
		      {/* IMAGE HEADER */}
		      <div className="h-36 relative ">
		        <img
		          src={card.img}
		          alt={card.title}
		          className="absolute inset-0 w-full h-full object-cover"
		        />
		        <div className="absolute inset-0 ring-1 ring-inset ring-[#3B69E2] pointer-events-none"></div>
		        <div
		          className="absolute flex items-center  left-4 bottom-3 /80 text-white px-3 py-1 rounded-md text-sm font-semibold"
		          style={{ fontFamily: 'Poppins' }}
		        >
				 <div className="w-7 h-7 bg-[#284078] rounded-full flex items-center justify-center">
		    <Bus size={20} color="#FFFFFF" strokeWidth={2} />
		  </div>
		          {card.title}
			  
		        </div>
		
		
		
		      </div>
		
		      {/* CONTENT */}
		      <div className="p-4 space-y-3 bg-[#F7F9FF]">
		        {card.steps.map((step, n) => (
		          <div
		            key={n}
		            className="flex items-start gap-3 rounded-lg bg-white border border-[#E9ECF1] px-4 py-3"
		          >
		            <span
		              className="grid place-items-center w-6 h-6 rounded-full bg-[#284078] text-white font-bold text-xs"
		              style={{ fontFamily: 'Poppins' }}
		            >
		              {n + 1}
		            </span>
		            <div>
		              <p
		                style={{ fontFamily: 'Poppins' }}
		                className="text-[#302E2E] font-bold text-sm"
		              >
		                {step.name}
		              </p>
		              <p
		                style={{ fontFamily: 'Poppins' }}
		                className="text-[#6b7280] font-medium text-xs"
		              >
		                {step.info}
		              </p>
		            </div>
		          </div>
		        ))}
		      </div>
		    </Link>
		  ))}
		</div>
		
				</div>
			</section>

		{/* Pro tips + CTA */}
		<section className='py-8'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6'>
				<div className='w-full bg-[#3AA863] text-white rounded-2xl px-6 py-6'>
					<p style={{fontFamily:'Poppins'}} className='font-semibold text-base'>Pro Tips</p>
					<p style={{fontFamily:'Poppins'}} className='font-medium text-base mt-1'>Book mountain huts 2–3 months in advance during climbing season (July–September). For the best photography, visit during early morning or late afternoon for softer light.</p>
				</div>
				
            </div>
        </section>
		<div className='rounded-2xl h-full   bg-gradient-to-r from-[#E9ECF1] via-[#B0B3B9] to-[#E9ECF1] border border-[#E9ECF1] px-6 py-10 text-center'>
					<h4 style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-bold text-2xl'>Experience the Spirit of Fuji</h4>
					<p style={{fontFamily:'Poppins'}} className='text-[#302E2E] font-medium text-[18px] mt-2 text-center'> Let Fuji's spirit awaken your wanderlust. Plan your journey today and discover the timeless beauty <br />  that has inspired pilgrims and artists for millennia. </p>
					<div className='mt-6 flex items-center justify-center gap-3'>
						<button style={{fontFamily:'Poppins'}} className='bg-[#284078] text-white px-6 py-2.5 rounded-md text-sm font-semibold'>Start Your Adventure</button>
						<Link to="/search" style={{fontFamily:'Poppins'}} className='bg-white text-[#302E2E] border border-[#E9ECF1] px-6 py-2.5 rounded-md text-sm font-semibold inline-block'>View All Experience</Link>
					</div>
				</div>
        </>
    )
}
export default OurPlans