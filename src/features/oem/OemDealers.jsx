import React, { useState, useMemo } from 'react';
import {
  Store,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Package,
  Layers,
  Building2,
  Calendar,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetOemDealersQuery,
  useGetOemDealerByIdQuery,
  useGetOemDealerProductsQuery,
  useGetOemDealerAppointmentsQuery,
} from './oemApi.js';

export default function OemDealers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [selectedDealerId, setSelectedDealerId] = useState(null);

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (searchTerm) p.q = searchTerm;
    if (stateFilter) p.state = stateFilter;
    return p;
  }, [searchTerm, stateFilter, page]);

  const {
    data: dealersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOemDealersQuery(queryParams);

  const { data: selectedDealer, isLoading: loadingDetail } = useGetOemDealerByIdQuery(
    selectedDealerId,
    { skip: !selectedDealerId }
  );

  const { data: dealerProducts = [], isLoading: loadingProducts } = useGetOemDealerProductsQuery(
    selectedDealerId,
    { skip: !selectedDealerId }
  );

  const { data: dealerAppointments = [], isLoading: loadingAppointments } = useGetOemDealerAppointmentsQuery(
    selectedDealerId,
    { skip: !selectedDealerId }
  );

  const dealers = dealersData?.items || [];
  const meta = dealersData?.meta || {};

  const columns = [
    {
      header: 'Dealership Name',
      accessor: 'name',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.name}</div>
          <div className="muted small font-mono">{r.code}</div>
        </div>
      ),
    },
    {
      header: 'Location / State',
      accessor: 'city',
      render: (r) => (
        <div>
          <span className="font-medium text-slate-700">{r.city || '—'}</span>
          {r.state && <span className="muted small block">{r.state}</span>}
        </div>
      ),
    },
    {
      header: 'Contact Details',
      accessor: 'contact',
      render: (r) => (
        <div className="small">
          {r.phone && (
            <div className="flex items-center gap-1 muted">
              <Phone size={12} /> {r.phone}
            </div>
          )}
          {r.email && (
            <div className="flex items-center gap-1 muted">
              <Mail size={12} /> {r.email}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'CSD Status',
      accessor: 'active',
      render: (r) => (
        <Badge variant={r.active ? 'success' : 'neutral'}>
          {r.active ? 'Active Dealer' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          icon={Store}
          onClick={() => setSelectedDealerId(r._id)}
        >
          View Showroom
        </Button>
      ),
    },
  ];

  return (
    <div className="oem-dealers-page space-y-6">
      <PageHeader
        title="Authorized Dealership Network"
        subtitle="Manage OEM authorized dealer showrooms, depot appointments, and product allotments"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Dealerships' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Sync Network
          </Button>
        }
      />

      {/* Dealer Detail Inline Dossier */}
      {Boolean(selectedDealerId) && (
        <Card
          className="mb-4 border-primary"
          title={selectedDealer?.name || 'Dealership Dossier'}
          subtitle={`Showroom Code: ${selectedDealer?.code || '—'} · Authorized OEM Representative`}
          headerAction={
            <Button variant="outline" size="sm" onClick={() => setSelectedDealerId(null)}>
              Close Dossier
            </Button>
          }
        >
          {loadingDetail ? (
            <div className="py-8 text-center text-muted">Loading dealer details...</div>
          ) : (
            <div className="space-y-4">
              {/* Dealer Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-sm border">
                <div>
                  <span className="text-muted block text-xs">Dealership Name:</span>
                  <span className="font-semibold">{selectedDealer?.name}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Dealer Code:</span>
                  <span className="font-mono font-medium">{selectedDealer?.code}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Location:</span>
                  <span>{selectedDealer?.city}, {selectedDealer?.state}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Address:</span>
                  <span>{selectedDealer?.address || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Phone:</span>
                  <span>{selectedDealer?.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Official Email:</span>
                  <span>{selectedDealer?.email || '—'}</span>
                </div>
              </div>

              {/* Depot Appointments */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Building2 size={16} className="text-brand" />
                  Regional CSD Depot Appointments ({dealerAppointments.length})
                </h4>
                {loadingAppointments ? (
                  <div className="text-xs text-muted py-2">Loading appointments...</div>
                ) : dealerAppointments.length === 0 ? (
                  <div className="text-xs text-muted p-2 bg-slate-50 rounded border">
                    No explicit depot appointment records found. Operating under primary OEM dealership scope.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {dealerAppointments.map((app, idx) => (
                      <div
                        key={app._id || idx}
                        className="p-2 border rounded flex justify-between items-center text-xs bg-white"
                      >
                        <div>
                          <span className="font-semibold">{app.depotId?.name || '—'}</span>
                          {app.depotId?.code && <span className="text-muted ml-2 font-mono">({app.depotId.code})</span>}
                        </div>
                        <Badge variant={app.status === 'APPROVED' || app.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {app.status || '—'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Authorized Products */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Package size={16} className="text-brand" />
                  Authorized Vehicle Lineup ({dealerProducts.length})
                </h4>
                {loadingProducts ? (
                  <div className="text-xs text-muted py-2">Loading products...</div>
                ) : dealerProducts.length === 0 ? (
                  <div className="text-xs text-muted p-2 bg-slate-50 rounded border">
                    No individual vehicle allotments configured yet. Use "Dealer Products" tab to map models.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {dealerProducts.map((p, idx) => (
                      <div
                        key={p._id || idx}
                        className="p-2 border rounded flex justify-between items-center text-xs bg-white"
                      >
                        <div>
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-muted ml-2 font-mono">SKU: {p.sku}</span>
                        </div>
                        <span className="font-mono font-medium text-brand">
                          ₹ {(p.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
          <div className="flex gap-2 items-center flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-muted pointer-events-none" />
              <input
                type="text"
                className="form-control pl-9"
                placeholder="Search by dealership name, code, or city..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-44">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by state..."
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={dealers}
          loading={isLoading}
          pagination={
            meta.totalPages > 1
              ? {
                  page: meta.page || page,
                  totalPages: meta.totalPages,
                  totalItems: meta.total,
                  onPageChange: setPage,
                  pageSize,
                }
              : null
          }
          emptyTitle="No dealerships found"
          emptyText="No dealerships matching your query exist in your authorized OEM network."
        />
      </Card>
    </div>
  );
}
