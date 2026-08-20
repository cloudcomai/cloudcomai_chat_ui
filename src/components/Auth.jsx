import React, { useState } from 'react';
import TermsModal from './TermsModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';

export default function Auth({ onAuth, apiBridge }) {
  const [mode, setMode] = useState('login');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', user_id: '', password: '', dob: '', gender: 'Male' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && !acceptedTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let response;
      if (mode === 'register') {
        response = await apiBridge('/register.php', {
          method: 'POST',
          body: JSON.stringify({ name: form.name, email: form.email, mobile: form.mobile, user_id: form.user_id, password: form.password, dob: form.dob, gender: form.gender })
        });
        if (!response?.user || !response?.token) throw new Error('Invalid response received from server');
        onAuth(response.user, response.token);
      } else if (mode === 'forgot') {
        response = await apiBridge('/forgot_password.php', {
          method: 'POST',
          body: JSON.stringify({ identifier: form.email })
        });
        setSuccess(response?.message || 'If the account exists, password reset instructions have been sent.');
      } else {
        response = await apiBridge('/login.php', {
          method: 'POST',
          body: JSON.stringify({ identifier: form.email, password: form.password })
        });
        if (!response?.user || !response?.token) throw new Error('Invalid response received from server');
        onAuth(response.user, response.token);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = nextMode => {
    setError('');
    setSuccess('');
    setMode(nextMode);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand center"><div className="logo">C</div><div><strong>CloudComAI</strong><small>Secure Messenger</small></div></div>
        <h1>{mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : 'Reset your password'}</h1>

        <form onSubmit={submit}>
          {mode === 'register' && <>
            <input required placeholder="Full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/>
            <input placeholder="CloudComAI User ID" value={form.user_id} onChange={e => setForm({...form, user_id:e.target.value})}/>
            <input type="date" required value={form.dob} onChange={e => setForm({...form, dob:e.target.value})}/>
            <select value={form.gender} onChange={e => setForm({...form, gender:e.target.value})}><option value="Male">Male</option><option value="Female">Female</option></select>
            <input required placeholder="Mobile number" value={form.mobile} onChange={e => setForm({...form, mobile:e.target.value})}/>
          </>}

          <input required placeholder={mode === 'forgot' ? 'Registered email, mobile or User ID' : 'Email, mobile or User ID'} value={form.email} onChange={e => setForm({...form, email:e.target.value})}/>
          {mode !== 'forgot' && <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password:e.target.value})}/>} 

          {mode === 'register' && <div className="terms-checkbox"><label>
            <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}/>
            <span>I agree to <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>Terms & Conditions</button> and <button type="button" className="terms-link" onClick={() => setShowPrivacy(true)}>Privacy Policy</button></span>
          </label></div>}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button type="submit" className="primary wide" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register' : 'Send Reset Instructions'}</button>
        </form>

        {mode === 'login' && <button type="button" className="link" onClick={() => switchMode('forgot')}>Forgot Password?</button>}
        {mode === 'forgot' && <button type="button" className="link" onClick={() => switchMode('login')}>Back to Sign In</button>}
        {mode !== 'forgot' && <button type="button" className="link" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}</button>}

        {showTerms && <TermsModal onClose={() => setShowTerms(false)}/>} 
        {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)}/>} 
      </div>
    </div>
  );
}
