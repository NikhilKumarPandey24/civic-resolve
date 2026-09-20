import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'


function OfficerComplaint() {

  const { complaintId } = useParams()

  const navigate = useNavigate()


  const [complaint, setComplaint] =
    useState(null)

  const [history, setHistory] =
    useState([])

  const [status, setStatus] =
    useState('')

  const [remarks, setRemarks] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [updating, setUpdating] =
    useState(false)

  const [message, setMessage] =
    useState('')


  async function loadComplaint() {

    try {

      const complaintResponse =
        await fetch(
          `http://localhost:8000/complaints/${complaintId}`
        )

      const complaintData =
        await complaintResponse.json()


      if (!complaintData.success) {

        setMessage(
          'Complaint not found.'
        )

        return

      }


      setComplaint(complaintData)

      setStatus(
        complaintData.status
      )


      const historyResponse =
        await fetch(
          `http://localhost:8000/complaints/${complaintId}/history`
        )


      const historyData =
        await historyResponse.json()


      if (historyData.success) {

        setHistory(
          historyData.history
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


  useEffect(() => {

    loadComplaint()

  }, [complaintId])


  async function updateStatus() {

    if (!status) {

      setMessage(
        'Please select a status.'
      )

      return

    }


    try {

      setUpdating(true)

      setMessage('')


      const response =
        await fetch(
          `http://localhost:8000/complaints/${complaintId}/status`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              status: status,
              remarks: remarks
            })
          }
        )


      const data =
        await response.json()


      if (!data.success) {

        setMessage(
          data.message ||
          'Unable to update complaint.'
        )

        return

      }


      setMessage(
        'Complaint updated successfully.'
      )

      setRemarks('')

      await loadComplaint()

    } catch (error) {

      console.error(error)

      setMessage(
        'Unable to connect to server.'
      )

    } finally {

      setUpdating(false)

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


  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700">
          </div>

          <p className="font-medium text-slate-600">
            Loading complaint...
          </p>

        </div>

      </div>

    )

  }


  if (!complaint) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">

          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Complaint Not Found
          </h2>

          <p className="mt-2 text-slate-500">
            {message}
          </p>

          <button
            onClick={() =>
              navigate('/officer')
            }
            className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>

    )

  }


  return (

    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-6xl">


        {/* BACK BUTTON */}

        <button
          onClick={() =>
            navigate('/officer')
          }
          className="mb-6 font-semibold text-blue-700 transition hover:text-blue-900"
        >
          ← Back to Dashboard
        </button>


        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Officer Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Complaint Details
            </h1>

            <p className="mt-2 font-mono text-sm text-slate-500">
              {complaint.complaint_id}
            </p>

          </div>


          <span
            className={`w-fit rounded-full border px-5 py-2 text-sm font-bold ${getStatusStyle(
              complaint.status
            )}`}
          >
            {complaint.status}
          </span>

        </div>


        {/* SUCCESS / ERROR MESSAGE */}

        {message && (

          <div
            className={`mb-6 rounded-xl border px-5 py-4 font-medium ${
              message.includes('successfully')
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>

        )}


        <div className="grid gap-6 lg:grid-cols-3">


          {/* LEFT SIDE */}

          <div className="space-y-6 lg:col-span-2">


            {/* COMPLAINT INFORMATION */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <p className="text-sm font-medium text-slate-500">
                  Issue Title
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {complaint.title}
                </h2>

              </div>


              <div className="grid gap-6 p-6 sm:grid-cols-2">


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    City
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    📍 {complaint.city}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    📂 {complaint.category}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    🏢 {complaint.department}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Assigned Officer
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    👤 {complaint.officer || 'Not assigned'}
                  </p>

                </div>


                <div className="sm:col-span-2">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <div className="mt-2 rounded-xl bg-slate-50 p-5 leading-relaxed text-slate-700">
                    {complaint.description}
                  </div>

                </div>

              </div>

            </div>


            {/* COMPLAINT HISTORY */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Complaint History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Previous status changes and officer remarks.
                </p>

              </div>


              {history.length === 0 ? (

                <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                  No history available yet.
                </div>

              ) : (

                <div className="relative border-l-2 border-blue-100">

                  {history.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="relative mb-7 ml-6 last:mb-0"
                      >

                        <div className="absolute -left-[35px] top-1 flex h-4 w-4 rounded-full border-4 border-white bg-blue-600 shadow">
                        </div>


                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <span
                              className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                                item.new_status
                              )}`}
                            >
                              {item.new_status}
                            </span>

                            <span className="text-xs text-slate-500">
                              {new Date(
                                item.created_at
                              ).toLocaleString()}
                            </span>

                          </div>


                          {item.remarks && (

                            <p className="mt-4 text-sm leading-relaxed text-slate-700">
                              {item.remarks}
                            </p>

                          )}


                          <p className="mt-3 text-xs font-medium text-slate-500">
                            Changed by: {item.changed_by}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>


          {/* RIGHT SIDE */}

          <div className="space-y-6">


            {/* UPDATE STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Update Complaint
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Change the complaint status and add an official remark.
                </p>

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >

                  <option value="Submitted">
                    Submitted
                  </option>

                  <option value="Under Review">
                    Under Review
                  </option>

                  <option value="Assigned">
                    Assigned
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                </select>

              </div>


              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Officer Remarks
                </label>

                <textarea
                  rows="6"
                  placeholder="Enter remarks about this status update..."
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </div>


              <button
                onClick={updateStatus}
                disabled={updating}
                className="mt-5 w-full rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {updating
                  ? 'Updating...'
                  : 'Update Complaint'
                }

              </button>

            </div>


            {/* CURRENT STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Current Status
              </p>

              <div
                className={`mt-3 rounded-xl border px-4 py-4 text-center text-lg font-bold ${getStatusStyle(
                  complaint.status
                )}`}
              >
                {complaint.status}
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                Last known status from CivicResolve.
              </p>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="py-8 text-center text-sm text-slate-500">
          CivicResolve Officer Portal • Complaint Management
        </div>

      </div>

    </div>

  )

}


export default OfficerComplaint