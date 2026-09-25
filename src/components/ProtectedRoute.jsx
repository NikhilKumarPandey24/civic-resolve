import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user')

  // No login
  if (!token || !userData) {
    return <Navigate to="/login" replace />
  }

  let user

  try {
    user = JSON.parse(userData)
  } catch (error) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    return <Navigate to="/login" replace />
  }

  // Role not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    if (user.role === 'officer') {
      return <Navigate to="/officer" replace />
    }

    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute