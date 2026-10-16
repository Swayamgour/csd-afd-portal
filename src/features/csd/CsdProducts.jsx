import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit3, Trash2, CheckCircle2, Package } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import Select from '../../components/common/Select.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import { productService } from '../../services/product.service.js';

export default function CsdProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    brand: '',
    category: 'car',
    type: '',
    lo: '',
    engine: '',
    fuel: 'Petrol'
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        category: categoryFilter,
        search: searchTerm
      });
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, searchTerm]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormState({
      name: '',
      brand: '',
      category: 'car',
      type: 'SUV',
      lo: '',
      engine: '1.2L Turbo',
      fuel: 'Petrol'
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormState({
      name: p.name,
      brand: p.brand,
      category: p.category,
      type: p.type || '',
      lo: p.lo || '',
      engine: p.engine || '',
      fuel: Array.isArray(p.fuel) ? p.fuel[0] : p.fuel || 'Petrol'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          ...formState,
          lo: Number(formState.lo)
        });
        setToast(`Product ${formState.name} updated successfully.`);
      } else {
        await productService.createProduct({
          ...formState,
          lo: Number(formState.lo),
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500'
        });
        setToast(`New product ${formState.name} catalogued.`);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: 'name',
      render: (row) => (
        <div className="row align-center gap-1">
          <img
            src={row.image || row.images?.[0] || 'https://via.placeholder.com/60'}
            alt=""
            className="w-10 h-10 object-cover panel p-0-5"
          />
          <div>
            <span className="font-semibold block">{row.name}</span>
            <span className="micro muted">{row.brand} · {row.type}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="badge-pill badge-primary badge-sm text-uppercase">{row.category}</span>
    },
    {
      header: 'CSD Concessional Price',
      accessor: 'lo',
      render: (row) => <span className="font-bold text-brand">₹ {row.lo?.toLocaleString('en-IN')}</span>
    },
    { header: 'Engine / Specs', accessor: 'engine', render: (row) => <span className="small">{row.engine || row.type || '-'}</span> },
    {
      header: 'Fuel Type',
      accessor: 'fuel',
      render: (row) => <span className="small">{Array.isArray(row.fuel) ? row.fuel.join(', ') : row.fuel || '-'}</span>
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="row gap-1">
          <button
            type="button"
            className="btn sm out"
            onClick={() => openEditModal(row)}
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="csd-products-page">
      <PageHeader
        title="CSD AFD Product Catalogue Management"
        subtitle="Maintain approved manufacturer vehicle models, sanctioned concessional prices, and AFD quota categories."
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={openCreateModal}>
            Catalogue New Product
          </Button>
        }
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <FilterBar
        hasActiveFilters={categoryFilter !== 'all' || !!searchTerm}
        onReset={() => {
          setCategoryFilter('all');
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Catalogue</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by model, brand, or body type..."
            size="sm"
          />
        </div>

        <div className="w-44">
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'car', label: 'Cars (Four-Wheelers)' },
              { value: 'bike', label: 'Bikes (Two-Wheelers)' },
              { value: 'white-goods', label: 'Appliances / White Goods' }
            ]}
          />
        </div>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyTitle="No catalogue items found"
          emptyText="No products matched the current category or keyword criteria."
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? `Edit Product · ${editingProduct.name}` : 'Catalogue New AFD Product'}
        subtitle="Approved rates will immediately reflect in the public and authenticated portal."
        maxWidth="540px"
        footer={
          <div className="modal-footer-btns">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Product Record
            </Button>
          </div>
        }
      >
        <div className="product-form-body">
          <Input
            id="prodName"
            label="Product Model Name"
            placeholder="e.g. Tata Curvv EV Empowered"
            value={formState.name}
            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
            required
            className="mb-2"
          />

          <div className="row gap-1 mb-2">
            <div className="flex-1">
              <Input
                id="prodBrand"
                label="Brand / OEM"
                placeholder="e.g. Tata"
                value={formState.brand}
                onChange={(e) => setFormState({ ...formState, brand: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <Select
                label="Category"
                value={formState.category}
                onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                options={[
                  { value: 'car', label: 'Four-Wheeler (Car)' },
                  { value: 'bike', label: 'Two-Wheeler (Bike)' },
                  { value: 'white-goods', label: 'White Goods' }
                ]}
                required
              />
            </div>
          </div>

          <div className="row gap-1 mb-2">
            <div className="flex-1">
              <Input
                id="prodPrice"
                label="CSD Concessional Price (₹)"
                type="number"
                placeholder="e.g. 1150000"
                value={formState.lo}
                onChange={(e) => setFormState({ ...formState, lo: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                id="prodType"
                label="Body / Class"
                placeholder="e.g. Compact SUV / Commuter"
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value })}
              />
            </div>
          </div>

          <Input
            id="prodEngine"
            label="Engine / Motor Displacement"
            placeholder="e.g. 1.2L Revotron / 55kWh Battery"
            value={formState.engine}
            onChange={(e) => setFormState({ ...formState, engine: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
