import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function GroupCreationModal({ groupTypes, apiBridge, close, onGroupCreated }) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('Family Group');
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || loading) return;

    setLoading(true);
    try {
      const response = await apiBridge('/chats.php', {
        method: 'POST',
        body: JSON.stringify({
          name: newGroupName.trim(),
          type: 'group',
          group_type: newGroupType
        })
      });

      if (response.chat) {
        onGroupCreated(response.chat);
      }
      setNewGroupName('');
      close();
    } catch (err) {
      alert(err.message || "Failed to establish new chat group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form onSubmit={handleCreateGroup} className="modal-content-card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>👥 Create New Chat Group</h3>
          <button type="button" onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text-light)' }}><X size={20}/></button>
        </div>
        
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Group Display Name</label>
        <input 
          required 
          disabled={loading}
          placeholder="e.g. Project Development Team" 
          value={newGroupName} 
          onChange={e => setNewGroupName(e.target.value)} 
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '14px', background: 'var(--bg-primary)', color: 'var(--text-main)' }} 
        />
        
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Group Classification Category</label>
        <select 
          disabled={loading}
          value={newGroupType} 
          onChange={e => setNewGroupType(e.target.value)} 
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '24px', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
        >
          {groupTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <button type="button" className="filter-pill" onClick={close} style={{ border: 'none', background: 'var(--bg-directory)' }} disabled={loading}>Cancel</button>
          <button type="submit" className="primary" style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600' }} disabled={loading}>
            {loading ? 'Creating...' : 'Establish Group'}
          </button>
        </div>
      </form>
    </div>
  );
}
