import { useEffect, useState } from 'react';
import { getAllServices, createService, updateService, deleteService } from '../../api/service.api';
import { Service } from '../../types';

const ServicesPage = () => {
  const role = sessionStorage.getItem('role') || 'visitor';
  const canEdit = role === 'admin' || role === 'moderator';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', link: '' });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchServices = () => {
    setLoading(true);
    getAllServices()
      .then(res => setServices(res.data.services))
      .catch(err => console.log('error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ title: '', description: '', link: '' });
    setImage(null);
    setPreview(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (item: Service) => {
    setEditingItem(item);
    setForm({ title: item.title, description: item.description, link: item.link || '' });
    setPreview(item.image ? `http://localhost:4000/${item.image}` : null);
    setImage(null);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('link', form.link);
      if (image) formData.append('image', image);
      if (editingItem) {
        await updateService(editingItem.id, formData);
      } else {
        await createService(formData);
      }
      handleClose();
      fetchServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item?: Service) => {
    const target = item ?? editingItem;
    if (!target) return;
    if (!window.confirm(`Delete "${target.title}"? This cannot be undone.`)) return;
    setSubmitting(true);
    try {
      await deleteService(target.id);
      handleClose();
      fetchServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="text-center pt-12 pb-8 px-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Our Services</h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
        </p>
      </div>

      <div className="mx-auto px-6 pb-16">

        {canEdit && (
          <div className="flex justify-end mb-6">
            <button onClick={openAddModal} className="px-5 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition">
              Add new services
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 animate-pulse flex gap-4">
                <div className="w-28 h-24 bg-gray-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-100 rounded-full" />
                  <div className="h-3 w-full bg-gray-100 rounded-full" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && services.length === 0 && (
          <p className="text-center text-gray-400 py-16">No services found.</p>
        )}

        {/* List */}
        {!loading && services.length > 0 && (
          <div className="space-y-4">
            {services.map(item => (
              <div key={item.id} className="flex items-start gap-5 py-6 px-5 border border-gray-200 rounded-xl">

                {/* Image */}
                <img
  src={item.image ? `http://localhost:4000/${item.image}` : 'https://placehold.co/112x144'}
  alt={item.title}
  className="w-28 h-36 object-cover rounded-lg shrink-0"
/>

                {/* Info */}
                <div className="flex-1 text-sm space-y-1">
                  <p className="text-gray-500"><strong className="text-gray-800 text-base font-extrabold">{item.title}</strong></p>
                  <div className="text-gray-500">
                    <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
                      {item.description.split('\n').filter(Boolean).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  {item.link && (
                    <p className="text-gray-500">
                      Link:{' '}
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-cyan-500 hover:text-cyan-600 break-all">
                        {item.link}
                      </a>
                    </p>
                  )}
                </div>

                {/* Edit + Delete buttons */}
                {canEdit && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      aria-label="Edit service"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      aria-label="Delete service"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{editingItem ? 'Edit Service' : 'Add Service'}</h3>
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
                    onClick={() => document.getElementById('service-image-upload')?.click()}>
                    {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                  </div>
                  <input id="service-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <p className="text-xs text-gray-400">Click to upload photo</p>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Title</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Description points <span className="text-gray-400 font-normal">(one per line)</span>
                  </label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={5}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Link <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" name="link" value={form.link} onChange={handleChange} 
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
                  {submitting ? 'Saving...' : editingItem ? 'Save changes' : 'Add service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;