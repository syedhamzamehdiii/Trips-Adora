import React from 'react'

const sections = [
  {
    title: 'Data we collect',
    content: [
      'Business identity: company name, registration numbers, addresses, tax IDs.',
      'Operational records: tour logistics, capacity, guide rosters, and insurance coverage.',
      'Financial data: payout schedules, bank identifiers, billing contacts, transaction history.',
      'Engagement signals: messages, reviews, performance metrics, and platform behaviour.'
    ]
  },
  {
    title: 'How we use your data',
    content: [
      'Verify compliance, licence validity, and local regulatory requirements.',
      'Process bookings, settle payouts, and detect fraud or misuse across the network.',
      'Deliver insights, marketing opportunities, and support tailored to your vertical.',
      'Meet legal obligations, audits, and law-enforcement requests when applicable.'
    ]
  },
  {
    title: 'Your controls & rights',
    content: [
      'Request a full export of supplier data at any time via privacy@tripsadora.com.',
      'Update or delete information from the dashboard (some records retained for legal reasons).',
      'Opt-out of marketing communications while still receiving transactional updates.',
      'Assign data-processing roles to team members with audit trails for every change.'
    ]
  }
]

const SupplierPrivacyPolicy = () => (
  <main className="min-h-screen bg-[#f4f6ff] py-16 px-6">
    <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-10">
      <header className="space-y-3 text-left">
        <p className="uppercase tracking-[0.35em] text-xs text-[#1d236b]/70">Supplier Privacy Policy</p>
        <h1 className="text-3xl font-extrabold text-[#0f1438]">Protecting partner data is foundational.</h1>
        <p className="text-slate-600">
          This summary explains how TripsAdora collects, stores, and uses supplier information. For signed enterprise addendums, 
          refer to your DPA or reach out to privacy@tripsadora.com.
        </p>
        <p className="text-sm text-slate-500">Last updated: January 2025</p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-bold text-[#10163d]">{section.title}</h2>
          <ul className="space-y-2 text-slate-600 text-sm leading-relaxed list-disc pl-6">
            {section.content.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ))}

      <section className="bg-[#f6f7ff] rounded-3xl p-6 space-y-3 text-sm text-slate-600">
        <p>Data residency: primary storage in the EU with geo-redundant backups in the US and UAE. SOC 2 Type II and ISO 27001 certified.</p>
        <p>Need a custom agreement or SCCs? Email privacy@tripsadora.com. We respond within five business days.</p>
      </section>
    </div>
  </main>
)

export default SupplierPrivacyPolicy

