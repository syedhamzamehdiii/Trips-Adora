import React, { useState } from 'react';
import { 
  FiSave, 
  FiEdit3, 
  FiUpload, 
  FiCompass, 
  FiStar, 
  FiCamera, 
  FiBriefcase, 
  FiUser, 
  FiTruck, 
  FiClock, 
  FiMapPin, 
  FiCalendar, 
  FiHelpCircle, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiPhone, 
  FiMail,
  FiGlobe,
  FiDollarSign,
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiChevronDown
} from 'react-icons/fi';

const MountFujiTourPage = () => {
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [language, setLanguage] = useState('US English');
  const [currency, setCurrency] = useState('$ USD - US Dollar');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

  const itineraryItems = [
    { time: '06:00', title: 'Pick-up from Tokyo hotel', description: 'Meet your professional guide and start your journey', icon: 'pickup' },
    { time: '09:00', title: 'Lake Kawaguchi visit (2 hrs)', description: 'Enjoy stunning lake views and photo opportunities', icon: 'sightseeing' },
    { time: '11:30', title: 'Chureito Pagoda sight (1.5 hrs)', description: 'Climb to the famous pagoda for panoramic views', icon: 'sightseeing' },
    { time: '14:00', title: 'Lunch break', description: 'Traditional Japanese cuisine (own expense)', icon: 'dining' },
    { time: '15:30', title: 'Mount Fuji 5th Station (2 hrs)', description: 'Get closer to Japan\'s highest mountain', icon: 'highlight' },
    { time: '18:00', title: 'Scenic drive and photo stops', description: 'Additional viewpoints and cultural insights', icon: 'travel' },
    { time: '20:30', title: 'Drop-off in Tokyo', description: 'Return to your hotel with unforgettable memories', icon: 'dropoff' }
  ];

  const highlights = [
    { icon: 'mountain', text: 'Visit iconic Mount Fuji viewpoints including Lake Kawaguchi' },
    { icon: 'camera', text: 'Explore Chureito Pagoda for the perfect panoramic shots' },
    { icon: 'car', text: 'Comfortable private transport with flexible itinerary' },
    { icon: 'guide', text: 'Multilingual guide (English, Japanese, Hindi available)' }
  ];

  const includedItems = [
    'Private Mercedes-Benz A-Class vehicle',
    'Professional multilingual guide',
    'All entry tickets and fees',
    'Hotel pick-up and drop-off',
    'Bottled water during tour',
    'Wi-Fi in vehicle'
  ];

  const excludedItems = [
    'Meals and personal dining expenses',
    'Personal shopping and souvenirs',
    'Travel insurance',
    'Gratuities (optional)',
    'Additional activities not mentioned'
  ];

  const faqs = [
    {
      question: 'What happens if Mount Fuji is not visible due to weather?',
      answer: 'We provide alternative viewpoints and cultural experiences. Weather conditions are monitored, and we adjust the itinerary accordingly.'
    },
    {
      question: 'Can the itinerary be customized?',
      answer: 'Yes, this is a private tour with flexible scheduling. We can accommodate special requests within the tour duration.'
    },
    {
      question: 'Is this tour suitable for elderly travelers?',
      answer: 'Absolutely. Our vehicle is wheelchair accessible and we can adjust the pace and activities based on your needs.'
    },
    {
      question: 'What\'s the cancellation policy?',
      answer: 'Free cancellation up to 24 hours before the tour. Full refund for weather-related cancellations.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-black">TripsAdora</h1>
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                <span>Tour</span>
                <span>→</span>
                <span>Travel & SightSeeing</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50">
                <FiEdit3 size={16} />
                <span>Save as Draft</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                <FiSave size={16} />
                <span>Save as Draft</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <FiUpload size={16} />
                <span>Publish Product</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Section */}
            <div className="relative">
              <img 
                src="/assets/WhatsApp Image 2025-10-15 at 3.49.28 PM.jpeg" 
                alt="Mount Fuji at sunset" 
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                <h2 className="text-white text-4xl font-bold text-center">
                  Discover the breathtaking beauty of Mount Fuji
                </h2>
              </div>
            </div>

            {/* Introduction */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-lg text-gray-800 leading-relaxed">
                Discover the breathtaking beauty of Mount Fuji with a private guided tour from Tokyo, 
                tailored for comfort and unforgettable memories.
              </p>
            </div>

            {/* Tour Description */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <FiCompass size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Tour Description</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Experience the magic of Mount Fuji on this exclusive one-day private tour designed for 
                comfort and adventure. Our professional guides will take you to the most scenic spots 
                including Lake Kawaguchi and the iconic Chureito Pagoda. Enjoy flexible scheduling, 
                cultural insights, and personalized attention throughout your journey. Perfect for 
                families, couples, or small groups seeking an authentic Japanese mountain experience.
              </p>
            </div>

            {/* Tour Highlights */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiStar size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Tour Highlights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {highlight.icon === 'mountain' && <span className="text-blue-600">🏔️</span>}
                        {highlight.icon === 'camera' && <FiCamera size={16} className="text-blue-600" />}
                        {highlight.icon === 'car' && <FiTruck size={16} className="text-blue-600" />}
                        {highlight.icon === 'guide' && <FiUser size={16} className="text-blue-600" />}
                      </div>
                      <p className="text-gray-700 text-sm">{highlight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiCamera size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Photo Gallery</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <img 
                  src="/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png" 
                  alt="Mount Fuji view 1" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img 
                  src="/assets/5e20accba877ebca3f7fd7f0a8f642697330bd69.png" 
                  alt="Mount Fuji view 2" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img 
                  src="/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png" 
                  alt="Mount Fuji view 3" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img 
                  src="/assets/5e20accba877ebca3f7fd7f0a8f642697330bd69.png" 
                  alt="Mount Fuji view 4" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img 
                  src="/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png" 
                  alt="Mount Fuji view 5" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img 
                  src="/assets/5e20accba877ebca3f7fd7f0a8f642697330bd69.png" 
                  alt="Mount Fuji view 6" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiBriefcase size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Trip Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <FiUser size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Guide Type</h4>
                      <p className="text-gray-600">Driver + Guide</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiBriefcase size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Things to Carry</h4>
                      <p className="text-gray-600">Camera, Walking Shoes, Water Bottle, +4 more</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiGlobe size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Languages</h4>
                      <p className="text-gray-600">English, Japanese, Hindi</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle size={20} className="text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Included</h4>
                      <ul className="text-gray-600 space-y-1">
                        {includedItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">♿</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Accessibility</h4>
                      <p className="text-gray-600">Wheelchair accessible, stroller friendly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiUser size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Activity Type</h4>
                      <p className="text-gray-600">Private, Customizable</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-red-600 mt-1">✗</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Excluded</h4>
                      <ul className="text-gray-600 space-y-1">
                        {excludedItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Pricing */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiTruck size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Vehicle & Pricing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start space-x-3">
                  <FiTruck size={20} className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Vehicle Details</h4>
                    <p className="text-gray-600">Mercedes-Benz A-Class (2018 model)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiClock size={20} className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Duration</h4>
                    <p className="text-gray-600">10 hours</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-900">$240</span>
                <span className="text-gray-600">Per Group</span>
              </div>
            </div>

            {/* Pick-up & Drop-off */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiMapPin size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Pick-up & Drop-off Location</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Pick-up</h4>
                    <p className="text-gray-600">Shibuya Crossing (Tokyo)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Drop-off</h4>
                    <p className="text-gray-600">Same as Pick-up</p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Available Days</h4>
                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedDay === day 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Time Slots</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2 rounded text-sm ${
                            selectedTime === time 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiHelpCircle size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Itinerary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiCalendar size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Itinerary</h3>
              </div>
              <div className="space-y-4">
                {itineraryItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-bold">{item.time}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                        <p className="text-gray-600 text-xs mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready to Go Live */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <FiCheckCircle size={20} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Ready to Go Live</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">All requirements met</span>
                  <span className="text-green-600 font-semibold">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Commission Rate</span>
                  <span className="text-gray-600">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Your Earnings</span>
                  <span className="text-green-600 font-semibold">$192 Per Booking</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <FiRefreshCw size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Next Steps</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Review all details above</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use Quick Actions to proceed</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Monitor performance after publishing</span>
                </li>
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <FiHelpCircle size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <FiPhone size={16} />
                  <span>Need Help?</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <FiMail size={16} />
                  <span>Email Support</span>
                </button>
                <div className="text-center text-sm text-gray-500">
                  <p>Support Hours: 9 AM - 6 PM (JST)</p>
                  <p>Response Time: Within 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Column 1 */}
            <div>
              <h4 className="font-semibold mb-4">Know About Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-300">About us</a></li>
                <li><a href="#" className="hover:text-blue-300">Careers</a></li>
                <li><a href="#" className="hover:text-blue-300">Contact</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-300">Destinations</a></li>
                <li><a href="#" className="hover:text-blue-300">Experiences</a></li>
                <li><a href="#" className="hover:text-blue-300">Tours</a></li>
                <li><a href="#" className="hover:text-blue-300">Activities</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold mb-4">Help & Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-300">FAQ</a></li>
                <li><a href="#" className="hover:text-blue-300">Contact Support</a></li>
                <li><a href="#" className="hover:text-blue-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-300">Refund Policy</a></li>
                <li><a href="#" className="hover:text-blue-300">Safety Guidelines</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-semibold mb-4">Stay Connected</h4>
              <p className="text-sm mb-4">Get travel deals & inspiration.</p>
              <div className="flex mb-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-3 py-2 rounded-l-lg text-gray-900 text-sm"
                />
                <button className="px-3 py-2 bg-blue-700 rounded-r-lg hover:bg-blue-600">
                  <FiMail size={16} />
                </button>
              </div>
              <p className="text-sm mb-3">Follow Us</p>
              <div className="flex space-x-3">
                <FiLinkedin size={20} className="hover:text-blue-300 cursor-pointer" />
                <FiInstagram size={20} className="hover:text-blue-300 cursor-pointer" />
                <FiFacebook size={20} className="hover:text-blue-300 cursor-pointer" />
                <FiTwitter size={20} className="hover:text-blue-300 cursor-pointer" />
              </div>
            </div>

            {/* Column 5 */}
            <div>
              <h4 className="font-semibold mb-4">Payments & Settings</h4>
              <div className="mb-4">
                <p className="text-sm mb-2">Payment Methods</p>
                <div className="flex space-x-2">
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">AE</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">MC</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">V</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">AP</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">PP</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">GP</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FiGlobe size={16} />
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-sm border-none outline-none"
                  >
                    <option value="US English">US English</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <FiDollarSign size={16} />
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent text-sm border-none outline-none"
                  >
                    <option value="$ USD - US Dollar">$ USD - US Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-blue-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm">©2025 TripAdora. All rights reserved.</p>
              <div className="flex items-center space-x-6 text-sm">
                <span className="flex items-center space-x-1">
                  <span>🔒</span>
                  <span>Secure Booking</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>👥</span>
                  <span>10M+ Travels</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>📞</span>
                  <span>+1-800-Travel</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>24/7 Support</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MountFujiTourPage;
