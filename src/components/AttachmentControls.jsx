import React, { useRef, useState } from 'react';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPT = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
].join(',');

export default function AttachmentControls({ selectedChat, apiBridge, onUploaded }) {
  const inputRef = useRef(null);
  const [policy, setPolicy] = useState('APPROVAL_REQUIRED');
  const [busy, setBusy] = useState(false);

  const openPicker = () => {
    if (!selectedChat || busy) return;
    inputRef.current?.click();
  };

  const upload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !selectedChat || !apiBridge) return;

    if (file.size <= 0) {
      alert('The selected file is empty.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File size cannot exceed 25 MB.');
      return;
    }

    setBusy(true);

    try {
      const form = new FormData();
      form.append('chat_id', String(selectedChat.id));
      form.append('file', file);
      form.append('download_policy', policy);

      const result = await apiBridge('/upload_attachment.php', {
        method: 'POST',
        body: form
      });

      if (!result?.message) {
        throw new Error('Attachment upload completed without a message response.');
      }

      onUploaded?.(result.message);
    } catch (err) {
      alert(err?.message || 'Unable to upload attachment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0
      }}
    >
      <select
        value={policy}
        onChange={e => setPolicy(e.target.value)}
        disabled={!selectedChat || busy}
        title="Attachment download permission"
        aria-label="Attachment download permission"
        style={{
          height: '34px',
          maxWidth: '150px',
          border: '0',
          background: 'transparent',
          color: 'var(--text-main)',
          fontSize: '12px',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="APPROVAL_REQUIRED">🔒 Approval</option>
        <option value="ALLOW">⬇ Allow download</option>
        <option value="VIEW_ONLY">👁 View only</option>
      </select>

      <button
        type="button"
        className="composer-addon-btn"
        onClick={openPicker}
        disabled={!selectedChat || busy}
        title={busy ? 'Uploading attachment...' : 'Attach image or document'}
        aria-label={busy ? 'Uploading attachment' : 'Attach image or document'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '36px',
          minHeight: '34px',
          visibility: 'visible',
          opacity: 1
        }}
      >
        {busy ? '…' : '📎'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={upload}
        disabled={!selectedChat || busy}
        style={{ display: 'none' }}
      />
    </div>
  );
}
