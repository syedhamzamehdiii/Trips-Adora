import React from 'react'

const tiers = [
  {
    title: 'Flexible (recommended)',
    details: [
      'Full refund up to 24 hours before start time.',
      '50% refund up to 12 hours.',
      'No-show or same-day cancellations are non-refundable.'
    ]
  },
  {
    title: 'Moderate',
    details: [
      'Full refund up to 72 hours before start time.',
      '50% refund up to 24 hours.',
      'Operator may offer credits in lieu of cash refunds.'
    ]
  },
  {
    title: 'Strict',
    details: [
      'Full refund up to 7 calendar days before start time.',
      'After 7 days, non-refundable unless force majeure.',
      'Best for limited inventory or bespoke charters.'
    ]
  }
]

const SupplierRefundPolicy = () => (
  <main className="min-h-screen bg-[#f7f8ff] py-16 px-6">
    <div className="max-w-5xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-12">
      <header className="space-y-3">
        <p className="uppercase tracking-[0.35em] text-xs text-[#1d236b]/70">Partner Refund Framework</p>
        <h1 className="text-3xl font-extrabold text-[#0f143a]">Transparent policies that protect both guests and creators.</h1>
        <p className="text-slate-600">
          Choose one of the presets below or request a bespoke agreement for ultra-premium products. 
          All policies are displayed clearly to travellers during checkout and in confirmation emails.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div key={tier.title} className="rounded-3xl border border-slate-100 bg-[#f9faff] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#10143a] mb-4">{tier.title}</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {tier.details.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1d236b]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-[#101c63] text-white space-y-3">
          <h3 className="text-xl font-semibold">Force majeure handling</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            When natural disasters, government restrictions, or health advisories prevent travel, TripsAdora automatically waives supplier penalties. 
            We collaborate with you to offer rescheduling or credits to maintain loyalty.
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-[#f6f7ff] text-sm text-slate-600 space-y-3">
          <h3 className="text-lg font-semibold text-[#10143a]">Dispute resolution</h3>
          <p>
            Travellers can escalate via the 24/7 support desk. Our mediation team reviews chat logs, manifest data, GPS logs, and policies to reach a fair outcome. 
            Partners can submit evidence within 72 hours of notification.
          </p>
          <p>Need a custom clause? Contact finance@tripsadora.com for contract-level adjustments.</p>
        </div>
      </section>
    </div>
  </main>
)

export default SupplierRefundPolicy

