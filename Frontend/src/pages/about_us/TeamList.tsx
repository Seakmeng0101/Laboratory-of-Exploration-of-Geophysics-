import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAllTeams, deleteTeam, registerModerator } from '../../api/team.api';
import { Team } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  showModal: boolean;
  onModalClose: () => void;
}
const { canEdit, role } = useAuth();
const getRoleStyle = (role: string) => {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    admin:     { label: 'Admin',     bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
    moderator: { label: 'Moderator', bg: '#CCFBF1', color: '#0F766E', border: '#99F6E4' },
  };
  return map[role.toLowerCase()] ?? { label: role, bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
};

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MailIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const TeamList = ({ showModal, onModalClose }: Props) => {
  const { canEdit, role } = useAuth();
  const isAdmin = role === 'admin'; 
  const [teams, setTeams]                     = useState<Team[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget]       = useState<Team | null>(null);
  const [deletingId, setDeletingId]           = useState<string | null>(null);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState('');


  
const [form, setForm] = useState({
  name: '', email: '', password: '', confirmPassword: '', role: 'moderator'
});
  const fetchTeams = () => {
    setLoading(true);
    getAllTeams()
      .then(res => setTeams(res.data.users))
      .catch(err => console.log('error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
  const role = sessionStorage.getItem('role');
  if (role === 'admin') {
    fetchTeams(); 
  }
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'moderator' });
    setError('');
    onModalClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerModerator(form);
      handleClose();
      fetchTeams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (team: Team) => {
    setDeleteTarget(team);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteTeam(deleteTarget.id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchTeams();
    } catch (err: any) {
      console.log('delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="animate-spin w-6 h-6 rounded-full border-2 border-t-transparent" style={{ borderColor: '#0ABFBC', borderTopColor: 'transparent' }} />
      <p className="text-sm text-gray-400">Loading team members…</p>
    </div>
  );

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition";

  return (
    <>
      {/* ── Team grid ─────────────────────────────── */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#E0F7F7' }}>
            <svg width="26" height="26" fill="none" stroke="#0ABFBC" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m0 0a4 4 0 10-4-6.93M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No team members yet</p>
          <p className="text-xs text-gray-400">Add an account to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map(team => {
            const { label, bg, color, border } = getRoleStyle(team.role);
            return (
              <div
                key={team.id}
                className="group relative flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(145deg, #f8fffe 0%, #f0fdfc 100%)',
                  borderColor: '#c8f4f0',
                  boxShadow: '0 1px 4px rgba(10,191,188,0.08)',
                }}
              >
                {/* left cyan accent bar */}
                <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ background: '#0ABFBC' }} />

                {/* top row: badge + delete */}
                <div className="flex items-center justify-between pl-3">
                  <span style={{
                    background: bg, color, border: `1px solid ${border}`,
                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                    borderRadius: 99, letterSpacing: '0.04em',
                  }}>
                    {label}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(team)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-200 transition-all duration-150"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>

                {/* member info */}
                <div className="pl-3 flex flex-col gap-1.5">
                  <p className="text-sm font-bold text-gray-800 truncate">{team.name}</p>
                  <div className="flex items-center gap-1.5" style={{ color: '#0ABFBC' }}>
                    <MailIcon />
                    <span className="text-xs text-gray-500 truncate">{team.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Account Modal ──────────────────────── */}
      {showModal && isAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto"
            style={{ border: '1px solid #c8f4f0' }}
            onClick={e => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #e0fafa' }}>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Add team member</h3>
                <p className="text-xs text-gray-400 mt-0.5">Create a new account with a role.</p>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="px-6 py-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required
                    autoComplete="off" placeholder="Full name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    autoComplete="off" placeholder="email@example.com" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required
                      autoComplete="new-password" placeholder="••••••••" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm</label>
                    <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                      autoComplete="new-password" placeholder="••••••••" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                  <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                    <AlertIcon />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* footer */}
              <div className="flex gap-3 px-6 py-4 rounded-b-2xl" style={{ borderTop: '1px solid #e0fafa', background: '#f8fffe' }}>
                <button type="button" onClick={handleClose}
                  className="flex-1 py-2.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl transition disabled:opacity-60"
                  style={{ background: '#0ABFBC' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#09a8a5')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0ABFBC')}
                >
                  {submitting ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ───────────────────────────── */}
      {showDeleteModal && isAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6"
            style={{ border: '1px solid #fecaca' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <svg width="18" height="18" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Remove member</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              <strong className="text-gray-800">{deleteTarget?.name}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={deletingId === deleteTarget?.id}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition disabled:opacity-60">
                {deletingId === deleteTarget?.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamList;