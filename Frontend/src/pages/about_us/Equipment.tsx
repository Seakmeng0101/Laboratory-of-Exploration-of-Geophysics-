import { useEffect, useState } from 'react';
import { getAllEquipments, createEquipment, updateEquipment, deleteEquipment } from '../../api/equipment.api';
import { Equipment } from '../../types';

const PER_PAGE = 4;

const EquipmentPage = () => {
  const role = sessionStorage.getItem('role') || 'visitor';
  const canEdit = role === 'admin' || role === 'moderator';

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ machine: '', model: '', capacity: '', link: '' });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEquipments = () => {
    setLoading(true);
    getAllEquipments()
      .then(res => setEquipments(res.data.equipments))
      .catch(err => console.log('error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEquipments(); }, []);

  const totalPages = Math.max(1, Math.ceil(equipments.length / PER_PAGE));
  const paginated = equipments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ machine: '', model: '', capacity: '', link: '' });
    setImage(null);
    setPreview(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (item: Equipment) => {
    setEditingItem(item);
    setForm({ machine: item.machine, model: item.model, capacity: item.capacity, link: item.link || '' });
    setPreview(item.image ? `http://localhost:4000/${item.image}` : null);
    setImage(null);
    setError('');
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingItem(null);
    setImage(null);
    setPreview(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('machine', form.machine);
      formData.append('model', form.model);
      formData.append('capacity', form.capacity);
      formData.append('link', form.link);
      if (image) formData.append('image', image);
      if (editingItem) {
        await updateEquipment(editingItem.id, formData);
      } else {
        await createEquipment(formData);
      }
      handleClose();
      fetchEquipments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save equipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (item: Equipment) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteEquipment(deleteTarget.id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchEquipments();
    } catch (err) {
      console.log('delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="text-center pt-12 pb-8 px-5">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Equipment</h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
        </p>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-16">

        {/* Total + Add button */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-gray-600">
            Total equipment: <span className="font-bold text-gray-800">{equipments.length}</span>
          </p>
          {canEdit && (
            <button onClick={openAddModal} className="px-5 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition">
              Add new equipment
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
                <div className="w-full h-40 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 w-1/2 bg-gray-100 rounded-full mx-auto mb-2" />
                <div className="h-3 w-1/3 bg-gray-100 rounded-full mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && equipments.length === 0 && (
          <p className="text-center text-gray-400 py-16">No equipment found.</p>
        )}

        {/* Grid */}
        {!loading && equipments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {paginated.map(item => (
              <div key={item.id} className="relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">

                {/* Three dot menu */}
                {canEdit && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-9 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
                        <button onClick={() => openEditModal(item)} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">Edit</button>
                        <button onClick={() => handleDeleteClick(item)} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">Delete</button>
                      </div>
                    )}
                  </div>
                )}
{/* Image */}
<div className="bg-gray-50 rounded-xl h-36 flex items-center justify-center mb-4 overflow-hidden">
  <img
    src={item.image ? `http://localhost:4000/${item.image}` : 'https://placehold.co/300x180'}
    alt={item.machine}
    className="w-full h-full object-contain"
  />
</div>

{/* Info */}
<div>
  <h3 className="text-base font-bold text-gray-800">{item.machine}</h3>
  <p className="text-xs text-gray-400 mb-2">Model {item.model}</p>

  <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs font-medium px-2.5 py-1 rounded-md mb-3">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
    {item.capacity}
  </span>

  {item.link && (
    <div className="pt-3 border-t border-gray-100">
      <a href={item.link} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
        View equipment
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6v6M10 14L20 4" />
        </svg>
      </a>
    </div>
  )}
</div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition disabled:opacity-40">
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button key={num} onClick={() => setPage(num)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition ${
                  page === num ? 'bg-cyan-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {num}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-5 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{editingItem ? 'Edit Equipment' : 'Add Equipment'}</h3>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-400 transition"
                    onClick={() => document.getElementById('equip-image-upload')?.click()}>
                    {preview ? <img src={preview} alt="preview" className="w-full h-full object-contain" /> : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                  </div>
                  <input id="equip-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <p className="text-xs text-gray-400">Click to upload photo</p>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Machine</label>
                  <input type="text" name="machine" value={form.machine} onChange={handleChange} required placeholder="Enter machine name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Model</label>
                  <input type="text" name="model" value={form.model} onChange={handleChange} required placeholder="Enter model"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Capacity</label>
                  <input type="text" name="capacity" value={form.capacity} onChange={handleChange} required placeholder="Enter capacity"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Link <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="link" value={form.link} onChange={handleChange} placeholder="e.g. https://georeva.eu/en/produit/..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}
              </div>
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
                <button type="button" onClick={handleClose}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition disabled:opacity-60">
                  {submitting ? 'Saving...' : editingItem ? 'Save changes' : 'Add equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteModal(false)}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Equipment</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{deleteTarget?.machine}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={deletingId === deleteTarget?.id}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-60">
                {deletingId === deleteTarget?.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;