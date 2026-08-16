import { useEffect, useState } from 'react';
import { getAllProjects, createProject, updateProject, deleteProject } from '../api/project.api';
import { Project } from '../types';
import { useAuth } from '../hooks/useAuth';

const parseDescription = (desc: string[]): string[] => {
  try {
    if (!desc || desc.length === 0) return [];
    const first = desc[0];
    if (typeof first === 'string' && first.startsWith('[')) return JSON.parse(first);
    return desc;
  } catch {
    return desc;
  }
};

const ProjectPage = () => {
  const { canEdit, role } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', company_title: '', description: '', link: '' });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const fetchProjects = () => {
    setLoading(true);
    getAllProjects()
      .then(res => setProjects(res.data.projects))
      .catch(err => console.log('error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ title: '', company_title: '', description: '', link: '' });
    setImages([]);
    setPreviews([]);
    setExistingImages([]);
    setRemovedImages([]);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (item: Project) => {
    setEditingItem(item);
    setForm({
      title: item.title.trim(),
      company_title: item.company_title,
      description: parseDescription(item.description).join('\n'),
      link: item.link || '',
    });
    setExistingImages(item.images || []);
    setImages([]);
    setPreviews([]);
    setRemovedImages([]);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (path: string) => {
    setExistingImages(prev => prev.filter(p => p !== path));
    setRemovedImages(prev => [...prev, path]);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingItem(null);
    setImages([]);
    setPreviews([]);
    setExistingImages([]);
    setRemovedImages([]);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('company_title', form.company_title);
      const bullets = form.description.split('\n').filter(l => l.trim());
      formData.append('description', JSON.stringify(bullets));
      formData.append('link', form.link);
      images.forEach(img => formData.append('images', img));
      if (editingItem) {
        removedImages.forEach(r => formData.append('removeImages', r));
        await updateProject(editingItem.id, formData);
      } else {
        await createProject(formData);
      }
      handleClose();
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: Project) => {
    if (!window.confirm(`Delete "${item.title.trim()}"? This cannot be undone.`)) return;
    try {
      await deleteProject(item.id);
      fetchProjects();
    } catch (err) {
      console.log('delete error:', err);
    }
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="text-center pt-12 pb-8 px-5">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Project</h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
        </p>
      </div>

      <div className="mx-auto px-6 pb-16">

        {canEdit && (
          <div className="flex justify-end mb-6">
            <button onClick={openAddModal}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition">
              Add new
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-100 rounded-full" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
                  <div className="h-3 w-full bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && projects.length === 0 && (
          <p className="text-center text-gray-400 py-16">No projects found.</p>
        )}

        {/* List */}
        {!loading && projects.length > 0 && (
          <div className="space-y-5">
            {projects.map(item => {
              const bullets = parseDescription(item.description);
              const imgs = item.images || [];

              return (
                <div key={item.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '20px',
                  backgroundColor: '#ffffff',
                }}>

                  {/* Image strip */}
                  {imgs.length > 0 && (
  <div
    className={`grid gap-0.5 w-full ${
      imgs.length === 1
        ? 'grid-cols-1'
        : imgs.length === 2
        ? 'grid-cols-2'
        : imgs.length === 3
        ? 'grid-cols-2 sm:grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-4'
    }`}
  >
    {imgs.slice(0, 4).map((src, i) => (
      <img
        key={i}
        src={`http://localhost:4000/${src}`}
        alt={`project-${i}`}
        className="w-full h-56 sm:h-72 md:h-80 object-cover block"
      />
    ))}
  </div>
)}

                  {/* Body */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    flexShrink: 0,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: '0 0 6px' }}>
                        {item.title.trim()}
                      </h3>
                      <p style={{ fontSize: '15px', color: '#0891b2', margin: '0 0 12px' }}>
                        {item.company_title}
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '16px', color: '#6b7280' }}>
  {bullets.map((b, i) => (
    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#0b0b0b',
        marginTop: '8px',
        flexShrink: 0,
      }} />
      <span>{b.trim()}</span>
    </li>
  ))}
</ul>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer"
                          style={{ fontSize: '14px', color: '#0891b2', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px', textDecoration: 'none' }}>
                          View project →
                        </a>
                      )}
                    </div>

                    {canEdit && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => openEditModal(item)} aria-label="Edit project"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#06b6d4', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 8.5-8.5z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(item)} aria-label="Delete project"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{editingItem ? 'Edit Project' : 'Add Project'}</h3>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4">

                {/* Image upload */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Images <span className="text-gray-400 font-normal">(one or more)</span>
                  </label>

                  {/* Existing images */}
                  {existingImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {existingImages.map((src, i) => (
                        <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img src={`http://localhost:4000/${src}`} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(src)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New image previews */}
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeNewImage(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={() => document.getElementById('project-image-upload')?.click()}
                    className="w-full py-2.5 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-400 hover:text-cyan-500 transition flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Click to upload images
                  </button>
                  <input id="project-image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Title</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Company</label>
                  <input type="text" name="company_title" value={form.company_title} onChange={handleChange} required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Description <span className="text-gray-400 font-normal">(one bullet per line)</span>
                  </label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={5}
                    placeholder={'To map the subsurface layer\nTo investigate stiffness of materials\nTo evaluate engineering characterization'}
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
                  {submitting ? 'Saving...' : editingItem ? 'Save changes' : 'Add project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;