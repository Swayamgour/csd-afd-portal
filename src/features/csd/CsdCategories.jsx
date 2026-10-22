import React, { useState, useMemo } from 'react';
import { Layers, ShieldCheck, RefreshCw, Car, Bike, Refrigerator, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetCategoriesQuery, useGetEligibilityRulesQuery } from '../catalog/productApi.js';

export default function CsdCategories() {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'entitlements'

  const { data: categories = [], isLoading: loadingCategories, refetch: refetchCats } = useGetCategoriesQuery();
  const { data: eligibilityRules = [], isLoading: loadingRules, refetch: refetchRules } = useGetEligibilityRulesQuery();

  const kpis = useMemo(() => {
    const totalCats = categories.length;
    const afd1Cats = categories.filter((c) => c.afdType === 'AFD_I').length;
    const afd2Cats = categories.filter((c) => c.afdType === 'AFD_II').length;
    const activeRules = eligibilityRules.filter((r) => r.active !== false).length;

    return [
      { title: 'Total AFD Categories', value: totalCats, subtitle: 'Live in Master Catalog' },
      { title: 'AFD-I Categories', value: afd1Cats, subtitle: 'Vehicles (Cars & Bikes)' },
      { title: 'AFD-II Categories', value: afd2Cats, subtitle: 'White Goods & Electronics' },
      { title: 'Statutory Eligibility Rules', value: activeRules, subtitle: 'MoD Policy Constraints' },
    ];
  }, [categories, eligibilityRules]);

  // Product categories table columns
  const categoryColumns = [
    {
      header: 'Category Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.code === 'CAR' ? (
            <Car className="w-4 h-4 text-brand" />
          ) : row.code === 'BIKE' ? (
            <Bike className="w-4 h-4 text-brand" />
          ) : (
            <Refrigerator className="w-4 h-4 text-brand" />
          )}
          <span className="font-semibold text-xs text-ink">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Category Code',
      accessor: 'code',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-brand">
          {row.code}
        </span>
      ),
    },
    {
      header: 'AFD Classification',
      accessor: 'afdType',
      render: (row) => (
        <Badge variant={row.afdType === 'AFD_I' ? 'primary' : 'warning'}>
          {row.afdType || 'AFD_I'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (row) => (
        <Badge variant={row.active !== false ? 'success' : 'neutral'}>
          {row.active !== false ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      ),
    },
    {
      header: 'Applicable Quota Policies',
      accessor: '_id',
      render: (row) => {
        const matchingRules = eligibilityRules.filter(
          (r) => r.categoryIds?.includes(row._id) || r.categoryIds?.some((c) => c._id === row._id || c === row._id)
        );
        return (
          <span className="text-xs text-slate-600">
            {matchingRules.length > 0
              ? matchingRules.map((r) => r.name).join(', ')
              : 'Governed by Standard Pay Matrix'}
          </span>
        );
      },
    },
  ];

  // Statutory Rank Entitlement Columns
  const entitlementColumns = [
    {
      header: 'Entitlement Pay Group',
      accessor: 'name',
      render: (row) => (
        <span className="font-semibold text-xs text-brand">{row.name}</span>
      ),
    },
    {
      header: 'Allowed AFD Types',
      accessor: 'categoryIds',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.categoryIds && row.categoryIds.length > 0 ? (
            row.categoryIds.map((c, i) => (
              <span key={i} className="badge-pill badge-primary badge-sm text-[10px]">
                {c.code || c.name || 'Allotted Category'}
              </span>
            ))
          ) : (
            <span className="badge-pill badge-primary badge-sm text-[10px]">All AFD Categories</span>
          )}
        </div>
      ),
    },
    {
      header: 'Max Indents per Period',
      accessor: 'maxQuantityPerPeriod',
      render: (row) => (
        <span className="font-bold text-xs text-ink font-mono">
          {row.maxQuantityPerPeriod || 1} Unit(s)
        </span>
      ),
    },
    {
      header: 'Gap / Periodicity',
      accessor: 'periodDays',
      render: (row) => {
        const yrs = row.periodDays ? Math.round(row.periodDays / 365) : 8;
        return (
          <span className="text-xs text-slate-700">
            Once every {yrs} {yrs === 1 ? 'year' : 'years'} ({row.periodDays || 2920} days)
          </span>
        );
      },
    },
    {
      header: 'Enforcement Action',
      accessor: 'effect',
      render: (row) => (
        <Badge variant={row.effect === 'ALLOW' ? 'success' : 'danger'}>
          {row.effect || 'ALLOW'}
        </Badge>
      ),
    },
    {
      header: 'Rule Status',
      accessor: 'active',
      render: (row) => (
        <Badge variant={row.active !== false ? 'success' : 'neutral'}>
          {row.active !== false ? 'ENFORCED' : 'DISABLED'}
        </Badge>
      ),
    },
  ];

  const handleSyncAll = () => {
    refetchCats();
    refetchRules();
  };

  return (
    <div className="csd-categories-page space-y-6">
      <PageHeader
        title="AFD Categories & Statutory Entitlement Quotas"
        subtitle="Manage master classification for four-wheelers, two-wheelers, and white goods along with MoD statutory rank purchase ceilings"
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Categories & Entitlements' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleSyncAll}>
            <RefreshCw size={14} className="mr-xs" />
            <span>Sync Rules & Categories</span>
          </Button>
        }
      />

      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      <div className="portal-tabs-nav">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`portal-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
        >
          <Layers size={16} />
          <span>Product Categories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entitlements')}
          className={`portal-tab-btn ${activeTab === 'entitlements' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} />
          <span>Statutory Entitlement Rules ({eligibilityRules.length})</span>
        </button>
      </div>

      <Card>
        {activeTab === 'categories' ? (
          <DataTable
            columns={categoryColumns}
            data={categories}
            loading={loadingCategories}
            emptyText="No categories found in database."
          />
        ) : (
          <DataTable
            columns={entitlementColumns}
            data={eligibilityRules}
            loading={loadingRules}
            emptyText="No eligibility rules configured."
          />
        )}
      </Card>
    </div>
  );
}
