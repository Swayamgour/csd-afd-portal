import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';

export default function CsdCategories() {
  const categories = [
    {
      category: 'Officers (Pay Level 10-18)',
      fourWheelerCap: '₹ 20.0 Lakhs',
      periodicity: 'Once every 8 years',
      engineLimit: 'Uncapped CC',
      twoWheelerCap: 'Uncapped (Every 3 years)',
      whiteGoods: 'Annual quota allowed'
    },
    {
      category: 'JCOs / Honorary Officers (Pay Level 7-9)',
      fourWheelerCap: '₹ 10.0 Lakhs',
      periodicity: 'Once every 8 years (First car after 5 yrs svc)',
      engineLimit: 'Up to 1500 CC',
      twoWheelerCap: 'Uncapped (Every 3 years)',
      whiteGoods: 'Annual quota allowed'
    },
    {
      category: 'Other Ranks / ORs (Pay Level 3-6)',
      fourWheelerCap: '₹ 8.0 Lakhs',
      periodicity: 'Total 2 in lifetime (1 in svc + 1 post-retirement)',
      engineLimit: 'Up to 1400 CC',
      twoWheelerCap: 'Uncapped (Every 3 years)',
      whiteGoods: 'Annual quota allowed'
    },
    {
      category: 'Defence Civilians (Gazetted Officers)',
      fourWheelerCap: '₹ 15.0 Lakhs',
      periodicity: 'Once every 8 years',
      engineLimit: 'Up to 1800 CC',
      twoWheelerCap: 'Uncapped (Every 3 years)',
      whiteGoods: 'Annual quota allowed'
    }
  ];

  const columns = [
    { header: 'Entitlement Category', accessor: 'category', render: (row) => <span className="font-semibold text-brand">{row.category}</span> },
    { header: 'Car Financial Ceiling', accessor: 'fourWheelerCap', render: (row) => <span className="font-bold text-ink">{row.fourWheelerCap}</span> },
    { header: 'Purchase Periodicity', accessor: 'periodicity' },
    { header: 'Engine CC Rule', accessor: 'engineLimit' },
    { header: 'Two-Wheeler Quota', accessor: 'twoWheelerCap', render: (row) => <span className="text-green font-medium">{row.twoWheelerCap}</span> },
    { header: 'White Goods Quota', accessor: 'whiteGoods' }
  ];

  return (
    <div className="csd-categories-page">
      <PageHeader
        title="AFD Categories & Statutory Entitlement Quotas"
        subtitle="Current military entitlement rules, financial caps, and periodicity intervals under MoD Policy Circular 2024"
      />

      <Card>
        <DataTable
          columns={columns}
          data={categories}
        />
      </Card>
    </div>
  );
}
