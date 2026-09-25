import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useConfirm } from '../useConfirm.jsx';

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleString('sq-AL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagesSection() {
  const [messages, setMessages] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { confirm, modal } = useConfirm();

  function reload() {
    api.get('/contact').then(setMessages);
  }

  useEffect(reload, []);

  async function toggleRead(msg) {
    const updated = await api.put(`/contact/${msg.id}/read`, { is_read: !msg.is_read });
    setMessages((list) => list.map((m) => (m.id === msg.id ? updated : m)));
  }

  async function remove(msg) {
    const ok = await confirm({
      title: 'Fshi mesazhin?',
      message: `Fshij mesazhin nga "${msg.name}"? Ky veprim nuk mund të zhbëhet.`,
      confirmLabel: 'Fshi',
      danger: true,
    });
    if (!ok) return;
    await api.del(`/contact/${msg.id}`);
    setMessages((list) => list.filter((m) => m.id !== msg.id));
  }

  if (!messages) return <p>Po ngarkohet...</p>;

  const unread = messages.filter((m) => !m.is_read).length;
  const q = search.trim().toLowerCase();

  const FILTERS = [
    { key: 'all', label: 'Të Gjitha', test: () => true },
    { key: 'unread', label: 'Të Palexuara', test: (m) => !m.is_read },
    { key: 'read', label: 'Të Lexuara', test: (m) => m.is_read },
  ];
  const activeFilter = FILTERS.find((f) => f.key === filter) || FILTERS[0];

  const filtered = messages.filter((m) => {
    const matchesSearch = !q
      || m.name?.toLowerCase().includes(q)
      || m.phone?.toLowerCase().includes(q)
      || m.message?.toLowerCase().includes(q);
    return matchesSearch && activeFilter.test(m);
  });

  return (
    <div className="admin-panel">
      <div className="admin-panel__header-row">
        <h2 className="admin-panel__heading">
          Mesazhet {unread > 0 && <span className="admin-badge">{unread} të reja</span>}
        </h2>
      </div>

      {messages.length > 0 && (
        <div className="prod-search-bar">
          <input
            type="search"
            className="prod-search-input"
            placeholder="Kërko sipas emrit, telefonit ose mesazhit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="prod-filter-chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`prod-filter-chip ${filter === f.key ? 'is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length === 0 && <p className="prod-empty-state">Nuk ka mesazhe ende.</p>}

      {messages.length > 0 && filtered.length === 0 && (
        <p className="prod-empty-state">Asnjë mesazh nuk përputhet me kërkimin.</p>
      )}

      <div className="msg-list">
        {filtered.map((msg) => (
          <div className={`msg-card ${msg.is_read ? 'is-read' : ''}`} key={msg.id}>
            {!msg.is_read && <span className="msg-card__dot" title="E palexuar" />}
            <div className="msg-card__head">
              <strong className="msg-card__name">{msg.name}</strong>
              <a href={`tel:${msg.phone}`} className="msg-card__phone">{msg.phone}</a>
              <span className="msg-card__date">{formatDate(msg.created_at)}</span>
            </div>
            <p className="msg-card__body">{msg.message}</p>
            <div className="msg-card__actions">
              <button type="button" className="admin-btn-secondary" onClick={() => toggleRead(msg)}>
                {msg.is_read ? 'Shëno si të palexuar' : 'Shëno si të lexuar'}
              </button>
              <button type="button" className="admin-btn-danger" onClick={() => remove(msg)}>Fshi</button>
            </div>
          </div>
        ))}
      </div>
      {modal}
    </div>
  );
}
