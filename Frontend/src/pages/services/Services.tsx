import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getAllServices, createService, updateService, deleteService } from '../../api/service.api';
import { Service } from '../../types';
import { DIVISIONS, FOOTER_PROPS, slugify } from '../../components/divisions';
import FontStyles from '../../components/FontStyles';


const API_URL = 'http://localhost:4000';

interface NavItem {
  slug: string;
  label: string;
}
interface NavGroup {
  code: string;
  name: string;
  accent: string;
  items: NavItem[];
}

/* Oldest first, so a newly added entry always lands at the end of its service.
   (If your ids are not numbers the API order is kept as-is.) */
const oldestFirst = (a: Service, b: Service) => {
  const x = Number(a.id);
  const y = Number(b.id);
  return Number.isNaN(x) || Number.isNaN(y) ? 0 : x - y;
};

/* No backend change needed: the service is stored inside the saved title as
   "Ground magnetics | Survey in Kampong Speu".  Old entries whose title is just
   the service name still work (they simply have no extra heading). */
const SEP = ' | ';

const parseTitle = (raw: string) => {
  const i = raw.indexOf(SEP);
  return i === -1
    ? { service: raw.trim(), title: '' }
    : { service: raw.slice(0, i).trim(), title: raw.slice(i + SEP.length).trim() };
};

const belongsTo = (entry: Service, slug: string) => slugify(parseTitle(entry.title).service) === slug;

const ServicesPage = () => {
  const role = sessionStorage.getItem('role') || 'visitor';
  const canEdit = role === 'admin' || role === 'moderator';

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
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

  /* ---------- navigation model: the divisions and services from the home page ---------- */
  const groups: NavGroup[] = useMemo(
    () =>
      DIVISIONS.map(d => ({
        code: d.code,
        name: d.name,
        accent: d.accent,
        items: d.services.map(s => ({ slug: slugify(s), label: s })),
      })),
    []
  );

  const allItems = groups.flatMap(g => g.items);
  const selectedSlug = params.get('service') || allItems[0]?.slug || '';
  const selectedGroup = groups.find(g => g.items.some(i => i.slug === selectedSlug));
  const selectedLabel = allItems.find(i => i.slug === selectedSlug)?.label ?? '';
  const accent = selectedGroup?.accent ?? 'var(--moss)';

  // every entry saved for the selected service, oldest first (new ones go last)
  const entries = useMemo(
    () => services.filter(s => belongsTo(s, selectedSlug)).sort(oldestFirst),
    [services, selectedSlug]
  );
  const hasDetails = (slug: string) => services.some(s => belongsTo(s, slug));

  /* ---------- modal handlers ---------- */
  // The entry is tied to the service you are on; the title is typed by the user.
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
    setForm({ title: parseTitle(item.title).title, description: item.description, link: item.link || '' });
    setPreview(item.image ? `${API_URL}/${item.image}` : null);
    setImage(null);
    setError('');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingItem(null);
    setImage(null);
    setPreview(null);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', `${selectedLabel}${SEP}${form.title.trim()}`);
      formData.append('description', form.description);
      formData.append('link', form.link);
      if (image) formData.append('image', image);
      if (editingItem) await updateService(editingItem.id, formData);
      else await createService(formData);
      handleClose();
      fetchServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save this service. Check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (target: Service) => {
    if (!window.confirm(`Delete "${parseTitle(target.title).title || target.title}"? This cannot be undone.`)) return;
    try {
      await deleteService(target.id);
      fetchServices();
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Could not delete this entry.');
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="surface-root min-h-screen">
      <FontStyles />

      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">WHAT WE OFFER</p>
        <h1 className="font-display text-4xl font-medium">Our Services</h1>
        <p className="mt-3 max-w-xl text-[var(--ink-soft)] leading-relaxed">
          Choose a service to see what the survey involves and what you receive.
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-[17rem_1fr] gap-8 md:gap-12">
        {/* Mobile: grouped select */}
        <div className="md:hidden">
          <label htmlFor="service-select" className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)]">
            SERVICE
          </label>
          <select
            id="service-select"
            value={selectedSlug}
            onChange={e => navigate(`/services?service=${e.target.value}`, { replace: true })}
            className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--paper-dim)] px-4 py-3 text-sm"
          >
            {groups.map(g => (
              <optgroup key={g.code} label={g.name}>
                {g.items.map(i => (
                  <option key={i.slug} value={i.slug}>{i.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Desktop: sidebar */}
        <aside className="hidden md:block">
          <nav aria-label="Services" className="sticky top-6 space-y-7">
            {groups.map(group => (
              <div key={group.code}>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--line)]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.accent }} />
                  <p className="font-display text-base font-medium">{group.name}</p>
                </div>
                <ul className="space-y-0.5">
                  {group.items.map(item => {
                    const active = item.slug === selectedSlug;
                    return (
                      <li key={item.slug}>
                        <Link
                          to={`/services?service=${item.slug}`}
                          replace
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                            active
                              ? 'bg-[var(--moss)] text-[var(--paper)] font-medium'
                              : 'text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] hover:text-[var(--ink)]'
                          }`}
                        >
                          {item.label}
                          {canEdit && !hasDetails(item.slug) && (
                            <span className="text-[10px] font-mono opacity-70">empty</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Detail panel */}
        <main>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-72 rounded-xl bg-[var(--paper-dim)]" />
              <div className="h-8 w-1/2 rounded bg-[var(--paper-dim)]" />
              <div className="h-4 w-full rounded bg-[var(--paper-dim)]" />
              <div className="h-4 w-2/3 rounded bg-[var(--paper-dim)]" />
            </div>
          ) : (
            <article key={selectedSlug} className="border-l-2 pl-6 md:pl-8" style={{ borderColor: accent }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">
                    {selectedGroup?.name.toUpperCase()}
                  </p>
                  <h2 className="font-display text-3xl font-medium leading-tight">{selectedLabel}</h2>
                </div>

                {canEdit && (
                  <button
                    onClick={openAddModal}
                    className="shrink-0 rounded-lg bg-[var(--moss)] px-4 py-2 text-sm font-medium text-[var(--paper)] hover:bg-[var(--moss-dark)] transition-colors"
                  >
                    + Add to {selectedLabel}
                  </button>
                )}
              </div>

              {entries.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] bg-[var(--paper-dim)] p-8">
                  <p className="font-display text-lg font-medium mb-1">Details for this service are coming soon</p>
                  <p className="text-sm text-[var(--ink-soft)] max-w-md">
                    Contact us and we will explain how {selectedLabel.toLowerCase()} can fit your project.
                  </p>
                </div>
              ) : (
                entries.map((entry, index) => {
                  const bullets = entry.description.split('\n').filter(Boolean);
                  return (
                    <section
                      key={entry.id}
                      className={index === 0 ? 'mt-6' : 'mt-10 pt-10 border-t border-[var(--line)]'}
                    >
                      {canEdit && (
                        <div className="flex justify-end gap-2 mb-4">
                          <button
                            onClick={() => openEditModal(entry)}
                            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--paper-dim)] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      {parseTitle(entry.title).title && (
                        <h3 className="font-display text-xl font-medium mb-4">{parseTitle(entry.title).title}</h3>
                      )}

                      {entry.image && (
                        <img
                          src={`${API_URL}/${entry.image}`}
                          alt={parseTitle(entry.title).title || selectedLabel}
                          className="w-full h-64 md:h-80 object-cover rounded-xl border border-[var(--line)]"
                        />
                      )}

                      <ul className={`space-y-2.5 max-w-2xl ${entry.image ? 'mt-6' : ''}`}>
                        {bullets.map((line, i) => (
                          <li key={i} className="flex items-start gap-3 text-[var(--ink-soft)] leading-relaxed">
                            <span
                              className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: accent }}
                            />
                            {line}
                          </li>
                        ))}
                      </ul>

                      {entry.link && (
                        <a
                          href={entry.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-6 inline-block rounded-lg bg-[var(--moss)] px-5 py-2.5 text-sm font-medium text-[var(--paper)] hover:bg-[var(--moss-dark)] transition-colors"
                        >
                          Read more
                        </a>
                      )}
                    </section>
                  );
                })
              )}
            </article>
          )}
        </main>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 px-4"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--paper)] shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
              <h3 className="font-display text-xl font-medium">
                {editingItem ? 'Edit entry in' : 'Add to'} {selectedLabel}
              </h3>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="w-8 h-8 rounded-lg text-[var(--ink-soft)] hover:bg-[var(--paper-dim)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4">
                {/* The service is fixed (the page you are on); the title is typed by the user */}
                <div className="flex items-center gap-2 rounded-lg bg-[var(--paper-dim)] px-4 py-2.5 text-sm">
                  <span className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)]">SERVICE</span>
                  <span className="font-medium">{selectedLabel}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-40 h-28 rounded-xl border-2 border-dashed border-[var(--line)] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--moss)] transition-colors"
                    onClick={() => document.getElementById('service-image-upload')?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-[var(--ink-soft)]">Click to upload photo</span>
                    )}
                  </div>
                  <input id="service-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>

                <Field label="Title">
                  <input type="text" name="title" value={form.title} onChange={handleChange} required className={inputCls} />
                </Field>

                <Field label="Description points" hint="One per line">
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className={inputCls} />
                </Field>

                <Field label="Link" hint="Optional">
                  <input type="text" name="link" value={form.link} onChange={handleChange} className={inputCls} />
                </Field>

                {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-lg border border-[var(--line)] py-2.5 text-sm font-medium hover:bg-[var(--paper-dim)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-[var(--moss)] py-2.5 text-sm font-medium text-[var(--paper)] hover:bg-[var(--moss-dark)] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : editingItem ? 'Save changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

const inputCls =
  'w-full rounded-lg border border-[var(--line)] bg-white/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)]/40';

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block mb-1.5 text-sm font-medium">
      {label} {hint && <span className="font-normal text-[var(--ink-soft)]">({hint})</span>}
    </label>
    {children}
  </div>
);

export default ServicesPage;