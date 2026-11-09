import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { supabase } from './lib/supabase'

function Brand() {
  return <Link className="brand" to="/"><span className="brand-mark">D</span><span>DETwal <b>Messenger</b></span></Link>
}

function Shell({ children }: { children: ReactNode }) {
  return <main className="page"><header className="topbar"><Brand /><span className="top-note">PRIVATE BY DESIGN</span></header>{children}<footer>DETwal Messenger · Early access</footer></main>
}

function HomeRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <StatusCard title="Setting up your account" text="Your profile is being prepared. Refresh this page in a moment." />
  if (profile.status === 'approved') return <Navigate to="/app" replace />
  return <Navigate to="/pending" replace />
}

function Loading() {
  return <div className="center-card"><div className="spinner" /><p>Loading your secure workspace…</p></div>
}

function AuthLayout({ title, subtitle, children, alternate }: { title: string; subtitle: string; children: ReactNode; alternate: ReactNode }) {
  return <Shell><section className="auth-card"><div className="eyebrow">DETWAL MESSENGER</div><h1>{title}</h1><p className="muted">{subtitle}</p>{children}<div className="auth-alternate">{alternate}</div></section></Shell>
}

function LoginPage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && user) navigate(profile?.status === 'approved' ? '/app' : '/pending', { replace: true })
  }, [authLoading, user, profile, navigate])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (signInError) { setError(signInError.message); return }
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      const { data: p } = await supabase.from('profiles').select('status').eq('id', data.user.id).maybeSingle()
      navigate(p?.status === 'approved' ? '/app' : '/pending')
    }
  }

  return <AuthLayout title="Welcome back." subtitle="Sign in to continue to your private conversations." alternate={<>New to DETwal? <Link to="/signup">Create an account</Link></>}>
    <form onSubmit={submit} className="form">
      <label>Email address<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required /></label>
      <div className="form-row end"><Link to="/forgot-password">Forgot password?</Link></div>
      {error && <p className="alert error">{error}</p>}
      <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </AuthLayout>
}

function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError(''); setMessage('')
    const cleanUsername = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
      setBusy(false); setError('Username must be 3–24 characters: lowercase letters, numbers or underscores.'); return
    }
    if (password.length < 10) {
      setBusy(false); setError('Use a password with at least 10 characters.'); return
    }
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username: cleanUsername, display_name: displayName.trim() },
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    })
    setBusy(false)
    if (signupError) { setError(signupError.message); return }
    if (data.session) setMessage('Your registration request is submitted. You can sign in while an administrator reviews it.')
    else setMessage('Check your email and confirm your address. Your account will remain pending until an administrator approves it.')
  }

  return <AuthLayout title="Create your account." subtitle="Choose your DETwal username. New registrations require approval." alternate={<>Already registered? <Link to="/login">Sign in</Link></>}>
    <form onSubmit={submit} className="form">
      <label>Display name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={60} autoComplete="name" placeholder="Your name" required /></label>
      <label>Username<div className="input-prefix"><span>@</span><input value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} minLength={3} maxLength={24} autoComplete="username" placeholder="your_username" required /></div><small>3–24 characters. Letters, numbers and underscores only.</small></label>
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={10} autoComplete="new-password" placeholder="At least 10 characters" required /></label>
      {error && <p className="alert error">{error}</p>}
      {message && <p className="alert success">{message}</p>}
      <button disabled={busy}>{busy ? 'Submitting…' : 'Request an account'}</button>
      <p className="fine-print">By continuing, you agree to use DETwal Messenger responsibly. Do not use this early version for sensitive conversations.</p>
    </form>
  </AuthLayout>
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname + '#/reset-password',
    })
    setBusy(false)
    if (resetError) setError(resetError.message)
    else setMessage('If an account exists for that email, a password-reset link has been sent.')
  }
  return <AuthLayout title="Reset your password." subtitle="We’ll send you a secure reset link." alternate={<Link to="/login">Back to sign in</Link>}>
    <form onSubmit={submit} className="form">
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" /></label>
      {error && <p className="alert error">{error}</p>}{message && <p className="alert success">{message}</p>}
      <button disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
    </form>
  </AuthLayout>
}

function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) setError(updateError.message)
    else setMessage('Password updated. You can now sign in with your new password.')
  }
  return <AuthLayout title="Choose a new password." subtitle="Use at least 10 characters." alternate={<Link to="/login">Back to sign in</Link>}>
    <form onSubmit={submit} className="form">
      <label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={10} required autoComplete="new-password" /></label>
      {error && <p className="alert error">{error}</p>}{message && <p className="alert success">{message}</p>}
      <button disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
    </form>
  </AuthLayout>
}

function StatusCard({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <Shell><section className="status-card"><div className="status-icon">D</div><h1>{title}</h1><p className="muted">{text}</p>{action}</section></Shell>
}

function PendingPage() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.status === 'approved') return <Navigate to="/app" replace />
  if (profile?.status === 'rejected' || profile?.status === 'suspended') return <Navigate to="/access" replace />
  async function signOut() { await supabase.auth.signOut() }
  return <StatusCard title="Your request is in review." text="Your email is verified, and your registration is waiting for approval by a DETwal administrator. You’ll be able to enter Messenger once approved." action={<button className="secondary" onClick={signOut}>Sign out</button>} />
}

function AccessPage() {
  const { user } = useAuth()
  return <StatusCard title="Access is unavailable." text="Your account has not been approved for Messenger. If you believe this is a mistake, contact the project owner." action={user ? <button className="secondary" onClick={()=>supabase.auth.signOut()}>Sign out</button> : <Link to="/login">Return to sign in</Link>} />
}

function AppPage() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <StatusCard title="Profile unavailable." text="We could not load your profile. Please sign out and try again." />
  if (profile.status !== 'approved') return <Navigate to="/pending" replace />
  return <Shell><section className="welcome-card"><div className="eyebrow">YOUR ACCOUNT</div><h1>Hello, {profile.display_name}.</h1><p className="muted">You’re signed in as <strong>@{profile.username}</strong>.</p><div className="account-meta"><span>Role: {profile.role}</span><span>Status: {profile.status}</span></div><p className="coming-soon">Your private messaging workspace is the next build phase.</p><button className="secondary" onClick={()=>supabase.auth.signOut()}>Sign out</button></section></Shell>
}

function AuthCallbackPage() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <StatusCard title="Link could not be verified." text="The link may have expired. Return to sign in and request a new link." action={<Link to="/login">Go to sign in</Link>} />
  return <Navigate to={profile?.status === 'approved' ? '/app' : '/pending'} replace />
}

export default function App() {
  return <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/pending" element={<PendingPage />} />
    <Route path="/access" element={<AccessPage />} />
    <Route path="/app" element={<AppPage />} />
    <Route path="/auth/callback" element={<AuthCallbackPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}