import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { 
  FiUser, 
  FiMapPin, 
  FiCreditCard, 
  FiTrendingUp, 
  FiCalendar,
  FiChevronDown,
  FiMail,
  FiPhone
} from 'react-icons/fi';

const FAQPage = () => {
  const navigate = useNavigate();
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedQuestion(expandedQuestion === key ? null : key);
  };

  const faqCategories = [
    {
      id: 'account',
      title: 'Account & Registration',
      icon: <FiUser className="text-[#1d236b]" size={20} />,
      questions: [
        {
          question: 'How do I create a supplier account?',
          answer: 'To create a supplier account, click on the "Register" button on our homepage. Fill in your company details, contact information, and upload required documentation. Our team will review your application within 24-48 hours and send you a confirmation email once approved.'
        },
        {
          question: 'What documents do I need to register as a tour supplier?',
          answer: 'You will need to provide: 1) Valid business registration documents, 2) Tour operator license (if applicable), 3) Insurance certificates, 4) Tax identification number, and 5) Bank account details for payments. All documents must be current and clearly legible.'
        },
        {
          question: 'How long does the verification process take?',
          answer: 'The verification process typically takes 24-48 hours during business days. However, during peak seasons or if additional documentation is required, it may take up to 5 business days. You will receive email updates throughout the process.'
        }
      ]
    },
    {
      id: 'listings',
      title: 'Listing Tours',
      icon: <FiMapPin className="text-[#1d236b]" size={20} />,
      questions: [
        {
          question: 'How do I create and publish a tour listing?',
          answer: 'Navigate to the "Listings" section in your dashboard, click "Create new product", fill in all tour details including title, description, pricing, availability, and images. Review your listing and click "Submit for Review". Once approved by our team, your listing will go live on the platform.'
        },
        {
          question: 'What makes a tour listing more attractive to customers?',
          answer: 'High-quality photos, detailed descriptions, clear pricing, accurate availability, customer reviews, and competitive rates make listings more attractive. Include highlights, itinerary details, inclusions/exclusions, and cancellation policies. Tours with instant confirmation and flexible cancellation tend to get more bookings.'
        },
        {
          question: 'Can I edit my tour listings after they are published?',
          answer: 'Yes, you can edit your listings anytime from your dashboard. Changes to pricing, descriptions, and images go live immediately. However, changes to tour structure or policies may require re-approval from our team to ensure quality standards.'
        }
      ]
    },
    {
      id: 'bookings',
      title: 'Bookings & Payments',
      icon: <FiCreditCard className="text-[#1d236b]" size={20} />,
      questions: [
        {
          question: 'How and when do I receive payments?',
          answer: 'Payments are processed within 24 hours after tour completion. You receive 85% of the booking amount (15% platform commission). Funds are transferred to your registered bank account via direct deposit. You can track all payments in the Finance section of your dashboard.'
        },
        {
          question: 'What commission does the platform charge?',
          answer: 'TripsAdora charges a 15% commission on each confirmed booking. This covers payment processing, customer support, platform maintenance, and marketing. There are no hidden fees or monthly charges. You only pay when you get bookings.'
        },
        {
          question: 'How do I handle cancellations and refunds?',
          answer: 'Cancellations are handled according to your specified cancellation policy. If a customer cancels, refunds are processed automatically based on your policy terms. You can set flexible, moderate, or strict cancellation policies. Our support team helps mediate any disputes.'
        }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & Growth',
      icon: <FiTrendingUp className="text-[#1d236b]" size={20} />,
      questions: [
        {
          question: 'How can I increase bookings for my tours?',
          answer: 'Optimize your listings with quality photos and detailed descriptions, offer competitive pricing, maintain high availability, respond quickly to inquiries, encourage customer reviews, participate in promotional campaigns, and use seasonal pricing strategies. Our Insights dashboard provides analytics to help you optimize performance.'
        },
        {
          question: 'Do you provide marketing materials and support?',
          answer: 'Yes! We provide marketing support including featured listings opportunities, email campaigns to our customer base, social media promotion, seasonal marketing campaigns, and SEO optimization. Premium suppliers get additional marketing benefits and priority placement in search results.'
        },
        {
          question: 'How do I track my tour performance and analytics?',
          answer: 'Access the "Insights" section in your dashboard to view detailed analytics including views, bookings, conversion rates, revenue trends, popular tours, customer demographics, and seasonal patterns. Use this data to optimize pricing and marketing strategies.'
        }
      ]
    },
    {
      id: 'activity',
      title: 'Activity Management',
      icon: <FiCalendar className="text-[#1d236b]" size={20} />,
      questions: [
        {
          question: 'How do I manage my tour schedules and availability?',
          answer: 'Use the "Availability" calendar in your dashboard to set available dates and time slots. You can block dates, set different pricing for peak/off-peak seasons, manage capacity, and set booking cutoff times. The calendar syncs in real-time to prevent overbooking.'
        },
        {
          question: 'Can I modify or cancel scheduled tours?',
          answer: 'Yes, you can modify tour details up to 24 hours before the scheduled time. For cancellations initiated by you, customers receive full refunds, and cancellation fees may apply. In case of emergencies or force majeure, contact our support team for assistance.'
        },
        {
          question: 'How do I handle group sizes and capacity management?',
          answer: 'Set minimum and maximum group sizes for each tour in your listing settings. The system automatically stops accepting bookings when capacity is reached. You can also offer private tours with different pricing and manage waitlists for fully booked tours.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header activePage="faq" />

      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the help center
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Find answers to common questions about becoming a tour supplier, managing your listings, and growing your business on our platform.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for a topic (cancellations, meeting point, etc...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-12 py-4 bg-gray-100 border-none rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d236b]"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {category.icon}
                  <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, questionIndex) => {
                  const isExpanded = expandedQuestion === `${categoryIndex}-${questionIndex}`;
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
                          className={`flex-shrink-0 ml-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'transform rotate-180' : ''
                          }`}
                          size={20}
                        />
                      </button>
                      {isExpanded && (
                        <div className="mt-3 text-gray-600 text-sm leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#1d236b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Still need help?</h2>
            <p className="text-gray-600 text-lg">
              Can't find what you're looking for? Our friendly support team is here to help you with any questions or concerns.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={() => navigate('/support')}
              className="flex items-center space-x-2 bg-[#1d236b] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1d236b]/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Start a Chat</span>
            </button>
            <button
              onClick={() => navigate('/support')}
              className="flex items-center space-x-2 bg-white text-[#1d236b] px-8 py-3 rounded-lg font-medium border-2 border-[#1d236b] hover:bg-gray-50 transition-colors"
            >
              <FiMail size={18} />
              <span>Send Email</span>
            </button>
            <button className="flex items-center space-x-2 bg-white text-[#1d236b] px-8 py-3 rounded-lg font-medium border-2 border-[#1d236b] hover:bg-gray-50 transition-colors">
              <FiPhone size={18} />
              <span>Call Support</span>
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Average response time: Less than 2 hours. Support available 24/7 for urgent booking issues.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FAQPage;

