import React from 'react';

const KPICards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Bookings Card */}
      <div className="bg-green-50 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            {/* <p className="text-green-700 text-sm font-medium mb-1">Total Bookings</p> */}
            {/* <h3 className="text-green-800 text-3xl font-bold">25,015</h3> */}
            <div className="flex items-center mt-2">
              <span className="text-green-600 text-sm font-semibold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                12.5%
              </span>
              <span className="text-green-600 text-xs ml-2">This Month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings by % Card */}
      <div className="bg-yellow-50 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-700 text-sm font-medium mb-1">Earnings by %</p>
            <h3 className="text-yellow-800 text-3xl font-bold">$56,000</h3>
            <div className="flex items-center mt-2">
              <span className="text-green-600 text-sm font-semibold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +8.8%
              </span>
              <span className="text-green-600 text-xs ml-2">Growth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Rate Card */}
      <div className="bg-red-50 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-700 text-sm font-medium mb-1">Cancellation rate</p>
            <h3 className="text-red-800 text-3xl font-bold">-6%</h3>
            <div className="flex items-center mt-2">
              <span className="text-red-600 text-sm font-semibold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                -2%
              </span>
              <span className="text-red-600 text-xs ml-2">Last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICards;

