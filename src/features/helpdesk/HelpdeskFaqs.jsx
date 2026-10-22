import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { SearchInput } from '../../components/common/SearchInput';

export const HelpdeskFaqs = () => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What should a beneficiary do if amount is debited via SBI ePay but demand status shows Payment Pending?',
      a: 'Advise the citizen not to initiate a second payment immediately. Payment status usually reconciles within 2 to 4 hours via automated cyber treasury push. If not reconciled after 24 hours, the citizen should provide the 14-digit Bank Reference / UTR Number. The Helpdesk agent can trigger a manual inquiry via CSD Payments gateway reconciliation.'
    },
    {
      q: 'Can a retired JCO apply for a vehicle exceeding Pay Level 7-9 entitlement ceiling?',
      a: 'No. The CSD AFD portal automatically restricts product selection based on the Service Rank and certified Pay Level stored in the beneficiary master profile. If an individual has been granted honorary rank or revised pay commission parity, they must first update their Service Information profile and upload the revised PPO before generating a demand.'
    },
    {
      q: 'How does an OEM allocate the Chassis and Engine number to an approved Demand?',
      a: 'Once the Depot grants formal departmental sanction and payment is certified, the Demand transforms into an Order routed to the OEM Portal. The OEM nodal officer accesses the Orders tab, verifies the dealership allocation, enters the 17-character VIN Chassis Number and Engine Number, and uploads the factory invoice certificate.'
    },
    {
      q: 'What is the standard SLA for Level 1 Helpdesk grievance resolution?',
      a: 'Level 1 Helpdesk tickets must be acknowledged within 2 hours and resolved or escalated within 24 hours. Tickets remaining unresolved after 24 hours automatically breach SLA and trigger a supervisory alert to Level 2 Technical Team.'
    },
    {
      q: 'What documents must the beneficiary carry to the dealership for final vehicle handover?',
      a: 'The beneficiary must present: (1) Original Military / Defense ID Card, (2) Signed & Stamped CSD Supply Order generated from the portal, (3) Government photo identity proof (Aadhaar/PAN), and (4) Original payment challan receipt.'
    }
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="helpdesk-faqs-page">
      <PageHeader
        title="Frequently Answered Inquiries (FAQs)"
        subtitle="Quick reference resolution scripts for frontline customer support staff"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'FAQs' }
        ]}
      />

      <Card className="mb-md">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter FAQs by keywords (e.g. ePay, entitlement, Chassis, SLA)..."
        />
      </Card>

      <div className="portal-flex-col-gap-sm">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card key={idx} className="faq-card-wrapper">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className={`faq-accordion-btn ${isOpen ? 'is-open' : ''}`}
              >
                <span>{faq.q}</span>
                <span className="faq-accordion-icon">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="faq-accordion-body">
                  {faq.a}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
