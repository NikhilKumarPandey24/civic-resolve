import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8000/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(
          data.message ||
          'Invalid email or password.'
        )
        setLoading(false)
        return
      }

      // Store JWT token
      localStorage.setItem(
        'access_token',
        data.access_token
      )

      // Store user information
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )

      // Redirect according to role
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else if (data.user.role === 'officer') {
        navigate('/officer')
      } else {
        navigate('/')
      }

    } catch (err) {
      setError(
        'Unable to connect to the server.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-blue-700">
            CivicResolve
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-600">
            Login to access your CivicResolve account.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Login