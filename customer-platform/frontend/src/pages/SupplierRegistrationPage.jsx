import React, { useState } from 'react';
import { FiCheck, FiBriefcase, FiUser, FiShield } from 'react-icons/fi';
import { FaPlus, FaMinus } from 'react-icons/fa';

const SupplierRegistrationPage = () => {
  const [selectedBusinessType, setSelectedBusinessType] = useState('company');
  const [employeeCount, setEmployeeCount] = useState(0);

  const businessTypes = [
    {
      id: 'company',
      title: 'Company',
      description: 'A registered business entity such as a private limited company, partnership, or corporation.',
      icon: FiBriefcase
    },
    {
      id: 'solo',
      title: 'Solo Trader',
      description: 'A single person operating independently, like a freelancer.',
      icon: FiUser
    },
    {
      id: 'private',
      title: 'Private',
      description: 'A charity, NGO, or educational institution that operates without profit motive.',
      icon: FiShield
    }
  ];

  const steps = [
    { id: 1, title: 'Business Type', completed: true, current: false },
    { id: 2, title: 'Business Identity', completed: false, current: true },
    { id: 3, title: 'ID Verification', completed: false, current: false },
    { id: 4, title: 'Terms & Conditions', completed: false, current: false }
  ];

  const handleEmployeeCountChange = (increment) => {
    if (increment) {
      setEmployeeCount(prev => prev + 1);
    } else {
      setEmployeeCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#c6dbfa' }}>
      {/* Header Section */}
      <div className="bg-white py-6 px-8">
        <div className="flex items-center relative">
          <div className="flex items-center">
            <img 
              src="/assests/loggo2.jpg" 
              alt="TripsAdora Logo" 
              className="w-[10rem] h-15"
            />
          </div>
          <h1 className="text-3xl font-bold text-black absolute left-1/2 transform -translate-x-1/2">Join us as a supplier partner</h1>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-8">

          {/* Progress Stepper */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-blue-500' : step.current ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {step.completed ? (
                      <FiCheck className="text-white text-sm" />
                    ) : (
                      <span className={`text-sm font-medium ${
                        step.completed || step.current ? 'text-white' : 'text-gray-600'
                      }`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-medium mt-2 ${
                    step.completed ? 'text-blue-500' : step.current ? 'text-black' : 'text-black'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed || step.current ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-black mb-2">How do you run your business?</h2>
            <p className="text-black mb-8">Select the business type the best describe your operations</p>

            {/* Business Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {businessTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedBusinessType === type.id;
                
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedBusinessType(type.id)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`text-xl ${
                          isSelected ? 'text-blue-500' : 'text-black'
                        }`} />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${
                        isSelected ? 'text-blue-500' : 'text-black'
                      }`}>{type.title}</h3>
                      <p className={`text-sm ${
                        isSelected ? 'text-blue-500' : 'text-black'
                      }`}>{type.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Employee Count Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-black mb-2">Add No. of Employees</h3>
              <p className="text-black mb-4">Enter the total number of people working in your business, including yourself.</p>
              
              <div className="flex items-center justify-center">
                <button
                  onClick={() => handleEmployeeCountChange(false)}
                  className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <FaMinus className="text-sm" />
                </button>
                
                <div className="mx-6 bg-white border-2 border-gray-200 rounded-lg px-6 py-3 min-w-[80px] text-center">
                  <span className="text-xl font-semibold text-black">{employeeCount}</span>
                </div>
                
                <button
                  onClick={() => handleEmployeeCountChange(true)}
                  className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
              <button className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegistrationPage;
