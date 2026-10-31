import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Login.css'

const roles = [
  { value: 'citizen', label: 'Citizen', detail: 'Report and track issues' },
  { value: 'officer', label: 'Officer', detail: 'Manage assigned cases' },
  { value: 'admin', label: 'Admin', detail: 'Oversee city services' },
]

function RoleIcon({ role }) {
  if (role === 'citizen') {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.6-3.5 3.3-5.5 7-5.5s6.4 2 7 5.5" /></svg>
  }

  if (role === 'officer') {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 19 6v5.2c0 4.4-2.8 7.8-7 9.8-4.2-2-7-5.4-7-9.8V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
  }

  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20V6l8-3 8 3v14M2.5 20h19" /><path d="M8 9h1m6 0h1M8 13h1m6 0h1m-4 7v-4" /></svg>
}

function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedRole = roles.some(({ value }) => value === searchParams.get('role'))
    ? searchParams.get('role')
    : 'citizen'
  const [loginRole, setLoginRole] = useState(requestedRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedRole = roles.find(({ value }) => value === loginRole)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok || !data.success || !data.user) {
        setError(data.message || 'We couldn’t sign you in. Check your details and try again.')
        return
      }

      if (data.user.role !== loginRole) {
        const roleName = roles.find(({ value }) => value === data.user.role)?.label || 'different'
        setError(`These credentials belong to a ${roleName} account. Choose the matching account type to sign in.`)
        return
      }

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      if (data.user.role === 'admin') {
        navigate('/admin')
      } else if (data.user.role === 'officer') {
        navigate('/officer')
      } else {
        navigate('/citizen')
      }
    } catch {
      setError('Unable to connect to the server. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    if (error) setError('')
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Sign in to CivicResolve">
        <aside className="login-intro">
          <Link className="login-brand" to="/" aria-label="CivicResolve home">
            <span className="login-brand-mark" aria-hidden="true">C</span>
            <span>Civic<span>Resolve</span></span>
          </Link>

          <div className="login-intro-copy">
            <p className="login-eyebrow"><span /> YOUR CITY, MOVING FORWARD</p>
            <h1>Small reports.<br /><em>Real change.</em></h1>
            <p className="login-intro-text">
              A simpler way for residents and city teams to work together on the places we share.
            </p>
          </div>

          <div className="login-preview" aria-hidden="true">
            <div className="login-preview-top">
              <span className="login-preview-icon">✓</span>
              <span><b>Issue received</b><small>Ward 04 · just now</small></span>
              <span className="login-preview-status">IN REVIEW</span>
            </div>
            <div className="login-preview-track"><span /></div>
            <div className="login-preview-steps"><span>Reported</span><span>In review</span><span>Resolved</span></div>
          </div>

          <p className="login-intro-foot"><span aria-hidden="true">✳</span> Better neighborhoods start with being heard.</p>
          <div className="login-orbit login-orbit-one" aria-hidden="true" />
          <div className="login-orbit login-orbit-two" aria-hidden="true" />
        </aside>

        <div className="login-content">
          <div className="login-mobile-brand">
            <Link className="login-brand" to="/" aria-label="CivicResolve home">
              <span className="login-brand-mark" aria-hidden="true">C</span>
              <span>Civic<span>Resolve</span></span>
            </Link>
          </div>

          <div className="login-heading">
            <p className="login-welcome">Welcome back</p>
            <h2>Sign in to your account</h2>
            <p>Pick your account type to get to the right place.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <fieldset className="login-role-picker">
              <legend>I’m signing in as a</legend>
              <div className="login-role-options">
                {roles.map(({ value, label, detail }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={loginRole === value}
                    className={`login-role-option${loginRole === value ? ' is-selected' : ''}`}
                    onClick={() => {
                      setLoginRole(value)
                      clearError()
                    }}
                  >
                    <RoleIcon role={value} />
                    <span className="login-role-label">{label}</span>
                    <span className="login-role-detail">{detail}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="login-fields">
              <div className="login-field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    clearError()
                  }}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-password-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      clearError()
                    }}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}

            <button className="login-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Signing you in…' : `Continue as ${selectedRole?.label || 'Citizen'}`}</span>
              <span aria-hidden="true">{loading ? <span className="login-spinner" /> : '→'}</span>
            </button>

            <p className="login-secure-note"><span aria-hidden="true">✓</span> Your account details are protected and secure</p>
          </form>

          {loginRole === 'citizen' && (
            <p className="login-register">
              New to CivicResolve? <Link to="/register">Create a citizen account <span aria-hidden="true">→</span></Link>
            </p>
          )}
          <Link className="login-back-link" to="/">← Back to home</Link>
        </div>
      </section>
    </main>
  )
}

export default Login
