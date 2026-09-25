import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user')

  let user = null

  try {
    user = userData ? JSON.parse(userData) : null
  } catch {
    user = null
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold">
          CivicResolve
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-blue-200"
          >
            Home
          </Link>

          <Link
            to="/report"
            className="hover:text-blue-200"
          >
            Report Issue
          </Link>

          <Link
            to="/track"
            className="hover:text-blue-200"
          >
            Track Complaint
          </Link>

          {user?.role === 'officer' && (
            <Link
              to="/officer"
              className="hover:text-blue-200"
            >
              Officer
            </Link>
          )}

          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin"
                className="hover:text-blue-200"
              >
                Admin
              </Link>

              <Link
                to="/admin/officers"
                className="hover:text-blue-200"
              >
                Officers
              </Link>
            </>
          )}

          {token && user ? (
            <>
              <span className="hidden text-sm text-blue-100 md:block">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar