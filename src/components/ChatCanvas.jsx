import React from 'react';
import { Phone, Video, Users, BarChart3, MapPin, Search, MoreHorizontal, Reply, Edit3, Plus, Camera, Pin, X, Send } from 'lucide-react';

export default function ChatCanvas({
    selectedChat, messages, user, setModal, replyTo, setReplyTo, editing, setEditing, composer, setComposer, onSendMessage
}) {
    // Custom execution trigger to send a vote choice to the server database
  const handleCastVote = async (pollId, optionId) => {
    try {
      await api(`/polls.php?action=vote`, {
        method: 'POST',
        body: JSON.stringify({ poll_id: pollId, option_id: optionId })
      });
      alert("Vote cast successfully!");
    } catch (err) {
      alert(err.message || "Failed to submit vote.");
    }
  };

    return (
        <main className="chat-interaction-canvas">
            <header className="canvas-header-nav">
                {selectedChat ? (
                    <div className="active-interlocutor-card">
                        <div className="avatar-frame small">
                            <div className="avatar-placeholder">{selectedChat.name ? selectedChat.name[0] : '?'}</div>
                        </div>
                        <div className="interlocutor-details">
                            <h4>{selectedChat.name}</h4>
                            <p className="presence-subtext">{selectedChat.online ? 'Online' : 'Offline'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="active-interlocutor-card"><h4>Select a conversation to begin</h4></div>
                )}

                <div className="canvas-action-utilities">
                    <button className="action-utility-btn" onClick={() => setModal('audio')}><Phone size={18} /> <span>Audio Call</span></button>
                    <button className="action-utility-btn" onClick={() => setModal('video')}><Video size={18} /> <span>Video Call</span></button>
                    <button className="action-utility-btn" onClick={() => setModal('poll')}><BarChart3 size={18} /> <span>New Poll</span></button>
                    <button className="action-utility-btn" onClick={() => setModal('location')}><MapPin size={18} /> <span>Share Location</span></button>
                    {/* NEW MEMBERSHIP MANAGEMENT UTILITY TRIGGERS */}
                    {selectedChat?.type === 'group' || selectedChat?.isGroup ? (
                        <>
                            <button
                                className="action-utility-btn"
                                style={{ color: '#10b981' }}
                                onClick={() => {
                                    console.log("ADD MEMBER BUTTON CLICKED! Setting modal state to: add_member");
                                    setModal('add_member');
                                }}
                            >
                                <Plus size={16} /> <span>Add Member</span>
                            </button>

                            <button className="action-utility-btn text-red" style={{ color: '#ef4444' }} onClick={() => setModal('manage_members')}>
                                <X size={16} /> <span>Manage/Remove</span>
                            </button>
                        </>
                    ) : (
                        <button className="action-utility-btn" onClick={() => setModal('group')}><Users size={18} /> <span>New Group</span></button>
                    )}

                    <div className="vertical-divider"></div>
                    <button className="icon-utility-only"><Search size={18} /></button>
                    <button className="icon-utility-only"><MoreHorizontal size={18} /></button>
                </div>
            </header>

            <div className="message-history-viewport">
                <div className="encryption-note">Messages are protected in transit. E2EE configuration applied.</div>

                {messages.map(msg => {
                    const isMine = msg.sender_id == user?.id || msg.user_id == user?.id || msg.mine === true;
                    const isPoll = msg.type === 'poll';
                    const messageContent = msg.body || msg.text || '';

                    return (
                        <div key={msg.id} className={`message-bubble-wrapper ${isMine ? 'outgoing-align' : 'incoming-align'}`}>

                            {/* CONDITION A: IF THE ROW IS A POLL DATA VALUE, RENDER THE POLL ELEMENT GRAPHIC */}
                            {isPoll ? (
                                <div className="poll-bubble-card" style={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    minWidth: '280px',
                                    maxWidth: '70%',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    marginBottom: '4px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '18px' }}>📊</span>
                                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                            {messageContent.replace('📊 POLL: ', '')}
                                        </h4>
                                    </div>

                                    {/* STYLIZED PLACEHOLDER RUNTIME VOTING OPTIONS TRACKS */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ position: 'relative', background: 'var(--bg-directory)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', cursor: 'pointer', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '35%', background: 'rgba(99, 102, 241, 0.12)', transition: 'width 0.3s ease' }}></div>
                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                                                <span>Option Choice A</span>
                                                <span style={{ color: 'var(--primary-color)' }}>35%</span>
                                            </div>
                                        </div>

                                        <div style={{ position: 'relative', background: 'var(--bg-directory)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', cursor: 'pointer', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '65%', background: 'rgba(99, 102, 241, 0.12)', transition: 'width 0.3s ease' }}></div>
                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                                                <span>Option Choice B</span>
                                                <span style={{ color: 'var(--primary-color)' }}>65%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bubble-meta-footer" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-light)' }}>
                                        <span>Active Voting Room</span>
                                        <span>{msg.time || 'Just Now'}</span>
                                    </div>
                                </div>
                            ) : (

                                /* CONDITION B: RENDER THE LEGACY STANDARD TEXT MESSAGE METRICS BUBBLE */
                                <div className={`message-data-bubble ${isMine ? 'primary-accent' : 'neutral-fallback'}`}>
                                    {msg.reply_to_text && (
                                        <div className="reply-preview-context"><Reply size={12} /> {msg.reply_to_text}</div>
                                    )}
                                    <p className="bubble-text-content">{messageContent}</p>
                                    <div className="bubble-meta-footer">
                                        <span className="bubble-time">{msg.time || 'Just Now'}</span>
                                        {msg.edited && <span className="edited-flag">· Edited</span>}
                                    </div>
                                    <div className="bubble-action-triggers">
                                        <button onClick={() => setReplyTo(msg)} title="Reply"><Reply size={12} /></button>
                                        {isMine && <button onClick={() => { setEditing(msg); setComposer(messageContent); }} title="Edit"><Edit3 size={12} /></button>}
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>


            <div className="canvas-bottom-action-tray">
                <div className="shortcut-action-grid">
                    <button className="shortcut-action-card green-theme" onClick={() => setModal('status')}>
                        <div className="shortcut-icon-circle"><Plus size={18} /></div>
                        <div className="shortcut-meta"><h5>Status</h5><p>Share your status</p></div>
                    </button>
                    <button className="shortcut-action-card purple-theme" onClick={() => setModal('story')}>
                        <div className="shortcut-icon-circle"><Camera size={18} /></div>
                        <div className="shortcut-meta"><h5>Stories</h5><p>View stories</p></div>
                    </button>
                    <button className="shortcut-action-card yellow-theme" onClick={() => setModal('poll')}>
                        <div className="shortcut-icon-circle"><BarChart3 size={18} /></div>
                        <div className="shortcut-meta"><h5>Polls</h5><p>Create polls</p></div>
                    </button>
                    <button className="shortcut-action-card teal-theme" onClick={() => setModal('location')}>
                        <div className="shortcut-icon-circle"><MapPin size={18} /></div>
                        <div className="shortcut-meta"><h5>Live Location</h5><p>Share location</p></div>
                    </button>
                </div>

                {replyTo || editing ? (
                    <div className="context-bar">
                        <div>{editing ? 'Editing Message' : 'Replying to'}: <strong>{(editing || replyTo).text}</strong></div>
                        <button onClick={() => { setReplyTo(null); setEditing(null); setComposer(''); }}><X size={16} /></button>
                    </div>
                ) : null}

                <div className="message-input-composer-bar">
                    <button className="composer-addon-btn">😊</button>
                    <button className="composer-addon-btn"><Pin size={18} /></button>
                    <button className="composer-addon-btn"><Camera size={18} /></button>

                    <input
                        type="text"
                        placeholder={selectedChat ? "Type a message..." : "Select a conversation to start messaging"}
                        value={composer}
                        onChange={(e) => setComposer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        disabled={!selectedChat}
                        className="composer-text-input"
                    />

                    <button className="voice-mic-submit-btn" onClick={onSendMessage} disabled={!selectedChat}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </main>

    );
}
