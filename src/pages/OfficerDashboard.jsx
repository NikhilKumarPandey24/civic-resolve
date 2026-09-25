import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function OfficerDashboard() {
  const [complaints, setComplaints] = useState([])
  const [user, setUser] = useState(null)
  const [officerId, setOfficerId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const token = localStorage.getItem('access_token')

  const loadOfficerData = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!token) {
        setError('Please login as an officer.')
        setLoading(false)
        return
      }

      // Get logged-in user
      const userResponse = await fetch(
        'http://localhost:8000/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const userData = await userResponse.json()

      if (!userResponse.ok || !userData.success) {
        setError(userData.detail || 'Unable to get account information.')
        setLoading(false)
        return
      }

      setUser(userData.user)

      if (userData.user.role !== 'officer') {
        setError('Officer access required.')
        setLoading(false)
        return
      }

      // Get the officer linked to this user
      const officerResponse = await fetch(
        'http://localhost:8000/officers/me',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const officerData = await officerResponse.json()

      if (!officerResponse.ok || !officerData.success) {
        setError(
          officerData.detail ||
          officerData.message ||
          'Unable to load officer information.'
        )
        setLoading(false)
        return
      }

      const currentOfficer = officerData.officer

      setOfficerId(currentOfficer.id)

      // Get this officer's complaints
      const complaintsResponse = await fetch(
        `http://localhost:8000/officers/${currentOfficer.id}/complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const complaintsData = await complaintsResponse.json()

      if (!complaintsResponse.ok) {
        setError(
          complaintsData.detail ||
          'Unable to load complaints.'
        )
        setLoading(false)
        return
      }

      setComplaints(complaintsData)

    } catch (err) {
      setError('Server error. Please try again.')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadOfficerData()
  }, [])

  const totalComplaints = complaints.length

  const pendingComplaints = complaints.filter(
    (complaint) =>
      !['Resolved', 'Rejected'].includes(complaint.status)
  ).length

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === 'Resolved'
  ).length

  const rejectedComplaints = complaints.filter(
    (complaint) => complaint.status === 'Rejected'
  ).length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Officer Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Officer Dashboard
            </h1>

            {user && (
              <p className="mt-2 text-slate-600">
                Welcome, {user.name}
              </p>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Loading officer dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid gap-5 md:grid-cols-4">

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Total Assigned
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalComplaints}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {pendingComplaints}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Resolved
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {resolvedComplaints}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Rejected
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {rejectedComplaints}
                </p>
              </div>

            </div>

            {/* Complaints */}
            <div className="mt-8 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">

              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Assigned Complaints
                </h2>

                {officerId && (
                  <p className="mt-1 text-sm text-slate-500">
                    Officer ID: {officerId}
                  </p>
                )}
              </div>

              {complaints.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500">
                  No complaints are currently assigned to you.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">

                  {complaints.map((complaint) => (
                    <div
                      key={complaint.complaint_id}
                      className="p-6 hover:bg-slate-50"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                          <p className="text-sm font-semibold text-blue-700">
                            {complaint.complaint_id}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-slate-900">
                            {complaint.title}
                          </h3>

                          <p className="mt-2 text-sm text-slate-600">
                            {complaint.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                              {complaint.city}
                            </span>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                              {complaint.category}
                            </span>

                            <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                              {complaint.department}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                            {complaint.status}
                          </span>

                          <Link
                            to={`/officer/complaint/${complaint.complaint_id}`}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                          >
                            View Complaint
                          </Link>

                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default OfficerDashboard