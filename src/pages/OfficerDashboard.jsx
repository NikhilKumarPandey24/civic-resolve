import {
  useEffect,
  useState
} from 'react'

import { useNavigate } from 'react-router-dom'


function OfficerDashboard() {

  const navigate = useNavigate()

  const [officer, setOfficer] =
    useState(null)

  const [complaints, setComplaints] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [message, setMessage] =
    useState('')


  const officerId = 1


  useEffect(() => {

    async function loadDashboard() {

      try {

        const response = await fetch(
          `http://localhost:8000/officers/${officerId}/complaints`
        )

        const data =
          await response.json()


        if (data.success) {

          setOfficer(data.officer)

          setComplaints(
            data.complaints
          )

        } else {

          setMessage(
            data.message
          )

        }

      } catch (error) {

        console.error(error)

        setMessage(
          'Unable to connect to server.'
        )

      } finally {

        setLoading(false)

      }

    }


    loadDashboard()

  }, [])


  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700">
          </div>

          <p className="font-medium text-slate-600">
            Loading officer dashboard...
          </p>

        </div>

      </div>

    )

  }


  const totalComplaints =
    complaints.length


  const pendingComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status !== 'Resolved' &&
        complaint.status !== 'Rejected'
    ).length


  const resolvedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === 'Resolved'
    ).length


  const rejectedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === 'Rejected'
    ).length


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

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'

    }

  }


  return (

    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">


        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              CivicResolve • Officer Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
              Officer Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Manage and resolve complaints assigned to you.
            </p>

          </div>


          {officer && (

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Logged in as
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {officer.name}
              </p>

              <p className="text-sm text-slate-500">
                Officer ID: {officer.officer_id}
              </p>

            </div>

          )}

        </div>


        {/* ERROR */}

        {message && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-medium text-red-700">
            {message}
          </div>

        )}


        {/* OFFICER PROFILE */}

        {officer && (

          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-lg">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
                  {officer.name
                    ? officer.name.charAt(0).toUpperCase()
                    : 'O'}
                </div>

                <div>

                  <p className="text-sm text-blue-100">
                    Welcome back
                  </p>

                  <h2 className="text-2xl font-bold">
                    {officer.name}
                  </h2>

                  <p className="mt-1 text-sm text-blue-100">
                    {officer.email}
                  </p>

                </div>

              </div>


              <div className="rounded-xl bg-white/10 px-5 py-4">

                <p className="text-xs uppercase tracking-wide text-blue-100">
                  Assigned Complaints
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {totalComplaints}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* STATISTICS */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Assigned
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalComplaints}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                📋
              </div>

            </div>

          </div>


          {/* PENDING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {pendingComplaints}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl">
                ⏳
              </div>

            </div>

          </div>


          {/* RESOLVED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {resolvedComplaints}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
                ✓
              </div>

            </div>

          </div>


          {/* REJECTED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Rejected
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {rejectedComplaints}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl">
                !
              </div>

            </div>

          </div>

        </div>


        {/* COMPLAINTS */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-2xl font-bold text-slate-900">
              Assigned Complaints
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complaints currently assigned to your department.
            </p>

          </div>


          {complaints.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mb-4 text-5xl">
                📭
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                No complaints assigned
              </h3>

              <p className="mt-2 text-slate-500">
                There are currently no complaints assigned to you.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-200">

              {complaints.map((complaint) => (

                <div
                  key={complaint.id}
                  className="p-6 transition hover:bg-slate-50"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


                    {/* COMPLAINT INFORMATION */}

                    <div className="min-w-0 flex-1">

                      <div className="mb-2 flex flex-wrap items-center gap-3">

                        <span className="font-mono text-sm font-bold text-blue-700">
                          {complaint.complaint_id}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>

                      </div>


                      <h3 className="text-xl font-bold text-slate-900">
                        {complaint.title}
                      </h3>


                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">

                        <span>
                          📂 {complaint.category}
                        </span>

                        <span>
                          📍 {complaint.city}
                        </span>

                      </div>


                      <p className="mt-4 line-clamp-2 text-slate-600">
                        {complaint.description}
                      </p>

                    </div>


                    {/* ACTION */}

                    <div className="shrink-0">

                      <button
                        onClick={() =>
                          navigate(
                            `/officer/complaint/${complaint.complaint_id}`
                          )
                        }
                        className="w-full rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 lg:w-auto"
                      >
                        View Complaint →
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* FOOTER */}

        <div className="py-6 text-center text-sm text-slate-500">

          CivicResolve Officer Portal • Manage complaints responsibly

        </div>

      </div>

    </div>

  )

}


export default OfficerDashboard