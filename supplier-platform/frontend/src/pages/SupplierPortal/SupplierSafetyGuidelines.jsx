import React from 'react';
import { SupplierPortalHeader, SupplierPortalFooter } from '../../components/SupplierPortalChrome';

const SupplierSafetyGuidelines = () => {
  const guidelines = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Accurate Product Information",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      points: [
        "Always provide complete and truthful details about your tours or services (e.g., location, duration, activities, physical requirements, weather conditions).",
        "Avoid misleading images or descriptions that could cause confusion or safety concerns for travelers.",
        "Mention seasonal or weather-based safety notes (e.g., \"Mount Fuji tours may be restricted during heavy snowfall\")."
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Local Safety Compliance",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      points: [
        "Ensure all activities comply with local safety laws, permits, and tourism regulations.",
        "If your tour involves hiking, water sports, or adventure activities, confirm that all guides are certified and trained for emergencies.",
        "Keep insurance and emergency support ready for your customers where applicable."
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: "Equipment & Transportation Standards",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      points: [
        "Maintain all vehicles, equipment, and safety gear (helmets, harnesses, life jackets, etc.) in excellent condition.",
        "Conduct regular inspections and replace damaged or expired gear immediately.",
        "Only use licensed drivers and transport providers."
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Health & Emergency Preparedness",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      points: [
        "Inform travelers about any health risks, required fitness levels, or vaccination needs before booking.",
        "Have a first-aid kit and trained staff available during all tours.",
        "Prepare an emergency response plan — especially for remote or mountain areas."
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Responsible Tourism",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      points: [
        "Respect local culture, environment, and wildlife — and encourage travelers to do the same.",
        "Avoid over-crowding or activities that may cause environmental harm or cultural disturbance.",
        "Promote eco-friendly practices, such as limiting plastic waste."
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Communication & Support",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      points: [
        "Provide a working contact number or on-ground representative during all tours.",
        "Inform customers about meeting points, timing, and safety instructions clearly before departure.",
        "Respond quickly to any Trip Adora team inquiries or traveler complaints related to safety."
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: "Continuous Improvement",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      points: [
        "Report any accidents or safety incidents to Trip Adora immediately.",
        "Take feedback seriously and update your tours or safety measures as needed.",
        "Regularly train your staff on safety, customer care, and emergency handling."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <SupplierPortalHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1d236b] to-[#2a2f7f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Supplier Safety Guidelines
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-4">
              At Trip Adora, we prioritize the safety and trust of every traveler. As a supplier, your responsibility goes beyond creating unique travel experiences — it's about ensuring they are safe, responsible, and reliable.
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              Please review and follow these safety guidelines when uploading or managing your travel products.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Guidelines Grid */}
          <div className="space-y-8">
            {guidelines.map((guideline, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${guideline.borderColor} transform hover:-translate-y-1`}
              >
                <div className={`flex items-center space-x-4 bg-gradient-to-r ${guideline.color} text-white p-6`}>
                  <div className="flex-shrink-0">
                    {guideline.icon}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {index + 1}. {guideline.title}
                  </h2>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    {guideline.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${guideline.color} flex items-center justify-center`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed flex-1">
                          {point}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Remember Box */}
          <div className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4">Remember:</h3>
                <p className="text-xl mb-4 leading-relaxed">
                  Safety builds trust — and trust builds bookings.
                </p>
                <p className="text-lg text-emerald-50 leading-relaxed">
                  By following these guidelines, you not only protect your travelers but also strengthen your credibility and reputation on Trip Adora.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <SupplierPortalFooter />
    </div>
  );
};

export default SupplierSafetyGuidelines;

