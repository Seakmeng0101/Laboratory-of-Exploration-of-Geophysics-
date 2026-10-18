import { useEffect, useState } from 'react';
import { submitMessage } from '../../api/contact.api';
import {
  getAllTeamContacts,
  createTeamContact,
  updateTeamContact,
  deleteTeamContact,
} from '../../api/TeamContact.api';
import { TeamContact } from '../../types';
import contact_us from '../../assets/contact_us.webp';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';

const emptyForm = { name: '', faculty: '', institute: '', address: '', email: '', tel: '' };

const formFields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'faculty', label: 'Faculty', required: true },
  { name: 'institute', label: 'Institute', required: true },
  { name: 'address', label: 'Address', required: false },
  { name: 'email', label: 'Email', required: true },
  { name: 'tel', label: 'Tel / Telegram', required: true },
];

const ContactPage = () => {
  const { canEdit, role } = useAuth();
  const isAdmin = role === 'admin'; // adjust to match your role value, e.g. 'ADMIN' or 'super_admin'

  const [tab, setTab] = useState<'message' | 'team'>('message');

  // ── Message form ──────────────────────────────────────────
  const [msgForm, setMsgForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');

  const handleMsgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMsgForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMsgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError('');
    setMsgSuccess('');
    setMsgSubmitting(true);
    try {
      await submitMessage(msgForm);
      setMsgSuccess('Your message has been sent successfully!');
      setMsgForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setMsgError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setMsgSubmitting(false);
    }
  };

  // ── Team Contacts ─────────────────────────────────────────
  const [contacts, setContacts] = useState<TeamContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamContact | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchContacts = () => {
    setLoadingContacts(true);
    getAllTeamContacts()
      .then(res => setContacts(res.data.teamContacts))
      .catch(err => console.log('error:', err))
      .finally(() => setLoadingContacts(false));
  };

  // Only admins load team contacts; everyone else is kept on the Message tab
  useEffect(() => {
    if (isAdmin) {
      fetchContacts();
    } else {
      setTab('message');
      setContacts([]);
    }
  }, [isAdmin]);

  const openAddModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setImage(null);
    setPreview(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (item: TeamContact) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      faculty: item.faculty,
      institute: item.institute,
      address: item.address ?? '',
      email: item.email,
      tel: item.tel,
    });
    setPreview(item.image ? `http://localhost:4000/${item.image}` : null);
    setImage(null);
    setError('');
    setShowModal(true);
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
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append('image', image);
      if (editingItem) {
        await updateTeamContact(editingItem.id, formData);
      } else {
        await createTeamContact(formData);
      }
      handleClose();
      fetchContacts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: TeamContact) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeamContact(item.id);
      fetchContacts();
    } catch (err) {
      console.log('delete error:', err);
    }
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div className="w-full h-52 overflow-hidden">
        <img src={contact_us} alt="Contact Us" className="w-full h-full object-cover" />
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            {(['message', 'team'] as const)
              .filter(t => t === 'message' || isAdmin)
              .map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`py-4 text-base font-bold border-b-2 transition ${tab === t ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {t === 'message' ? 'Message' : 'Team Contacts'}
                </button>
              ))}
          </div>
          {tab === 'team' && isAdmin && canEdit && (
            <button onClick={openAddModal} className="px-6 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-full hover:bg-cyan-600 transition">
              Add New
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-10">

        {/* ── Message Tab ── */}
        {tab === 'message' && (
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-2/5">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Let's work Together</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Thank you for your interest in my portfolio. If you have any questions, comments, or would like to discuss potential collaborations or projects, please don't hesitate to get in touch. You can reach me via email, phone number and social media accounts. I look forward to hearing from you and discussing how we can work together!
              </p>
            </div>
            <div className="md:flex-1">
              <form onSubmit={handleMsgSubmit} className="space-y-3">
                <input type="text" name="name" value={msgForm.name} onChange={handleMsgChange} required placeholder="Enter your name"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                <input type="email" name="email" value={msgForm.email} onChange={handleMsgChange} required placeholder="Enter your email"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                <input type="text" name="subject" value={msgForm.subject} onChange={handleMsgChange} required placeholder="Enter your subject"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                <textarea name="message" value={msgForm.message} onChange={handleMsgChange} required rows={5} placeholder="Enter your message"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
                {msgError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{msgError}</p>}
                {msgSuccess && <p className="text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-lg">{msgSuccess}</p>}
                <div className="flex justify-center">
                  <button type="submit" disabled={msgSubmitting}
                    className="px-10 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-full hover:bg-cyan-600 transition disabled:opacity-60">
                    {msgSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Team Contacts Tab (admin only) ── */}
        {tab === 'team' && isAdmin && (
          <div className="space-y-4">
            {loadingContacts && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-200 rounded-xl p-5 animate-pulse flex gap-4">
                    <div className="w-24 h-28 bg-gray-100 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-100 rounded-full" />
                      <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
                      <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingContacts && contacts.length === 0 && (
              <p className="text-center text-gray-400 py-16">No team contacts found.</p>
            )}

            {!loadingContacts && contacts.length > 0 && (
              <div className="space-y-4">
                {contacts.map(item => (
                  <div key={item.id} className="flex items-start gap-5 border border-gray-200 rounded-xl px-5 py-6">
                    <img
                      src={item.image ? `http://localhost:4000/${item.image}` : 'https://placehold.co/96x112'}
                      alt={item.name}
                      className="w-24 h-28 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 text-sm space-y-0.5">
                      <p className="text-base font-extrabold text-gray-800 mb-1">{item.name}</p>
                      <p className="text-gray-600">{item.faculty}</p>
                      <p className="text-gray-600">{item.institute}</p>
                      {item.address && <p className="text-gray-600">{item.address}</p>}
                      <p className="text-gray-600">
                        Email:{' '}
                        <a href={`mailto:${item.email}`} className="text-cyan-500 hover:text-cyan-600">{item.email}</a>
                      </p>
                      <p className="text-gray-600">Tel/ Telegram: {item.tel}</p>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEditModal(item)} aria-label="Edit contact"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 8.5-8.5z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(item)} aria-label="Delete contact"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition">
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{editingItem ? 'Edit Contact' : 'Add Contact'}</h3>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-400 transition"
                    onClick={() => document.getElementById('contact-image-upload')?.click()}>
                    {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                  </div>
                  <input id="contact-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <p className="text-xs text-gray-400">Click to upload photo</p>
                </div>

                {formFields.map(field => (
                  <div key={field.name}>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      {field.label}
                      {!field.required && <span className="text-gray-400 font-normal"> (optional)</span>}
                    </label>
                    <input
                      type={field.name === 'email' ? 'email' : 'text'}
                      name={field.name}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                ))}

                {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}
              </div>
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
                <button type="button" onClick={handleClose}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition disabled:opacity-60">
                  {submitting ? 'Saving...' : editingItem ? 'Save changes' : 'Add contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ContactPage;