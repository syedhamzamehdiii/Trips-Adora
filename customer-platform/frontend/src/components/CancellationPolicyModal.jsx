import React from 'react'
import PropTypes from 'prop-types'
import { X, Info, ShieldCheck, CheckCircle2 } from 'lucide-react'

const scheduleColors = [
  { bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'text-emerald-600' },
  { bg: 'bg-blue-50', border: 'border-blue-100', accent: 'text-blue-600' },
  { bg: 'bg-amber-50', border: 'border-amber-100', accent: 'text-amber-600' },
  { bg: 'bg-rose-50', border: 'border-rose-100', accent: 'text-rose-600' }
]

const scheduleFallbackLabels = ['Full Refund', 'Partial Refund', 'Small Refund', 'No Refund']

const CancellationPolicyModal = ({ policy, onClose }) => {
  if (!policy) return null

  const freeCancellationText = (policy.freeCancellationText || policy.free_cancellation_text || '').trim()
  const safeSchedule = Array.isArray(policy.schedule) ? policy.schedule : []
  const safeNotes = Array.isArray(policy.notes) ? policy.notes.filter(note => note && note.trim()) : []

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <button
          type="button"
          aria-label="Close cancellation policy"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto max-h-[90vh]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Cancellation & Refund Policy
            </h2>
          </div>

          {freeCancellationText && (
            <div className="flex items-start gap-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <ShieldCheck className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">{freeCancellationText}</p>
              </div>
            </div>
          )}

          {safeSchedule.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Refund Schedule</h3>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Info className="w-4 h-4" />
                  Supplier provided timeline
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {safeSchedule.map((tier, index) => {
                  const colors = scheduleColors[index % scheduleColors.length]
                  const percentValue =
                    typeof tier.percentage === 'number'
                      ? `${tier.percentage}%`
                      : tier.percentage || ''
                  const label = tier.label || scheduleFallbackLabels[index % scheduleFallbackLabels.length]
                  const note = tier.note || 'Timeline not specified'

                  return (
                    <div
                      key={`${label}-${index}`}
                      className={`${colors.bg} border ${colors.border} rounded-2xl p-4 text-center shadow-sm`}
                    >
                      <div className={`text-3xl font-bold ${colors.accent}`}>
                        {percentValue || label || '—'}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-2">{label}</div>
                      <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{note}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {safeNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h3>
              <ul className="space-y-2">
                {safeNotes.map((note, index) => (
                  <li key={`policy-note-${index}`} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    </span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

CancellationPolicyModal.propTypes = {
  policy: PropTypes.shape({
    freeCancellationText: PropTypes.string,
    free_cancellation_text: PropTypes.string,
    schedule: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        note: PropTypes.string
      })
    ),
    notes: PropTypes.arrayOf(PropTypes.string)
  }),
  onClose: PropTypes.func.isRequired
}

export default CancellationPolicyModal

