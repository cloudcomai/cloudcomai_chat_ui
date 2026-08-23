import React, { useState } from 'react';
import { Search } from 'lucide-react';

const imageUrl = chat => chat?.image_url || `https://cloudcomai.com/apiapp/api/media.php?type=${chat?.isGroup ? 'group' : 'user'}&id=${encodeURIComponent(chat?.isGroup ? chat?.id || '' : chat?.other_user_id || chat?.id || '')}`;

export default function ChatDirectory({ searchQuery, setSearchQuery, chatFilter, setChatFilter, filteredChats, selectedChat, setSelectedChat, isSidebarOpen, setIsSidebarOpen, setModal, activeTab }) {
  const [failedImages, setFailedImages] = useState({});

  const markImageFailed = id => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="chats-directory">
      <header className="directory-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', textTransform: 'capitalize', color: 'var(--text-main)' }}>{activeTab === 'chats' ? 'Messages' : activeTab === 'groups' ? 'Group Rooms' : activeTab === 'people' ? 'Contacts' : 'Conversations'}</h2>
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
                  <img
                    src={`${src}${src.includes('?') ? '&' : '?'}v=${chat.image_version || ''}`}
                    alt=""
                    onError={() => markImageFailed(imageKey)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
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
