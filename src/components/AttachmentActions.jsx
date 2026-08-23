import React, { useState } from 'react';

export default function AttachmentActions({ attachment, message, user, apiBridge }) {
  const [status, setStatus] = useState(attachment?.download_status || '');
  const [busy, setBusy] = useState(false);
  if (!attachment?.id) return null;

  const isSender = Number(message?.sender_id) === Number(user?.id) || Number(message?.user_id) === Number(user?.id) || message?.mine === true;
  const policy = attachment.download_policy || 'APPROVAL_REQUIRED';
  const download = () => { window.open(`${import.meta.env.VITE_API_BASE_URL || 'https://cloudcomai.com/apiapp/api'}/attachment.php?id=${encodeURIComponent(attachment.id)}`, '_blank', 'noopener,noreferrer'); };

  const requestDownload = async () => {
    setBusy(true);
    try {
      const result = await apiBridge('/request_attachment_download.php', { method: 'POST', body: JSON.stringify({ attachment_id: Number(attachment.id) }) });
      setStatus(result?.status || 'PENDING');
    } catch (err) { alert(err.message || 'Unable to request download.'); }
    finally { setBusy(false); }
  };

  const respond = async nextStatus => {
    setBusy(true);
    try {
      const result = await apiBridge('/respond_attachment_download.php', { method: 'POST', body: JSON.stringify({ request_id: Number(attachment.download_request_id), status: nextStatus }) });
      setStatus(result?.status || nextStatus);
    } catch (err) { alert(err.message || 'Unable to update download request.'); }
    finally { setBusy(false); }
  };

  if (isSender && attachment.download_request_id && status === 'PENDING') return <span style={{ display: 'inline-flex', gap: '5px' }}><button type="button" className="composer-addon-btn" onClick={() => respond('APPROVED')} disabled={busy}>Approve</button><button type="button" className="composer-addon-btn" onClick={() => respond('DENIED')} disabled={busy}>Deny</button></span>;
  if (isSender || policy === 'ALLOW') return <button type="button" className="composer-addon-btn" onClick={download} disabled={busy}>Download</button>;
  if (policy === 'VIEW_ONLY') return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>View only</span>;
  if (status === 'APPROVED') return <button type="button" className="composer-addon-btn" onClick={download} disabled={busy}>Download</button>;
  if (status === 'PENDING') return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Download request pending</span>;
  return <button type="button" className="composer-addon-btn" onClick={requestDownload} disabled={busy}>Request download</button>;
}
