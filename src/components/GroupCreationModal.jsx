import React, { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

export default function GroupCreationModal({ groupTypes, apiBridge, close, onGroupCreated }) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('Family Group');
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || loading) return;

    setLoading(true);
    try {
      const response = await apiBridge('/groups.php', {
        method: 'POST',
        body: JSON.stringify({
          name: newGroupName.trim(),
          group_category: newGroupType,
          retention_seconds: 0
        })
      });

      if (!response?.group) throw new Error('Invalid group response received from server');

      const chat = {
        ...response.group,
        id: Number(response.group.id),
        type: 'group',
        isGroup: true,
        owner_id: response.group.owner_id
      };

      setCreatedGroup(chat);
      setInviteUrl(response.invite_url || '');
      onGroupCreated(chat);
      setNewGroupName('');
    } catch (err) {
      alert(err.message || 'Failed to establish new chat group.');
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('Unable to copy the invite link.');
    }
  };

  if (createdGroup) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content-card" style={{ textAlign: 'left', maxWidth: '440px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Group Created</h3>
            <button type="button" onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text-light)' }} aria-label="Close"><X size={20}/></button>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <div className="avatar-frame"><div className="avatar-placeholder">{createdGroup.name?.[0] || 'G'}</div></div>
            <div>
              <strong>{createdGroup.name}</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{createdGroup.group_category}</div>
            </div>
          </div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Group invite link</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input value={inviteUrl} readOnly style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-main)' }} />
            <button type="button" className="primary" onClick={copyInvite} title="Copy invite link" aria-label="Copy invite link">
              {copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
            <button type="button" className="primary" onClick={close}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <form onSubmit={handleCreateGroup} className="modal-content-card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Create New Chat Group</h3>
          <button type="button" onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text-light)' }} aria-label="Close"><X size={20}/></button>
        </div>

        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Group Display Name</label>
        <input required disabled={loading} placeholder="e.g. Project Development Team" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '14px', background: 'var(--bg-primary)', color: 'var(--text-main)' }} />

        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Group Classification Category</label>
        <select disabled={loading} value={newGroupType} onChange={e => setNewGroupType(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '24px', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
          {groupTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <button type="button" className="filter-pill" onClick={close} style={{ border: 'none', background: 'var(--bg-directory)' }} disabled={loading}>Cancel</button>
          <button type="submit" className="primary" style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
}
