import React, { useState } from 'react';
import { Mountain, Camera, Car, Globe, MapPin, Clock, Users, Package, CheckCircle, XCircle, HelpCircle, Eye, Utensils, Star, RefreshCw } from 'lucide-react';


const TourDetailPage = ({ onBack, fromRequestToApprove = false }) => {
  // Editable content state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('Mount Fuji Customized Tour Day tour');
  const [subtitle, setSubtitle] = useState('Discover the breathtaking beauty of Mount Fuji');
  const [mainImg, setMainImg] = useState('https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop');
  const [rightTopImg, setRightTopImg] = useState('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=240&fit=crop');
  const [rightBottomImg, setRightBottomImg] = useState('https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=240&fit=crop');
  const [description, setDescription] = useState('Discover the breathtaking beauty of Mount Fuji with a private guided tour from Tokyo, tailored for comfort and unforgettable memories.');
  const [tourDescription, setTourDescription] = useState("This one-day private tour from Tokyo offers an intimate exploration of Mount Fuji, Japan's iconic mountain. Travel in style and comfort aboard a private vehicle, accompanied by an English, Japanese, or Hindi-speaking professional guide who will take you through scenic spots like Lake Kawaguchi and Chureito Pagoda, offering incredible views and photo opportunities. The tour includes stops at a five-star rated dining experience and optional dining stops along the way. Enjoy personalized door-to-door pick-up, private vehicle comfort, and expert guidance, making it the perfect trip for families, couples, or groups seeking a personalized adventure.");
  const [highlights, setHighlights] = useState([
    'Visit iconic Mount Fuji viewpoints including Lake Kawaguchi',
    'Explore Chureito Pagoda for the perfect panoramic shots',
    'Comfortable private transport with flexible itinerary',
    'Multilingual guide (English, Japanese, Hindi available)'
  ]);
  const [galleryImages, setGalleryImages] = useState([
    'https://images.unsplash.com/photo-1576635192255-f79c6e3e4330?w=300&h=180&fit=crop',
    'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=300&h=180&fit=crop',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=180&fit=crop',
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=300&h=180&fit=crop',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=300&h=180&fit=crop',
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=300&h=180&fit=crop',
  ]);
  const [tripDetails, setTripDetails] = useState({
    guideType: 'Driver + Guide',
    accessibility: 'Wheelchair accessible, stroller friendly',
    thingsToCarry: ['Camera', 'Walking Shoes', 'Water Bottle', '+4 more'],
    activityType: 'Private, Customizable',
    languages: 'English, Japanese, Hindi'
  });
  const [included, setIncluded] = useState([
    'Private Mercedes-Benz A-Class vehicle',
    'Professional multilingual guide',
    'All entry tickets and fees',
    'Hotel pick-up and drop-off',
    'Bottled water during tour',
    'Wi-Fi in vehicle'
  ]);
  const [excluded, setExcluded] = useState([
    'Meals and personal dining expenses',
    'Personal shopping and souvenirs',
    'Travel insurance',
    'Gratuities (optional)',
    'Additional activities not mentioned'
  ]);
  const [vehicleDetails, setVehicleDetails] = useState('Mercedes-Benz A-Class (2018 model)');
  const [duration, setDuration] = useState('10 hours');
  const [price, setPrice] = useState('$ 240 Per Group');
  const [pickup, setPickup] = useState('Shibuya Crossing (Tokyo)');
  const [dropoff, setDropoff] = useState('Same as Pick-up');
  const [availableDays, setAvailableDays] = useState(['Monday', 'Tuesday', 'Friday', 'Wednesday']);
  const [timeSlots, setTimeSlots] = useState(['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00']);
  const [faqs, setFaqs] = useState([
    { q: 'What happens if Mount Fuji is not visible due to weather?', a: "We'll still visit all planned locations and provide cultural insights. The tour includes backup viewpoints and indoor cultural experiences." },
    { q: 'Can the itinerary be customized?', a: 'Yes! As a private tour, we can adjust timing and add optional stops based on your interests and preferences.' },
    { q: 'Is this tour suitable for elderly travelers?', a: 'Absolutely. The tour involves minimal walking and our vehicle is comfortable. We can adjust the pace as needed.' },
    { q: "What's the cancellation policy?", a: 'Free cancellation up to 24 hours before the tour. Weather-related cancellations are fully refundable.' }
  ]);

  return (
    <>
    <div className="min-h-screen bg-gray-50 px-0 py-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="mx-auto">
        {/* Top bar: Back (left) + action buttons (right) */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {onBack && (
              <button onClick={onBack} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100">Back</button>
            )}
          </div>
          {fromRequestToApprove && (
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 rounded-full text-white font-medium text-sm" style={{ backgroundColor: '#284078' }}>
                Remind me Later
              </button>
              <button className="px-6 py-2.5 rounded-full text-white font-medium text-sm" style={{ backgroundColor: '#284078' }}>
                Published
              </button>
            </div>
          )}
        </div>

        {/* Edit toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-green-700 text-xl">
            <span className="font-medium">Suppliers</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800">#TA-1002484</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800">Products</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800">Detail</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
          >
            {isEditing ? 'Done' : 'Edit content'}
          </button>
        </div>

        {/* Comprehensive editable panel */}
        {isEditing && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit All Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Main Title</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Subtitle</label>
                <input value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows="2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tour Description</label>
                <textarea value={tourDescription} onChange={(e)=>setTourDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows="3" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Main Image URL</label>
                <input value={mainImg} onChange={(e)=>setMainImg(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Top Right Image URL</label>
                <input value={rightTopImg} onChange={(e)=>setRightTopImg(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bottom Right Image URL</label>
                <input value={rightBottomImg} onChange={(e)=>setRightBottomImg(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Vehicle Details</label>
                <input value={vehicleDetails} onChange={(e)=>setVehicleDetails(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Duration</label>
                <input value={duration} onChange={(e)=>setDuration(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Price</label>
                <input value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Pick-up Location</label>
                <input value={pickup} onChange={(e)=>setPickup(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Drop-off Location</label>
                <input value={dropoff} onChange={(e)=>setDropoff(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Guide Type</label>
                <input value={tripDetails.guideType} onChange={(e)=>setTripDetails({...tripDetails, guideType: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Accessibility</label>
                <input value={tripDetails.accessibility} onChange={(e)=>setTripDetails({...tripDetails, accessibility: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Activity Type</label>
                <input value={tripDetails.activityType} onChange={(e)=>setTripDetails({...tripDetails, activityType: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Languages</label>
                <input value={tripDetails.languages} onChange={(e)=>setTripDetails({...tripDetails, languages: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Highlights (one per line)</label>
                <textarea value={highlights.join('\n')} onChange={(e)=>setHighlights(e.target.value.split('\n').filter(h => h.trim()))} className="w-full px-3 py-2 border rounded-lg text-sm" rows="4" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Gallery Images (one URL per line)</label>
                <textarea value={galleryImages.join('\n')} onChange={(e)=>setGalleryImages(e.target.value.split('\n').filter(img => img.trim()))} className="w-full px-3 py-2 border rounded-lg text-sm" rows="6" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Included Items (one per line)</label>
                <textarea value={included.join('\n')} onChange={(e)=>setIncluded(e.target.value.split('\n').filter(i => i.trim()))} className="w-full px-3 py-2 border rounded-lg text-sm" rows="6" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Excluded Items (one per line)</label>
                <textarea value={excluded.join('\n')} onChange={(e)=>setExcluded(e.target.value.split('\n').filter(e => e.trim()))} className="w-full px-3 py-2 border rounded-lg text-sm" rows="5" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Things to Carry (comma separated)</label>
                <input value={tripDetails.thingsToCarry.join(', ')} onChange={(e)=>setTripDetails({...tripDetails, thingsToCarry: e.target.value.split(',').map(t => t.trim())})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Available Days (comma separated)</label>
                <input value={availableDays.join(', ')} onChange={(e)=>setAvailableDays(e.target.value.split(',').map(d => d.trim()))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Time Slots (comma separated)</label>
                <input value={timeSlots.join(', ')} onChange={(e)=>setTimeSlots(e.target.value.split(',').map(t => t.trim()))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-2">FAQs (Format: Question|Answer, one per line)</label>
                <textarea 
                  value={faqs.map(f => `${f.q}|${f.a}`).join('\n')} 
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(l => l.trim());
                    setFaqs(lines.map(line => {
                      const [q, ...aParts] = line.split('|');
                      return { q: q?.trim() || '', a: aParts.join('|').trim() || '' };
                    }).filter(f => f.q && f.a));
                  }} 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  rows="8" 
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Left Column (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {/* Main Large Image */}
                <div className="row-span-2">
                  <img 
                    src={mainImg}
                    alt="Mount Fuji main view"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {/* Top Right Image */}
                <div>
                  <img 
                    src={rightTopImg}
                    alt="Mount Fuji view 2"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
                {/* Bottom Right Image */}
                <div>
                  <img 
                    src={rightBottomImg}
                    alt="Mount Fuji view 3"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              </div>
              {/* Description Box */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-800">{description}</p>
              </div>
            </div>

            {/* Tour Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Mountain className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Tour Description</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{tourDescription}</p>
            </div>

            {/* Tour Highlights */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900">Tour Highlights</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {highlights.map((highlight, idx) => {
                  const icons = [Mountain, Camera, Car, Globe];
                  const colors = [
                    { bg: 'bg-red-50', text: 'text-red-500' },
                    { bg: 'bg-green-50', text: 'text-green-500' },
                    { bg: 'bg-orange-50', text: 'text-orange-500' },
                    { bg: 'bg-blue-50', text: 'text-blue-500' }
                  ];
                  const Icon = icons[idx % icons.length];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center ${color.bg} rounded-lg flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{highlight}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Camera className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Photo Gallery</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.map((src, i) => (
                  <img key={i} src={src} alt={`Gallery ${i+1}`} className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Mountain className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Trip Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Guide Type</h3>
                    <p className="text-sm text-gray-600">{tripDetails.guideType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Accessibility</h3>
                    <p className="text-sm text-gray-600">{tripDetails.accessibility}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Things to Carry</h3>
                    <div className="flex flex-wrap gap-2">
                      {tripDetails.thingsToCarry.map((t) => (
                        <span key={t} className="text-xs text-gray-600">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Activity Type</h3>
                    <p className="text-sm text-gray-600">{tripDetails.activityType}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-8">
                <Globe className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Languages</h3>
                  <p className="text-sm text-gray-600">{tripDetails.languages}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Included</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {included.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Excluded</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {excluded.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Vehicle & Pricing */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Car className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Vehicle & Pricing</h2>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Vehicle Details</h3>
                    <p className="text-sm text-gray-600">{vehicleDetails}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Duration</h3>
                      <p className="text-sm text-gray-600">{duration}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Vehicle Details</h3>
                    <p className="text-sm text-gray-600">{vehicleDetails}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Pricing</h3>
                    <p className="text-xl font-bold text-green-600">{price}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pick-up & Drop-off */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-gray-900">Pick-up & Drop-off Location</h2>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Pick-up</h3>
                  <p className="text-sm text-gray-600 mb-6">• {pickup}</p>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Drop-off</h3>
                  <p className="text-sm text-gray-600">• {dropoff}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Days</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {availableDays.map((day, idx) => (
                      <span key={idx} className={`px-4 py-2 text-sm rounded-lg font-medium ${idx < 2 ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {day}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Time Slots</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {timeSlots.map((time) => (
                      <button key={time} className="px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50">
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-6">
                {faqs.map((faq, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Ready to Go Live Card */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-green-700">Ready to Go Live</h3>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-700">All requirements met</span>
                <span className="text-sm font-semibold text-green-700">20%</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-700">Commission Rate</span>
                <span className="text-sm font-semibold text-green-700">$192 Per Booking</span>
              </div>
              <div className="text-sm text-gray-700">Your Earnings</div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-purple-700">Next Steps</h3>
              </div>
              <ul className="space-y-2">
                <li className="text-sm text-purple-700">• Review all details above</li>
                <li className="text-sm text-purple-700">• Use Quick Actions to proceed</li>
                <li className="text-sm text-purple-700">• Monitor performance after publishing</li>
              </ul>
            </div>

            {/* Itinerary Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Itinerary</h3>
              </div>
              <div className="space-y-6">
                {[{
                  time: '06:00', title: 'Pick-up from Tokyo hotel', desc: 'Meet your professional guide and start your journey.', pill: {text:'Pickup', icon: Car, bg:'bg-cyan-100', color:'text-cyan-700'}
                },{
                  time: '09:00', title: 'Lake Kawaguchi visit (2 hrs)', desc: 'Enjoy stunning lake views and photo opportunities', pill: {text:'SightSeeing', icon: Eye, bg:'bg-green-100', color:'text-green-700'}
                },{
                  time: '11:30', title: 'Chureito Pagoda sight (1.5 hrs)', desc: 'Climb to the famous pagoda for panoramic views', pill: {text:'SightSeeing', icon: Eye, bg:'bg-green-100', color:'text-green-700'}
                },{
                  time: '14:00', title: 'Lunch break', desc: 'Traditional Japanese cuisine (own expense)', pill: {text:'Dining', icon: Utensils, bg:'bg-red-100', color:'text-red-700'}
                },{
                  time: '15:30', title: 'Mount Fuji 5th Station (2 hrs)', desc: "Get closer to Japan's highest mountain", pill: {text:'Highlight', icon: Star, bg:'bg-yellow-100', color:'text-yellow-700'}
                },{
                  time: '18:00', title: 'Scenic drive and photo stops', desc: 'Additional viewpoints and cultural insights', pill: {text:'Travel', icon: Car, bg:'bg-purple-100', color:'text-purple-700'}
                },{
                  time: '20:30', title: 'Drop-off in Tokyo', desc: 'Return to your hotel with unforgettable memories', pill: {text:'Drop off', icon: MapPin, bg:'bg-gray-100', color:'text-gray-700'}
                }].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">{item.time}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${item.pill.bg} ${item.pill.color}`}>
                        <item.pill.icon className="w-3 h-3" /> {item.pill.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
   
    </div>
       
    </>
  );
};

export default TourDetailPage;

