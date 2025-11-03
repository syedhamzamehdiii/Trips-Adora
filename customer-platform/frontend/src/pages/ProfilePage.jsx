import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail, Phone, MapPin, CalendarDays, ArrowLeft, Heart, Gift } from 'lucide-react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="flex-1 min-w-[180px] bg-white rounded-2xl border border-gray-200 shadow p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-[22px] font-bold text-gray-900 leading-none">{value}</div>
      <div className="text-[12px] text-gray-600 mt-1">{label}</div>
    </div>
  </div>
)

const ProgressRow = ({ label, value }) => (
  <div className="mb-3">
    <div className="flex items-center justify-between text-[13px] text-gray-800 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
      <div className="h-full bg-blue-600" style={{ width: `${value}%` }} />
    </div>
  </div>
)

const ProfilePage = () => {
  // Profile type determines referral code (read-only)
  const profileType = 'johnning'
  const referralCode = profileType
  const [referrals] = useState(5)
  const [earned, setEarned] = useState(280)
  const [copied, setCopied] = useState(false)
  // Wishlist placeholder - will be replaced by backend data
  const [wishlist, setWishlist] = useState([])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (_) {}
  }

  // no persistence needed; referral code derives from profile type
  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back link */}
        <div className="mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
        <p className="text-gray-600 mb-6">Your Profile and Travel Journey</p>

        {/* Tabs */}
        <div className="mb-6">
          <div className="w-full bg-gray-100 rounded-[14px] p-1 flex items-center justify-between">
            {(() => {
              const location = useLocation()
              const tabs = [
                { label: 'Profile', to: '/profile' },
                { label: 'Wallet', to: '/profile/wallet' },
                { label: 'Setting', to: '/profile/settings' }
              ]
              return tabs.map((t) => {
                const isActive = location.pathname === t.to
                return (
                <Link
                  key={t.label}
                  to={t.to}
                  className={`px-5 py-2 rounded-[10px] text-[13px] text-center flex-1 mx-1 ${
                    isActive ? 'bg-[#1f3661] text-white shadow-sm' : 'text-gray-800'
                  }`}
                >
                  {t.label}
                </Link>
                )
              });
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative">
                <img src="/assests/richp.jpg" alt="profile" className="w-40 h-40 rounded-full object-cover mb-3" />
                <div className="absolute -bottom-1 right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-white text-[12px]">📷</div>
              </div>
              <div className="text-lg font-semibold text-gray-900">John Doe</div>
              <div className="text-sm text-gray-600">Premium Member</div>
            </div>

            <div className="space-y-3 text-sm text-gray-800">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-600" /> john.doe@example.com</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-600" /> +1 (555) 123-4567</div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-600" /> New York, USA</div>
              <div className="flex items-center gap-3"><CalendarDays className="w-4 h-4 text-gray-600" /> Member Since 2023</div>
            </div>

            <div className="mt-4">
              <button className="w-full bg-gray-800 hover:bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold">Edit Profile</button>
            </div>

            {/* Wishlist */}
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-900 font-semibold"><Heart className="w-4 h-4" /> My Wishlist ({wishlist.length})</div>
                <button className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-50">View All</button>
              </div>
              {wishlist.length === 0 ? (
                <div className="text-sm text-gray-600">No Items in Wishlist yet</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white">
                      <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{item.price}</div>
                        <button
                          onClick={() => setWishlist((w) => w.filter((x) => x.id !== item.id))}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Refer & Earn */}
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3"><Gift className="w-4 h-4" /> Refer & Earn</div>
              <div className="text-sm text-gray-600 mb-3">Invite friends, get rewards</div>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
                <button onClick={handleCopy} className="px-4 py-2 rounded-lg bg-[#1f3661] text-white text-sm min-w-[80px]">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-around mt-4 text-center">
                <div className="border rounded-xl px-7 py-4 bg-white">
                  <div className="w-16 text-center text-sm font-semibold">{referrals}</div>
                  <div className="text-xs text-gray-600">Referrals</div>
                </div>
                <div className="rounded-xl px-7 py-4 bg-white border">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-semibold">$</span>
                    <input
                      type="number"
                      className="w-16 text-center text-sm font-semibold bg-transparent outline-none"
                      value={earned}
                      onChange={(e) => setEarned(Number(e.target.value))}
                    />
                  </div>
                  <div className="text-xs text-gray-600">Earned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <StatCard value="3" label="Total Bookings" icon={CalendarDays} />
              <StatCard value="1" label="Active Bookings" icon={CalendarDays} />
              <StatCard value="2,450" label="Loyalty Points" icon={Gift} />
              <StatCard value="$600" label="Total Spent" icon={Gift} />
            </div>

            {/* Upcoming Trips */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b flex items-center gap-2 text-gray-900 font-semibold">Upcoming Trips</div>
              <div className="p-4 space-y-3">
                {[{title:'Tokyo Japan', date:'Nov 15, 2025', status:'Customized'}, {title:'Niko Tour', date:'Dec 20, 2025', status:'Pending'}].map((t)=> (
                  <div key={t.title} className="rounded-xl border border-[#b7d3ff] bg-[#e8f1ff] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/assests/place 1.jpg" alt="thumb" className="w-12 h-12 rounded object-cover" />
                      <div>
                        <div className="text-gray-900 font-semibold text-sm">{t.title}</div>
                        <div className="text-xs text-gray-600">{t.date}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status==='Customized' ? 'bg-[#7aff7a] text-[#0a4a0a]' : 'bg-[#e5ff57] text-[#5a5a00]'}`}>{t.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Preference */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="text-gray-900 font-bold mb-4">Travel Preference</div>
              <ProgressRow label="Adventure" value={85} />
              <ProgressRow label="Cultural" value={70} />
              <ProgressRow label="Relaxation" value={60} />
              <ProgressRow label="Food & Dining" value={90} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="text-gray-900 font-bold mb-4">Recent Activity</div>
              <ul className="space-y-4">
                {[{
                  iconBg:'bg-blue-50', iconColor:'text-blue-600', title:'Booked Tokyo City Tour', time:'2 day ago'
                },{
                  iconBg:'bg-yellow-50', iconColor:'text-yellow-500', title:'Added Item to Wishlist', time:'5 day ago'
                },{
                  iconBg:'bg-purple-50', iconColor:'text-purple-600', title:'Left Review for Paris Tour', time:'1 week ago'
                },{
                  iconBg:'bg-green-50', iconColor:'text-green-600', title:'Updated Profile Information', time:'2 week ago'
                }].map((a,idx)=> (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${a.iconBg} flex items-center justify-center`}>
                      <span className={`text-base ${a.iconColor}`}>●</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{a.title}</div>
                      <div className="text-xs text-gray-500">{a.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfilePage


