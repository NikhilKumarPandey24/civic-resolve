import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function AdminComplaint() {
  const { complaintId } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [officers, setOfficers] = useState([])

  const filteredOfficers = officers.filter(
    (officer) =>
      String(officer.is_active) === 'true' &&
      Number(officer.department_id) === Number(complaint?.department_id) &&
      Number(officer.city_id) === Number(complaint?.city_id)
  )

  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingOfficers, setLoadingOfficers] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadComplaint() {
    try {
      const complaintResponse = await fetch(
        `http://localhost:8000/complaints/${complaintId}`
      )

      const complaintData = await complaintResponse.json()

      if (complaintData.success) {
        setComplaint(complaintData)
      } else {
        setMessage(
          complaintData.message || 'Complaint not found.'
        )
      }

      const historyResponse = await fetch(
        `http://localhost:8000/complaints/${complaintId}/history`
      )

      const historyData = await historyResponse.json()

      if (historyData.success) {
        setHistory(historyData.history)
      }
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to server.')
    }
  }

  async function loadOfficers() {
    setLoadingOfficers(true)

    try {
      const response = await fetch(
        'http://localhost:8000/officers'
      )

      const data = await response.json()

      if (Array.isArray(data)) {
        setOfficers(data)
      } else if (data.success && Array.isArray(data.officers)) {
        setOfficers(data.officers)
      } else {
        setOfficers([])
      }
    } catch (error) {
      console.error(error)
      setError('Unable to load officers.')
    } finally {
      setLoadingOfficers(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        loadComplaint(),
        loadOfficers(),
      ])

      setLoading(false)
    }

    loadData()
  }, [complaintId])

  function getStatusStyle(status) {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-700 border-green-200'

      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'

      case 'Assigned':
        return 'bg-purple-100 text-purple-700 border-purple-200'

      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'

      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200'

      case 'Submitted':
        return 'bg-gray-100 text-gray-700 border-gray-200'

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  function getTimelineDot(status) {
    switch (status) {
      case 'Resolved':
        return 'bg-green-500'

      case 'Rejected':
        return 'bg-red-500'

      case 'In Progress':
        return 'bg-blue-500'

      case 'Assigned':
        return 'bg-purple-500'

      case 'Under Review':
        return 'bg-yellow-500'

      default:
        return 'bg-gray-400'
    }
  }

  async function assignOfficer() {
    if (!selectedOfficer) {
      setError('Please select an officer first.')
      return
    }

    setAssigning(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `http://localhost:8000/complaints/${complaintId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            officer_id: Number(selectedOfficer),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(
          data.message || 'Unable to assign officer.'
        )
        return
      }

      setMessage('Officer assigned successfully.')
      setSelectedOfficer('')

      await loadComplaint()
    } catch (error) {
      console.error(error)
      setError('Unable to connect to server.')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-5"></div>

          <h2 className="text-xl font-bold text-gray-900">
            Loading Complaint
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait while we load the complaint details.
          </p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
            <div className="text-5xl mb-4">
              🔍
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Complaint Not Found
            </h2>

            <p className="text-gray-500 mt-2">
              {message ||
                'The requested complaint could not be found.'}
            </p>

            <button
              onClick={() => navigate('/admin')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-200 hover:text-white text-sm font-medium transition mb-5"
          >
            ← Back to Admin Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="text-blue-200 text-sm uppercase tracking-wider font-semibold">
                Admin Complaint Management
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                {complaint.complaint_id}
              </h1>

              <p className="text-blue-100 mt-2">
                Detailed complaint information and activity history.
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center px-4 py-2 rounded-full border text-sm font-bold ${getStatusStyle(
                complaint.status
              )}`}
            >
              {complaint.status}
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
            {error}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Side */}
          <div className="lg:col-span-2 space-y-6">

            {/* Complaint Details */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Complaint Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Complete information submitted by the citizen.
                </p>
              </div>

              <div className="p-6">

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500">
                    Issue Title
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {complaint.title}
                  </h3>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    Description
                  </p>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                      {complaint.description}
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* History */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Complaint History
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Complete record of status changes and remarks.
                </p>
              </div>

              <div className="p-6">

                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No history available for this complaint.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">

                    {history.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="relative flex gap-4"
                      >

                        <div className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full ring-4 ring-white ${getTimelineDot(
                              item.new_status
                            )}`}
                          ></div>

                          {index !== history.length - 1 && (
                            <div className="w-px bg-gray-200 flex-1 mt-2"></div>
                          )}
                        </div>

                        <div className="flex-1 pb-2">

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                            <div>
                              <span className="font-bold text-gray-900">
                                {item.old_status}
                              </span>

                              <span className="mx-2 text-gray-400">
                                →
                              </span>

                              <span className="font-bold text-blue-700">
                                {item.new_status}
                              </span>
                            </div>

                            {item.created_at && (
                              <span className="text-xs text-gray-400">
                                {new Date(
                                  item.created_at
                                ).toLocaleString()}
                              </span>
                            )}

                          </div>

                          {item.changed_by && (
                            <p className="text-sm text-gray-500 mt-2">
                              Updated by:{' '}
                              <span className="font-medium text-gray-700">
                                {item.changed_by}
                              </span>
                            </p>
                          )}

                          {item.remarks && (
                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4">

                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
                                Remarks
                              </p>

                              <p className="text-sm text-gray-700 leading-6">
                                {item.remarks}
                              </p>

                            </div>
                          )}

                        </div>
                      </div>
                    ))}

                  </div>
                )}

              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Assignment Information */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Assignment Information
                </h2>
              </div>

              <div className="p-6 space-y-5">

                <div>
                  <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                    City
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {complaint.city || 'Not available'}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                    Category
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {complaint.category || 'Not available'}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                    Department
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {complaint.department || 'Not assigned'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">

                  <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                    Current Officer
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {complaint.officer || 'Not assigned'}
                  </p>

                </div>

                {/* Officer Selection */}
                <div className="pt-4 border-t border-gray-100">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Officer
                  </label>

                  {loadingOfficers ? (
                    <div className="text-sm text-gray-500 py-3">
                      Loading officers...
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedOfficer}
                        onChange={(event) => {
                          setSelectedOfficer(event.target.value)
                          setError('')
                        }}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">
                          {loadingOfficers
                            ? 'Loading officers...'
                            : filteredOfficers.length === 0
                              ? 'No officers available for this department and city'
                              : 'Select an officer'}
                        </option>

                        {filteredOfficers.map((officer) => (
                          <option
                            key={officer.id || officer.officer_id}
                            value={officer.id || officer.officer_id}
                          >
                            {officer.name}
                          </option>
                        ))}
                      </select>

                      {!loadingOfficers && filteredOfficers.length === 0 && (
                        <p className="mt-2 text-sm text-amber-600">
                          No officers are currently available for this department and city.
                        </p>
                      )}

                      <button
                        onClick={assignOfficer}
                        disabled={assigning || !selectedOfficer}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-xl transition"
                      >
                        {assigning
                          ? 'Assigning Officer...'
                          : 'Assign Officer'}
                      </button>
                    </>
                  )}

                </div>

              </div>
            </section>

            {/* Current Status */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

              <p className="text-sm font-semibold text-gray-500">
                Current Status
              </p>

              <div className="mt-3">

                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-bold ${getStatusStyle(
                    complaint.status
                  )}`}
                >
                  {complaint.status}
                </span>

              </div>

              <p className="text-sm text-gray-500 mt-4 leading-6">
                This status represents the latest recorded stage of the
                complaint.
              </p>

            </section>

          </div>

        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center">

          <p className="text-sm text-gray-500">
            CivicResolve Admin Portal • Complaint Details
          </p>

        </footer>

      </main>
    </div>
  )
}

export default AdminComplaint