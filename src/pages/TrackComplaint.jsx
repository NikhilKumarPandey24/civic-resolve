import { useState } from 'react'

function TrackComplaint() {

  const [complaintId, setComplaintId] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)


  async function trackComplaint(event) {

    event.preventDefault()

    if (!complaintId.trim()) {

      setMessage('Please enter your Complaint ID.')
      return

    }

    setLoading(true)
    setMessage('')
    setComplaint(null)
    setHistory([])

    try {

      const response = await fetch(
        `http://localhost:8000/complaints/${complaintId.trim()}`
      )

      const data = await response.json()


      if (data.success) {

        setComplaint(data)


        const historyResponse = await fetch(
          `http://localhost:8000/complaints/${complaintId.trim()}/history`
        )

        const historyData =
          await historyResponse.json()


        if (historyData.success) {

          setHistory(historyData.history)

        }

      } else {

        setMessage(
          data.message || 'Complaint not found.'
        )

      }

    } catch (error) {

      console.error(error)

      setMessage(
        'Unable to connect to the server. Make sure the backend is running.'
      )

    } finally {

      setLoading(false)

    }
  }


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


  const statusSteps = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved'
  ]


  function getStatusIndex(status) {

    const index = statusSteps.indexOf(status)

    return index === -1 ? 0 : index

  }


  return (

    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-5xl">


        {/* HEADER */}

        <div className="mb-8 text-center">

          <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            CivicResolve
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Track Your Complaint
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Enter your Complaint ID to check the current status
            and progress of your civic issue.
          </p>

        </div>


        {/* SEARCH CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">

          <form
            onSubmit={trackComplaint}
            className="flex flex-col gap-4 md:flex-row"
          >

            <div className="flex-1">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Complaint ID
              </label>

              <input
                type="text"
                placeholder="Example: CR-2026-0001"
                value={complaintId}
                onChange={(event) =>
                  setComplaintId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>


            <div className="flex items-end">

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-8 py-3 font-bold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >

                {loading
                  ? 'Tracking...'
                  : 'Track Complaint'
                }

              </button>

            </div>

          </form>


          {/* ERROR */}

          {message && (

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center font-medium text-red-700">
              {message}
            </div>

          )}

        </div>


        {/* COMPLAINT RESULT */}

        {complaint && (

          <div className="mt-8 space-y-6">


            {/* BASIC DETAILS */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

              <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-6 text-white md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-medium text-blue-100">
                    Complaint Details
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {complaint.title}
                  </h2>

                </div>


                <div
                  className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(
                    complaint.status
                  )}`}
                >
                  {complaint.status}
                </div>

              </div>


              <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">


                {/* COMPLAINT ID */}

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Complaint ID
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {complaint.complaint_id}
                  </p>

                </div>


                {/* CITY */}

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    City
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {complaint.city}
                  </p>

                </div>


                {/* CATEGORY */}

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Issue Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {complaint.category}
                  </p>

                </div>


                {/* DEPARTMENT */}

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Responsible Department
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {complaint.department}
                  </p>

                </div>


                {/* OFFICER */}

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Assigned Officer
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {complaint.officer || 'Not assigned yet'}
                  </p>

                </div>


                {/* OFFICER ID */}

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Officer ID
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {complaint.officer_id || 'Not assigned yet'}
                  </p>

                </div>


                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <p className="text-sm font-medium text-slate-500">
                    Description
                  </p>

                  <div className="mt-2 rounded-xl bg-slate-50 p-4 text-slate-700">
                    {complaint.description}
                  </div>

                </div>

              </div>

            </div>


            {/* STATUS PROGRESS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">

              <div className="mb-8">

                <h2 className="text-2xl font-bold text-slate-900">
                  Complaint Progress
                </h2>

                <p className="mt-1 text-slate-500">
                  Current progress of your complaint
                </p>

              </div>


              <div className="overflow-x-auto">

                <div className="flex min-w-[650px] items-start justify-between">

                  {statusSteps.map((step, index) => {

                    const currentIndex =
                      getStatusIndex(complaint.status)

                    const completed =
                      index <= currentIndex

                    return (

                      <div
                        key={step}
                        className="relative flex flex-1 flex-col items-center"
                      >

                        {/* CONNECTING LINE */}

                        {index < statusSteps.length - 1 && (

                          <div
                            className={`absolute left-1/2 top-5 h-1 w-full ${
                              index < currentIndex
                                ? 'bg-blue-600'
                                : 'bg-slate-200'
                            }`}
                          />

                        )}


                        {/* CIRCLE */}

                        <div
                          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow ${
                            completed
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {completed ? '✓' : index + 1}
                        </div>


                        <p
                          className={`mt-3 text-center text-xs font-semibold md:text-sm ${
                            completed
                              ? 'text-blue-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </p>

                      </div>

                    )

                  })}

                </div>

              </div>

            </div>


            {/* HISTORY */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">

              <div className="mb-8">

                <h2 className="text-2xl font-bold text-slate-900">
                  Complaint History
                </h2>

                <p className="mt-1 text-slate-500">
                  A record of actions and status changes.
                </p>

              </div>


              {history.length === 0 ? (

                <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                  No history available yet.
                </div>

              ) : (

                <div className="relative ml-2 border-l-2 border-blue-100">

                  {history.map((item, index) => (

                    <div
                      key={index}
                      className="relative mb-8 ml-6 last:mb-0"
                    >

                      {/* TIMELINE DOT */}

                      <div className="absolute -left-[35px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-4 border-white bg-blue-600 shadow">
                      </div>


                      {/* HISTORY CARD */}

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                          <h3 className="font-bold text-slate-900">
                            {item.new_status}
                          </h3>

                          <span className="text-sm text-slate-500">
                            {new Date(
                              item.created_at
                            ).toLocaleString()}
                          </span>

                        </div>


                        {item.remarks && (

                          <p className="mt-3 text-slate-700">
                            {item.remarks}
                          </p>

                        )}


                        <p className="mt-3 text-xs font-medium text-slate-500">
                          Changed by: {item.changed_by}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>


            {/* FOOTNOTE */}

            <div className="pb-6 text-center text-sm text-slate-500">

              Keep your Complaint ID safe so you can track your issue later.

            </div>

          </div>

        )}

      </div>

    </div>

  )
}

export default TrackComplaint