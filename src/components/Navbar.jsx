import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user')

  let user = null
  try {
    user = userData ? JSON.parse(userData) : null
  } catch {
    user = null
  }

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)
  const navLink = 'nav-link'
  const canReport = !user || user.role === 'citizen'

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={closeMenu} aria-label="CivicResolve home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>Civic<span className="brand-accent">Resolve</span><small>PUBLIC SERVICE PORTAL</small></span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>

        <div className={`nav-content${menuOpen ? ' is-open' : ''}`}>
          <div className="nav-main-links">
            <Link to="/" className={navLink} onClick={closeMenu}>Home</Link>
            {canReport && <Link to="/report" className={navLink} onClick={closeMenu}>Report an issue</Link>}
            <Link to="/track" className={navLink} onClick={closeMenu}>Track complaint</Link>
            {user?.role === 'citizen' && <>
              <Link to="/citizen" className={navLink} onClick={closeMenu}>Dashboard</Link>
              <Link to="/my-complaints" className={navLink} onClick={closeMenu}>My complaints</Link>
            </>}
            {user?.role === 'officer' && <Link to="/officer" className={navLink} onClick={closeMenu}>Officer portal</Link>}
            {user?.role === 'admin' && <>
              <Link to="/admin" className={navLink} onClick={closeMenu}>Admin</Link>
              <Link to="/admin/officers" className={navLink} onClick={closeMenu}>Officers</Link>
            </>}
          </div>
          <div className="nav-account">
            {token && user ? <>
              <span className="nav-user"><span className="nav-user-dot" />{user.name}</span>
              <button type="button" onClick={handleLogout} className="nav-action nav-action-muted">Log out</button>
            </> : <Link to="/login" onClick={closeMenu} className="nav-action">Sign in <span aria-hidden="true">→</span></Link>}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
