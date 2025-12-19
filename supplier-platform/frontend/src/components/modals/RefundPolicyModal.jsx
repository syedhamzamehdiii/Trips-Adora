import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const RefundPolicyModal = ({ isOpen, onClose }) => {
  const [refundPolicy, setRefundPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchRefundPolicy = async () => {
        try {
          setLoading(true);
          setError(null);
          // Fetch from supplier platform API
          const response = await apiService.get('/settings/platform');
          if (response?.refund_policy) {
            setRefundPolicy(response.refund_policy);
          } else {
            // Default fallback
            setRefundPolicy({
              tiers: [
                { percentage: 100, days: 3, label: "Before 12:00 PM, Sep 14" },
                { percentage: 50, days: 1, label: "Before 12: PM, Aug 15" },
                { percentage: 25, days: 0, label: "Before 12: PM, Aug 16" },
                { percentage: 0, days: 0, label: "Before 12: PM, Aug 16" }
              ],
              notes: [
                "Guests can cancel any time before check-in and receive a ful refund if they cancel at least 24 hours before check-in.",
                "If guests cancel less than 24 hours before check-in, they will not receive a refund",
                "This policy applies to all bookings made after January 4, 2026"
              ],
              free_cancellation_until: null
            });
          }
        } catch (err) {
          console.error('Failed to fetch refund policy:', err);
          setError('Failed to load refund policy');
          // Use default fallback
          setRefundPolicy({
            tiers: [
              { percentage: 100, days: 3, label: "Before 12:00 PM, Sep 14" },
              { percentage: 50, days: 1, label: "Before 12: PM, Aug 15" },
              { percentage: 25, days: 0, label: "Before 12: PM, Aug 16" },
              { percentage: 0, days: 0, label: "Before 12: PM, Aug 16" }
            ],
            notes: [
              "Guests can cancel any time before check-in and receive a ful refund if they cancel at least 24 hours before check-in.",
              "If guests cancel less than 24 hours before check-in, they will not receive a refund",
              "This policy applies to all bookings made after January 4, 2026"
            ],
            free_cancellation_until: null
          });
        } finally {
          setLoading(false);
        }
      };
      fetchRefundPolicy();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full p-8 text-center">
          <p>Loading refund policy...</p>
        </div>
      </div>
    );
  }

  const policy = refundPolicy || {
    tiers: [],
    notes: [],
    free_cancellation_until: null
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancellation & Refund Policy</h1>
            <p className="text-gray-600">Manage your cancellation and refund settings</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Free Cancellation Info */}
          {policy.free_cancellation_until && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-blue-700 font-medium">
                Free Cancellation until {policy.free_cancellation_until}
              </p>
            </div>
          )}

          {/* Refund Schedule */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Schedule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {policy.tiers && policy.tiers.length > 0 ? (
              policy.tiers.map((tier, index) => {
                const colors = [
                  { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', textDark: 'text-green-800' },
                  { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', textDark: 'text-blue-800' },
                  { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', textDark: 'text-yellow-800' },
                  { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', textDark: 'text-red-800' }
                ];
                const color = colors[index % colors.length];
                const label = tier.percentage === 100 ? 'Full Refund' : 
                             tier.percentage === 0 ? 'No Refund' : 
                             tier.percentage >= 50 ? 'Partial Refund' : 'Small Refund';
                
                return (
                  <div key={index} className={`${color.bg} ${color.border} border rounded-lg p-6 text-center`}>
                    <div className={`text-4xl font-bold ${color.text} mb-2`}>{tier.percentage}%</div>
                    <div className={`${color.textDark} font-semibold mb-3`}>{label}</div>
                    <div className={`${color.text} text-sm`}>{tier.label}</div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 text-center text-gray-500">No refund policy available</div>
            )}
          </div>

          {/* Important Notes */}
          {policy.notes && policy.notes.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Notes</h2>
              
              <div className="space-y-4 mb-8">
                {policy.notes.map((note, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-lg">{note}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#1d236b] text-white rounded-lg hover:bg-[#151a4f] transition-colors font-semibold"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyModal;


