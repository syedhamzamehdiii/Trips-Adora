import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, Twitter, Globe, DollarSign, ShieldCheck, UsersRound, Phone, Headphones } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1d236b] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li><Link to="/about-us">About us</Link></li>
              <li><Link to="/about-us#careers">Careers</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Partner With Us</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li><a href="#">Become a Partner</a></li>
              <li><a href="#">Join as an Affiliate</a></li>
              <li><a href="#">Collaboration Inquiries</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li><a href="#">Case Studies</a></li>
              <li><a href="#">Resources</a></li>
              <li><Link to="/customer-reviews">Customer Reviews</Link></li>
            </ul>
          </div>
          {/* Payments & Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payments & Settings</h3>
            <div className="grid grid-cols-3 gap-4 sm:gap-4 md:gap-5 mb-4">
              <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[#1d236b] font-bold text-xs">AMEX</span>
              </div>
              <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[#1d236b] font-bold text-xs">Master</span>
              </div>
              <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[#1d236b] font-bold text-xs">Visa</span>
              </div>
              <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[#1d236b] font-bold text-xs">Apple</span>
              </div>
              <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[#1d236b] font-bold text-xs">PayPal</span>
              </div>
              <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[#1d236b] font-bold text-xs">Google</span>
              </div>
            </div>
          </div>
          
          {/* Stay Connected */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <div className="space-y-4">
              <p className="text-white">Get travel deals & inspiration</p>
              <div className="flex max-w-xs">
              <input 
                type="email" 
                placeholder="Enter your email" 
                  className="flex-1 px-3 py-2 bg-gray-400 text-white placeholder-white border border-gray-400 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded-r-lg transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Follow Us</h4>
                  <div className="flex space-x-3">
                    {/* Instagram */}
                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    {/* LinkedIn */}
                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    {/* Facebook */}
                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    {/* Twitter */}
                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Language</h4>
                  <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">US English</span>
                  </button>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Currency</h4>
                  <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">$ USD - US Dollar</span>
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/30 pt-4 flex flex-wrap items-center justify-between text-gray-200 text-xs">
          <div>© 2025 TripAdora. All rights reserved.</div>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2"><ShieldCheck size={16}/> Secure Booking</div>
            <div className="flex items-center gap-2"><UsersRound size={16}/> 10M+ Travels</div>
            <div className="flex items-center gap-2"><Phone size={16}/> +1-800-Travel</div>
            <div className="flex items-center gap-2"><Headphones size={16}/> 24/7 Support</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
