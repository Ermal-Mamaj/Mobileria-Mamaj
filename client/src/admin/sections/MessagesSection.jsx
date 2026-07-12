import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

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

  function reload() {
    api.get('/contact').then(setMessages);
  }

  useEffect(reload, []);

  async function toggleRead(msg) {
    const updated = await api.put(`/contact/${msg.id}/read`, { is_read: !msg.is_read });
    setMessages((list) => list.map((m) => (m.id === msg.id ? updated : m)));
  }

  async function remove(id) {
    await api.del(`/contact/${id}`);
    setMessages((list) => list.filter((m) => m.id !== id));
  }

  if (!messages) return <p>Po ngarkohet...</p>;

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__heading">
        Mesazhet {unread > 0 && <span className="admin-badge">{unread} të reja</span>}
      </h2>

      {messages.length === 0 && <p>Nuk ka mesazhe ende.</p>}

      {messages.map((msg) => (
        <div className={`admin-subcard ${msg.is_read ? 'is-read' : ''}`} key={msg.id}>
          <div className="admin-msg__head">
            <strong>{msg.name}</strong>
            <a href={`tel:${msg.phone}`}>{msg.phone}</a>
            <span className="admin-msg__date">{formatDate(msg.created_at)}</span>
          </div>
          <p className="admin-msg__body">{msg.message}</p>
          <div className="admin-msg__actions">
            <button type="button" className="admin-btn-secondary" onClick={() => toggleRead(msg)}>
              {msg.is_read ? 'Shëno si të palexuar' : 'Shëno si të lexuar'}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={() => remove(msg.id)}>Fshij</button>
          </div>
        </div>
      ))}
    </div>
  );
}
