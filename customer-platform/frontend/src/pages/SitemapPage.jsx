import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Info, Gem, HelpCircle, FileText, User, Navigation, ShoppingCart, Heart, Search, Mountain } from 'lucide-react';
import HeaderLandingPage from '../components/HeaderLandingPage';
import Footer from '../components/Footer';

const SitemapPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLandingPage backgroundVariant="white" />
      
      {/* Hero Section with Heading */}
      <div className="bg-gradient-to-r from-[#1d236b] to-[#2d3a8f] text-white pt-24 pb-12 mb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center gap-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-lg">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Site Map</h1>
              <p className="text-blue-100 text-lg">Navigate through all pages and sections of TripsAdora</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {/* Homepage Sections */}
          <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-[#1d236b]/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
              <div className="bg-[#1d236b] p-3 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-[#1d236b] text-base">Homepage</h4>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm flex-1">
              <li><Link to="/dashboard" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Dashboard</Link></li>
              <li><Link to="/dashboard#top-picks" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Top Picks for You</Link></li>
              <li><Link to="/dashboard#tours" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Explore Our Tours</Link></li>
              <li><Link to="/dashboard#recently-viewed" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Recently Viewed</Link></li>
              <li><Link to="/dashboard#consultation" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Travel Consultation</Link></li>
              <li><Link to="/dashboard#places" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Places Section</Link></li>
              <li><Link to="/dashboard#top-destinations" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Top Destinations</Link></li>
              <li><Link to="/dashboard#top-attractions" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Top Attractions</Link></li>
              <li><Link to="/dashboard#choose-your-path" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Choose Your Path</Link></li>
            </ul>
          </div>

          {/* Main Pages */}
          <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-[#1d236b]/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
              <div className="bg-[#1d236b] p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-[#1d236b] text-base">Main Pages</h4>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm flex-1">
              <li><Link to="/about-us" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">About Us</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Contact Us</Link></li>
              <li><Link to="/blogs" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Blogs</Link></li>
              <li><Link to="/our-plans" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Our Plans</Link></li>
              <li><Link to="/search" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Search</Link></li>
            </ul>
          </div>

          {/* Attractions */}
          <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-[#1d236b]/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
              <div className="bg-[#1d236b] p-3 rounded-lg">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-[#1d236b] text-base">Attractions</h4>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm flex-1">
              <li><Link to="/top-attractions/tokyo" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Tokyo Attractions</Link></li>
              <li><Link to="/top-attractions/kyoto" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Kyoto Attractions</Link></li>
              <li><Link to="/top-attractions/osaka" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Osaka Attractions</Link></li>
              <li><Link to="/top-attractions/fukuoka" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Fukuoka Attractions</Link></li>
              <li><Link to="/attractions/tokyo-skytree" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Tokyo Skytree</Link></li>
              <li><Link to="/attractions/tokyo-tower" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Tokyo Tower</Link></li>
              <li><Link to="/attractions/arashiyama-bamboo-grove" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Arashiyama Bamboo Grove</Link></li>
            </ul>
          </div>

          {/* Shopping & Booking */}
          <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-[#1d236b]/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
              <div className="bg-[#1d236b] p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-[#1d236b] text-base">Shopping & Booking</h4>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm flex-1">
              <li><Link to="/cart" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Shopping Cart</Link></li>
              <li><Link to="/wishlist" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Wishlist</Link></li>
              <li>
                <Link
                  to="/search?compareFrom=pick-product"
                  onClick={scrollToTop}
                  className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200"
                >
                  Product Comparison
                </Link>
              </li>
              <li><Link to="/bookings" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">My Bookings</Link></li>
              <li><Link to="/check-availability" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Check Availability</Link></li>
              <li><Link to="/choose-vehicle" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Choose Vehicle</Link></li>
              <li><Link to="/payment-details" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Payment Details</Link></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-[#1d236b]/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
              <div className="bg-[#1d236b] p-3 rounded-lg">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-[#1d236b] text-base">Support & Help</h4>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm flex-1">
              <li><Link to="/support" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Help and Support</Link></li>
              <li><Link to="/faq" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-[#1d236b]/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
              <div className="bg-[#1d236b] p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-[#1d236b] text-base">Legal & Policies</h4>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm flex-1">
              <li><Link to="/privacy" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Privacy Policy</Link></li>
              <li><Link to="/supplier-registration" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Supplier Registration</Link></li>
            </ul>
          </div>

          {/* Account & Profile */}
          <div className={`bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-[#1d236b]/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '700ms', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
              <div className="bg-[#1d236b] p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-[#1d236b] text-base">Account & Profile</h4>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm flex-1">
              <li><Link to="/login" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Login</Link></li>
              <li><Link to="/register" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Register</Link></li>
              <li><Link to="/profile" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">My Profile</Link></li>
              <li><Link to="/profile/settings" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Profile Settings</Link></li>
              <li><Link to="/profile/wallet" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">My Wallet</Link></li>
              <li><Link to="/profile/reviews" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">My Reviews</Link></li>
              <li><Link to="/chat" onClick={scrollToTop} className="block py-1.5 px-2 rounded-md hover:bg-[#1d236b]/10 hover:text-[#1d236b] hover:translate-x-1 transition-all duration-200">Chat</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SitemapPage;

