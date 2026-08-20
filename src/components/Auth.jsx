import React, { useState } from 'react';
import TermsModal from './TermsModal';

export default function Auth({ onAuth, apiBridge }) {
  const [mode, setMode] = useState('login');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', user_id: '', password: '', dob: '', gender: 'Male'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && !acceptedTerms) {
      alert('Please accept the Terms & Conditions and Privacy Policy.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let response;
      if (mode === 'register') {
        response = await apiBridge('/register.php', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name, email: form.email, mobile: form.mobile,
            user_id: form.user_id, password: form.password, dob: form.dob, gender: form.gender
          })
        });
      } else {
        response = await apiBridge('/login.php', {
          method: 'POST',
          body: JSON.stringify({
            identifier: form.email || form.user_id || form.mobile,
            password: form.password
          })
        });
      }

      if (!response?.user || !response?.token) {
        throw new Error('Invalid response received from server');
      }
      onAuth(response.user, response.token);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand center">
          <div className="logo">C</div>
          <div><strong>CloudComAI</strong><small>Secure Messenger</small></div>
        </div>

        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input placeholder="CloudComAI User ID" value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} />
              <input type="date" required value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input required placeholder="Mobile number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
            </>
          )}

          <input required placeholder="Email, mobile or User ID" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

          {mode === 'register' && (
            <div className="terms-checkbox">
              <label>
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
                <span>I agree to <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>Terms & Conditions</button> and Privacy Policy</span>
              </label>
            </div>
          )}

          {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
          {error && <div className="error">{error}</div>}

          <button type="submit" className="primary wide" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Register'}
          </button>
        </form>

        <button type="button" className="link" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}
