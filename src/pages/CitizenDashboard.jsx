import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function CitizenDashboard() {
  const [user, setUser] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }

    const fetchComplaints = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setError('Please login to access your dashboard.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          'http://localhost:8000/citizen/complaints',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.detail ||
            'Unable to load your complaints.'
          )
          setLoading(false)
          return
        }

        setComplaints(data)
      } catch {
        setError(
          'Unable to connect to the server.'
        )
      }

      setLoading(false)
    }

    fetchComplaints()
  }, [])

  const totalComplaints = complaints.length

  const pendingComplaints = complaints.filter(
    (complaint) =>
      complaint.status !== 'Resolved' &&
      complaint.status !== 'Rejected'
  ).length

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === 'Resolved'
  ).length

  const recentComplaints = complaints.slice(0, 5)

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-700'

      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700'

      case 'Assigned':
        return 'bg-purple-100 text-purple-700'

      case 'In Progress':
        return 'bg-blue-100 text-blue-700'

      case 'Resolved':
        return 'bg-green-100 text-green-700'

      case 'Rejected':
        return 'bg-red-100 text-red-700'

      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">

      <div className="mx-auto max-w-7xl">

        {/* Welcome */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-blue-700">
            CivicResolve
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {user?.name || 'Citizen'}
          </h1>

          <p className="mt-2 text-slate-600">
            Manage and track the civic issues you have reported.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Total Complaints
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading ? '—' : totalComplaints}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-3 text-3xl font-bold text-orange-600">
              {loading ? '—' : pendingComplaints}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Resolved
            </p>

            <p className="mt-3 text-3xl font-bold text-green-600">
              {loading ? '—' : resolvedComplaints}
            </p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">

          <Link
            to="/report"
            className="rounded-2xl bg-blue-700 p-6 text-white shadow-sm transition hover:bg-blue-800"
          >
            <h2 className="text-xl font-bold">
              Report a New Issue
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              Submit a new civic complaint to the responsible department.
            </p>

            <span className="mt-5 inline-block text-sm font-semibold">
              Report Issue →
            </span>
          </Link>

          <Link
            to="/my-complaints"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:ring-blue-300"
          >
            <h2 className="text-xl font-bold text-slate-900">
              View My Complaints
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              View all complaints you have submitted and track their progress.
            </p>

            <span className="mt-5 inline-block text-sm font-semibold text-blue-700">
              My Complaints →
            </span>
          </Link>

        </div>

        {/* Recent Complaints */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              Recent Complaints
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest submitted civic issues.
            </p>

          </div>

          {loading ? (

            <div className="p-8 text-center text-slate-500">
              Loading complaints...
            </div>

          ) : recentComplaints.length === 0 ? (

            <div className="p-8 text-center">

              <p className="text-slate-500">
                You haven't submitted any complaints yet.
              </p>

              <Link
                to="/report"
                className="mt-4 inline-block font-semibold text-blue-700 hover:text-blue-800"
              >
                Report your first issue →
              </Link>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {recentComplaints.map((complaint) => (

                <div
                  key={complaint.complaint_id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >

                  <div>

                    <p className="text-sm font-semibold text-blue-700">
                      {complaint.complaint_id}
                    </p>

                    <h3 className="mt-1 font-bold text-slate-900">
                      {complaint.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {complaint.city} • {complaint.category}
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>

                    <Link
                      to={`/track?complaint=${complaint.complaint_id}`}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Track →
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default CitizenDashboard