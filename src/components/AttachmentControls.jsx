import React, { useRef, useState } from 'react';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';

export default function AttachmentControls({ selectedChat, apiBridge, onUploaded }) {
  const inputRef = useRef(null);
  const [policy, setPolicy] = useState('APPROVAL_REQUIRED');
  const [busy, setBusy] = useState(false);
  const upload = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { alert('File size cannot exceed 25 MB.'); return; }
    setBusy(true);
    try {
      const form = new FormData(); form.append('chat_id', String(selectedChat.id)); form.append('file', file); form.append('download_policy', policy);
      const result = await apiBridge('/upload_attachment.php', { method: 'POST', body: form });
      if (result?.message) onUploaded?.(result.message);
    } catch (err) { alert(err.message || 'Unable to upload attachment.'); }
    finally { setBusy(false); }
  };
  return <>
    <select value={policy} onChange={e => setPolicy(e.target.value)} disabled={!selectedChat || busy} title="Download permission">
      <option value="APPROVAL_REQUIRED">🔒 Approval required</option><option value="ALLOW">Allow download</option><option value="VIEW_ONLY">View only</option>
    </select>
    <button type="button" className="composer-addon-btn" onClick={() => selectedChat && inputRef.current?.click()} disabled={!selectedChat || busy} title="Attach image or document">📎</button>
    <input ref={inputRef} type="file" accept={ACCEPT} onChange={upload} hidden />
  </>;
}
