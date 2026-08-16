import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAllMembers, createMember, updateMember, deleteMember } from '../../api/member.api';
import { Member } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  role: string;
  showModal: boolean;
  onModalClose: () => void;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const avatarPalette = [
  { bg: 'bg-sky-100',    text: 'text-sky-700'    },
  { bg: 'bg-purple-100', text: 'text-purple-700'  },
  { bg: 'bg-green-100',  text: 'text-green-700'   },
  { bg: 'bg-pink-100',   text: 'text-pink-700'    },
  { bg: 'bg-amber-100',  text: 'text-amber-700'   },
  { bg: 'bg-teal-100',   text: 'text-teal-700'    },
];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarPalette[Math.abs(h) % avatarPalette.length];
}

const SkeletonCard = () => (
  <div className="flex items-center gap-8 p-8 bg-white border border-gray-100 rounded-2xl animate-pulse">
    <div className="w-36 h-36 rounded-2xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-4">
      <div className="h-4 w-1/4 bg-gray-100 rounded-full" />
      <div className="h-3.5 w-1/3 bg-gray-100 rounded-full" />
      <div className="h-3.5 w-1/4 bg-gray-100 rounded-full" />
      <div className="h-3.5 w-1/5 bg-gray-100 rounded-full" />
    </div>
  </div>
);

const MemberList = ({showModal, onModalClose }: Props) => {
  const { canEdit, role } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string | number, boolean>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', position: '', specialty: '', role: '', link: '' });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Edit state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', position: '', specialty: '', role: '', link: '' });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);


const fetchMembers = () => {
  setLoading(true);
  getAllMembers()
    .then(res => setMembers(res.data.members))
    .catch(err => console.log('error:', err))
    .finally(() => setLoading(false));
};

  useEffect(() => { fetchMembers(); }, []);

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
    setForm({ name: '', position: '', specialty: '', role: '', link: '' });
    setImage(null);
    setPreview(null);
    setError('');
    onModalClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('position', form.position);
      formData.append('specialty', form.specialty);
      formData.append('role', form.role);
      formData.append('link', form.link);
      if (image) formData.append('image', image);
      await createMember(formData);
      handleClose();
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      position: member.position,
      specialty: member.specialty,
      role: member.role,
      link: member.link || '',
    });
    setEditPreview(member.image ? `http://localhost:4000/${member.image}` : null);
    setEditImage(null);
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImage(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingMember(null);
    setEditImage(null);
    setEditPreview(null);
    setError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('position', editForm.position);
      formData.append('specialty', editForm.specialty);
      formData.append('role', editForm.role);
      formData.append('link', editForm.link);
      if (editImage) formData.append('image', editImage);
      await updateMember(editingMember.id, formData);
      handleEditClose();
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (member: Member) => {
    setDeleteTarget(member);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteMember(deleteTarget.id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchMembers();
    } catch (err: any) {
      console.log('delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Member Cards */}
      <div className="flex flex-col gap-4">
        {loading && [1, 2, 3].map(i => <SkeletonCard key={i} />)}

        {!loading && members.length === 0 && (
          <p className="text-center text-gray-400 py-10">No members found.</p>
        )}

        {!loading && members.map(member => {
          const av = getAvatarColor(member.name);
          const showFallback = imgErrors[member.id] || !member.image;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-8 border border-gray-100 rounded-2xl bg-white hover:shadow-md hover:border-gray-200 transition-all duration-150"
            >
              <div className="flex items-center gap-8">
                {showFallback ? (
                  <div className={`w-36 h-36 rounded-2xl shrink-0 flex items-center justify-center text-3xl font-semibold ${av.bg} ${av.text}`}>
                    {getInitials(member.name)}
                  </div>
                ) : (
                  <img
                    src={`http://localhost:4000/${member.image}`}
                    alt={member.name}
                    onError={() => setImgErrors(p => ({ ...p, [member.id]: true }))}
                    className="w-36 h-36 rounded-2xl object-cover shrink-0"
                  />
                )}
                <div className="space-y-2">
                  <p className="text-base text-gray-500">Name: <strong className="text-gray-800">{member.name}</strong></p>
                  <p className="text-base text-gray-500">Position: <strong className="text-gray-800">{member.position}</strong></p>
                  <p className="text-base text-gray-500">Specialty: <strong className="text-gray-800">{member.specialty}</strong></p>
                  <p className="text-base text-gray-500">Role: <strong className="text-gray-800">{member.role}</strong></p>
                  {member.link && (
                    <p className="text-base text-gray-500">
                      Link: <a href={member.link} target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline font-semibold">{member.link}</a>
                    </p>
                  )}
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(member)}
                    className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-all duration-150"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(member)}
                    className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-150"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Add Member</h3>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-400 transition"
                    onClick={() => document.getElementById('image-upload')?.click()}>
                    {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                  </div>
                  <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <p className="text-xs text-gray-400">Click to upload photo</p>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Enter name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Position</label>
                  <input type="text" name="position" value={form.position} onChange={handleChange} required placeholder="Enter position"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Specialty</label>
                  <textarea name="specialty" value={form.specialty} onChange={handleChange} required rows={3} placeholder="Enter specialty"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Role</label>
                  <input type="text" name="role" value={form.role} onChange={handleChange} required placeholder="Enter role"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Research link <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" name="link" value={form.link} onChange={handleChange} placeholder="e.g. www.researchgate.net/profile/..."
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
                  {submitting ? 'Saving...' : 'Add member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleEditClose}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Edit Member</h3>
              <button onClick={handleEditClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-400 transition"
                    onClick={() => document.getElementById('edit-image-upload')?.click()}>
                    {editPreview ? <img src={editPreview} alt="preview" className="w-full h-full object-cover" /> : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                  </div>
                  <input id="edit-image-upload" type="file" accept="image/*" className="hidden" onChange={handleEditImage} />
                  <p className="text-xs text-gray-400">Click to change photo</p>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Position</label>
                  <input type="text" name="position" value={editForm.position} onChange={handleEditChange} required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Specialty</label>
                  <textarea name="specialty" value={editForm.specialty} onChange={handleEditChange} required rows={3}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Role</label>
                  <input type="text" name="role" value={editForm.role} onChange={handleEditChange} required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Research link <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" name="link" value={editForm.link} onChange={handleEditChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}
              </div>
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
                <button type="button" onClick={handleEditClose}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition disabled:opacity-60">
                  {submitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteModal(false)}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Member</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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
    </>
  );
};

export default MemberList;