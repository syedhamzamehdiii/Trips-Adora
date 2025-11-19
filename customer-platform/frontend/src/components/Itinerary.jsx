
import React from 'react';
import { Clock } from 'lucide-react';

export default function Itinerary({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tour Itinerary</h1>
        <p className="text-sm text-gray-500">Your personalized travel plan at a glance</p>
      </div>

      <div className="flex items-center gap-3 rounded-lg px-4 py-2.5 bg-[#DBEAFE] w-fit mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Clock className="w-4 h-4 text-gray-700" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">One day Tour</span>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((step, idx) => (
          <div key={idx} className="pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-bold text-black">{step.title || step.location || `Stop ${idx + 1}`}</h3>
              {step.time && (
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  {step.time}
                </span>
              )}
            </div>
            {step.ticket && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-black">Ticket:</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  {step.ticket}
                </span>
              </div>
            )}
            {step.description && (
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{step.description}</p>
            )}
            {Array.isArray(step.activities) && step.activities.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-black mb-2">Activities:</p>
                <div className="flex flex-wrap gap-2">
                  {step.activities.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-6 pt-4">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <h3 className="text-base font-bold text-black">Finished - Return</h3>
        </div>
      </div>
    </div>
  );
}
