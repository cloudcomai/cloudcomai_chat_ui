import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, UserRound, Mail, Phone } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'https://cloudcomai.com/apiapp/api';
const imageUrl = chat => chat?.image_url || `https://cloudcomai.com/apiapp/api/media.php?type=${chat?.isGroup ? 'group' : 'user'}&id=${encodeURIComponent(chat?.isGroup ? chat?.id || '' : chat?.other_user_id || chat?.id || '')}`;

async function googleContactsRequest(path, options = {}) {
  const token = localStorage.getItem('cc_token');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Unable to load Google contacts.');
  return data;
}

export default function ChatDirectory({ searchQuery, setSearchQuery, chatFilter, setChatFilter, filteredChats, selectedChat, setSelectedChat, isSidebarOpen, setIsSidebarOpen, setModal, activeTab }) {
  const [failedImages, setFailedImages] = useState({});
  const [googleContacts, setGoogleContacts] = useState([]);
  const [googleContactsLoading, setGoogleContactsLoading] = useState(false);
  const [googleContactsError, setGoogleContactsError] = useState('');
  const [googleContactsTotal, setGoogleContactsTotal] = useState(0);
  const [googleContactsPage, setGoogleContactsPage] = useState(1);
  const [googleContactsHasMore, setGoogleContactsHasMore] = useState(false);

  const markImageFailed = id => setFailedImages(prev => ({ ...prev, [id]: true }));

  const loadGoogleContacts = async ({ reset = false } = {}) => {
    const page = reset ? 1 : googleContactsPage;
    setGoogleContactsLoading(true);
    setGoogleContactsError('');
    try {
      const data = await googleContactsRequest(`/google/contacts.php?page=${page}&page_size=100`);
      const contacts = Array.isArray(data.contacts) ? data.contacts : [];
      setGoogleContacts(prev => reset ? contacts : [...prev, ...contacts]);
      setGoogleContactsTotal(Number(data.pagination?.total || contacts.length));
      setGoogleContactsHasMore(Boolean(data.pagination?.has_more));
      setGoogleContactsPage(page + 1);
    } catch (err) {
      setGoogleContactsError(err.message || 'Unable to load Google contacts.');
    } finally {
      setGoogleContactsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'people') return;
    setGoogleContacts([]);
    setGoogleContactsPage(1);
    setGoogleContactsHasMore(false);
    loadGoogleContacts({ reset: true });
  }, [activeTab]);

  const visibleGoogleContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return googleContacts;
    return googleContacts.filter(contact => [contact.display_name, contact.given_name, contact.family_name, contact.email, contact.phone]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query)));
  }, [googleContacts, searchQuery]);

  if (activeTab === 'people') {
    return (
      <section className="chats-directory">
        <header className="directory-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>People & Contacts</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #777)' }}>
                {googleContactsTotal > 0 ? `${googleContactsTotal} Google contacts` : 'Google contacts'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadGoogleContacts({ reset: true })}
              disabled={googleContactsLoading}
              title="Refresh contacts"
              aria-label="Refresh contacts"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '7px 10px', borderRadius: '7px', cursor: googleContactsLoading ? 'wait' : 'pointer' }}
            >
              <RefreshCw size={15} className={googleContactsLoading ? 'spin' : ''} />
              <span>Sync</span>
            </button>
          </div>

          <div className="header-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <button className="sidebar-toggle-trigger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
            <div className="search-box-wrapper" style={{ flex: 1, position: 'relative' }}><Search size={18} className="search-icon"/><input type="text" placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
          </div>
        </header>

        {googleContactsError && (
          <div className="empty-state" style={{ margin: '12px 16px', padding: '14px', textAlign: 'left' }}>
            <strong>Unable to load contacts</strong>
            <p style={{ margin: '6px 0 10px' }}>{googleContactsError}</p>
            <button className="primary" type="button" onClick={() => setModal('google_contacts')}>Connect Google</button>
          </div>
        )}

        <div className="conversations-scroll-stack">
          {googleContactsLoading && googleContacts.length === 0 ? (
            <div className="empty-state">Loading all contacts...</div>
          ) : visibleGoogleContacts.length === 0 && !googleContactsError ? (
            <div className="empty-state">
              {googleContactsTotal === 0 ? 'No Google contacts synchronized yet.' : 'No contacts match your search.'}
            </div>
          ) : visibleGoogleContacts.map(contact => {
            const imageKey = `google-${contact.resource_name}`;
            const imageFailed = Boolean(failedImages[imageKey]);
            const name = contact.display_name || [contact.given_name, contact.family_name].filter(Boolean).join(' ') || contact.email || contact.phone || 'Unnamed contact';
            return (
              <div key={contact.resource_name || `${contact.email}-${contact.phone}`} className="conversation-row-card" style={{ cursor: 'default' }}>
                <div className="avatar-frame">
                  {contact.photo_url && !imageFailed ? (
                    <img src={contact.photo_url} alt="" onError={() => markImageFailed(imageKey)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <div className="avatar-placeholder">{name[0]?.toUpperCase() || <UserRound size={18} />}</div>
                  )}
                </div>
                <div className="conversation-meta-summary" style={{ minWidth: 0 }}>
                  <div className="top-row"><h5 title={name}>{name}</h5></div>
                  {contact.email && <div className="bottom-row"><p className="message-snippet"><Mail size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />{contact.email}</p></div>}
                  {contact.phone && <div className="bottom-row"><p className="message-snippet"><Phone size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />{contact.phone}</p></div>}
                </div>
              </div>
            );
          })}
        </div>

        {googleContactsHasMore && !searchQuery.trim() && (
          <div style={{ padding: '12px 16px', textAlign: 'center' }}>
            <button type="button" onClick={() => loadGoogleContacts()} disabled={googleContactsLoading} className="primary">
              {googleContactsLoading ? 'Loading...' : 'Load more contacts'}
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="chats-directory">
      <header className="directory-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', textTransform: 'capitalize', color: 'var(--text-main)' }}>{activeTab === 'chats' ? 'Messages' : activeTab === 'groups' ? 'Group Rooms' : 'Conversations'}</h2>
          {activeTab === 'groups' && <button onClick={() => setModal('group')} style={{ background: 'var(--primary-color)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>+ Create Group</button>}
        </div>

        <div className="header-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <button className="sidebar-toggle-trigger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
          <div className="search-box-wrapper" style={{ flex: 1, position: 'relative' }}><Search size={18} className="search-icon"/><input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
        </div>
      </header>

      <div className="filter-pill-row"><button className={`filter-pill ${chatFilter === 'all' ? 'active' : ''}`} onClick={() => setChatFilter('all')}>All</button><button className={`filter-pill ${chatFilter === 'unread' ? 'active' : ''}`} onClick={() => setChatFilter('unread')}>Unread</button></div>

      <div className="conversations-scroll-stack">
        {filteredChats.length === 0 ? <div className="empty-state">No conversations found.</div> : filteredChats.map(chat => {
          const src = imageUrl(chat);
          const imageKey = `${chat.isGroup ? 'group' : 'user'}-${chat.id}`;
          const imageFailed = Boolean(failedImages[imageKey]);
          return (
            <div key={chat.id} className={`conversation-row-card ${selectedChat?.id === chat.id ? 'selected' : ''}`} onClick={() => setSelectedChat(chat)}>
              <div className="avatar-frame">
                {!imageFailed ? (
                  <img src={`${src}${src.includes('?') ? '&' : '?'}v=${chat.image_version || ''}`} alt="" onError={() => markImageFailed(imageKey)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <div className="avatar-placeholder">{chat.name ? chat.name[0] : 'C'}</div>
                )}
                {chat.online && <span className="online-indicator-dot"></span>}
              </div>
              <div className="conversation-meta-summary">
                <div className="top-row"><h5>{chat.name}</h5><span className="timestamp">{chat.time || 'Active'}</span></div>
                <div className="bottom-row"><p className="message-snippet">{chat.preview || 'No messages yet'}</p>{chat.unread > 0 && <span className="unread-counter-bubble">{chat.unread}</span>}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
