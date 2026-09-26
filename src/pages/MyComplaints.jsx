import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-700'

      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700'

      case 'Assigned':
        return 'bg-purple-100 text-purple-700'

      case 'In Progress':
        return 'bg-orange-100 text-orange-700'

      case 'Resolved':
        return 'bg-green-100 text-green-700'

      case 'Rejected':
        return 'bg-red-100 text-red-700'

      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setError('Please login to view your complaints.')
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
      } catch (err) {
        setError(
          'Unable to connect to the server.'
        )
      }

      setLoading(false)
    }

    fetchComplaints()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-blue-700">
            CivicResolve
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Complaints
          </h1>

          <p className="mt-2 text-slate-600">
            View and track the civic issues you have reported.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-600">
              Loading your complaints...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && complaints.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">

            <h2 className="text-xl font-semibold text-slate-900">
              No complaints found
            </h2>

            <p className="mt-2 text-slate-600">
              You have not submitted any complaints yet.
            </p>

            <Link
              to="/report"
              className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Report an Issue
            </Link>

          </div>
        )}

        {/* Complaints */}
        {!loading && !error && complaints.length > 0 && (
          <div className="space-y-5">

            {complaints.map((complaint) => (
              <div
                key={complaint.complaint_id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-lg font-bold text-slate-900">
                        {complaint.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-medium text-blue-700">
                      {complaint.complaint_id}
                    </p>

                  </div>

                  <Link
                    to={`/track?complaint=${complaint.complaint_id}`}
                    className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Track Complaint
                  </Link>

                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {complaint.description}
                </p>

                <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      City
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {complaint.city}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Category
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {complaint.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {complaint.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Officer
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {complaint.officer || 'Not assigned yet'}
                    </p>
                  </div>

                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">

                  <p className="text-xs text-slate-500">
                    Submitted on{' '}
                    {complaint.created_at
                      ? new Date(
                          complaint.created_at
                        ).toLocaleString()
                      : 'N/A'}
                  </p>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default MyComplaints