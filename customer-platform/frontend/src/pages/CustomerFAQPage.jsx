import React, { useMemo, useState, useEffect } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { FiChevronDown, FiMail, FiPhone, FiHelpCircle } from 'react-icons/fi'

const CustomerFAQPage = () => {
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setExpandedQuestion(expandedQuestion === key ? null : key)
  }

  // Customer questions (from your shared list)
  const faqCategories = useMemo(() => ([
    {
      id: 'general',
      title: 'General Questions',
      questions: [
        {
          question: 'What is TripsAdora?',
          answer:
            "TripsAdora is your smart travel companion to explore Japan's top attractions with insider tips, live weather, optimized routes, and curated experiences so you can plan effortlessly.",
        },
        {
          question: "What's the best time to visit Mount Fuji?",
          answer:
            'The official climbing season runs from early July to early September when weather is most stable and mountain huts are open. For viewing, late autumn to winter offers the clearest visibility.',
        },
        {
          question: 'Does TripsAdora show live weather updates?',
          answer:
            'Yes. You can check hourly forecasts for major attractions across Japan, with real‑time updates to help you avoid unexpected rain or storms and plan your day better.',
        },
        {
          question: 'How do I reach major attractions from Tokyo?',
          answer:
            'We provide public transport directions including JR lines, subway routes, and bus connections with approximate travel times and costs so you can journey efficiently.',
        },
        {
          question: 'How can I contact TripsAdora support?',
          answer:
            'Use the Contact page for chat and email, or call our hotline for urgent booking issues. Average response time is under 2 hours during business hours.',
        },
        {
          question: 'Do I need a JR Pass for traveling in Japan?',
          answer:
            'A JR Pass is great if you plan multiple long‑distance Shinkansen trips within 7–21 days. For city stays or a few short trips, local IC cards (Suica/PASMO) may be more cost‑effective.',
        },
      ],
    },
  ]), [])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories
    const q = searchQuery.toLowerCase()
    return faqCategories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (it) =>
            it.question.toLowerCase().includes(q) ||
            it.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.questions.length > 0)
  }, [faqCategories, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />

      {/* Hero */}
      <div className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Got Questions? We've Got Answers!
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8">
            Everything you need to know before planning your Japan adventure.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search FAQs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-12 py-3 md:py-4 bg-gray-100 border-none rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d236b]"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="space-y-6">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FiHelpCircle className="text-[#1d236b]" size={20} />
                  <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {category.questions.map((item, questionIndex) => {
                  const isExpanded = expandedQuestion === `${categoryIndex}-${questionIndex}`
                  return (
                    <div key={questionIndex} className="px-6 py-4">
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full flex items-center justify-between text-left group"
                      >
                        <span className="text-base font-medium text-gray-900 group-hover:text-[#1d236b] transition-colors">
                          {item.question}
                        </span>
                        <FiChevronDown
                          className={`ml-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          size={20}
                        />
                      </button>
                      {isExpanded && (
                        <div className="mt-3 text-gray-600 text-sm leading-relaxed">{item.answer}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Still need help */}
      <div className="bg-white border-t border-gray-200 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 md:mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHelpCircle className="w-8 h-8 text-[#1d236b]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Still need help?</h2>
            <p className="text-gray-600 text-base md:text-lg">
              Can't find what you're looking for? Our support team is here to help.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a href="/contact" className="flex items-center gap-2 bg-[#1d236b] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1d236b]/90 transition-colors">
              <span>Contact Support</span>
            </a>
            <a href="mailto:support@tripsadora.com" className="flex items-center gap-2 bg-white text-[#1d236b] px-8 py-3 rounded-lg font-medium border-2 border-[#1d236b] hover:bg-gray-50 transition-colors">
              <FiMail size={18} />
              <span>Send Email</span>
            </a>
            <a href="tel:+1800TRAVEL" className="flex items-center gap-2 bg-white text-[#1d236b] px-8 py-3 rounded-lg font-medium border-2 border-[#1d236b] hover:bg-gray-50 transition-colors">
              <FiPhone size={18} />
              <span>Call Support</span>
            </a>
          </div>

          <p className="text-sm text-gray-500">Average response time: under 2 hours. 24/7 for urgent booking issues.</p>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CustomerFAQPage


