import { useEffect, useState } from 'react'

function AdminOfficers() {
  const token = localStorage.getItem('access_token')

  const authHeaders = {
    Authorization: `Bearer ${token}`
  }

  const [officers, setOfficers] = useState([])
  const [cities, setCities] = useState([])
  const [departments, setDepartments] = useState([])

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    officer_id: '',
    name: '',
    email: '',
    department_id: '',
    city_id: '',
  })

  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [officersRes, citiesRes, departmentsRes] =
        await Promise.all([
          fetch('http://localhost:8000/officers', {
            headers: authHeaders,
          }),
          fetch('http://localhost:8000/cities'),
          fetch('http://localhost:8000/departments'),
        ])

      const officersData = await officersRes.json()
      const citiesData = await citiesRes.json()
      const departmentsData = await departmentsRes.json()

      setOfficers(
        Array.isArray(officersData)
          ? officersData
          : officersData.officers || []
      )

      setCities(
        Array.isArray(citiesData)
          ? citiesData
          : citiesData.cities || []
      )

      setDepartments(
        Array.isArray(departmentsData)
          ? departmentsData
          : departmentsData.departments || []
      )
    } catch (err) {
      setError('Unable to load officer information.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const createOfficer = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (
      !form.officer_id ||
      !form.name ||
      !form.email ||
      !form.department_id ||
      !form.city_id
    ) {
      setError('Please fill in all fields.')
      return
    }

    try {
      setCreating(true)

      const response = await fetch(
        'http://localhost:8000/officers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            officer_id: form.officer_id,
            name: form.name,
            email: form.email,
            department_id: Number(form.department_id),
            city_id: Number(form.city_id),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(
          data.message || 'Unable to create officer.'
        )
        return
      }

      setMessage('Officer created successfully.')

      setForm({
        officer_id: '',
        name: '',
        email: '',
        department_id: '',
        city_id: '',
      })

      loadData()
    } catch (err) {
      setError('Server error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const getCityName = (cityId) => {
    const city = cities.find(
      (item) =>
        Number(item.id) === Number(cityId)
    )

    return city ? city.name : 'Unknown'
  }

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (item) =>
        Number(item.id) === Number(departmentId)
    )

    return department
      ? department.name
      : 'Unknown'
  }

  const toggleOfficerStatus = async (officerId) => {
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `http://localhost:8000/officers/${officerId}/status`,
        {
          method: 'PUT',
          headers: authHeaders,
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(
          data.message || 'Unable to update officer status.'
        )
        return
      }

      setMessage(data.message)

      loadData()
    } catch (err) {
      setError('Server error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">

          <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider">
            Administration
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Officer Management
          </h1>

          <p className="text-blue-100 mt-2">
            Add and manage officers responsible for resolving civic complaints.
          </p>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* Create Officer */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Add New Officer
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Create an officer account for complaint assignment.
            </p>
          </div>

          <form
            onSubmit={createOfficer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >

            {/* Officer ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Officer ID
              </label>

              <input
                type="text"
                name="officer_id"
                value={form.officer_id}
                onChange={handleChange}
                placeholder="e.g. OFF-003"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Officer name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="officer@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>

              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select Department
                </option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City
              </label>

              <select
                name="city_id"
                value={form.city_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select City
                </option>

                {cities.map((city) => (
                  <option
                    key={city.id}
                    value={city.id}
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Button */}
            <div className="flex items-end">

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {creating
                  ? 'Creating...'
                  : 'Add Officer'}
              </button>

            </div>

          </form>
        </div>

        {/* Officers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <h2 className="text-xl font-bold text-slate-900">
              All Officers
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Officers currently registered in CivicResolve.
            </p>

          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading officers...
            </div>
          ) : officers.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No officers found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Officer
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Department
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      City
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {officers.map((officer) => (

                    <tr
                      key={officer.id || officer.officer_id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-semibold text-slate-900">
                          {officer.name}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {officer.officer_id}
                        </div>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {officer.email}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getDepartmentName(
                          officer.department_id
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getCityName(
                          officer.city_id
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            String(officer.is_active) === 'true'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {String(officer.is_active) === 'true'
                            ? 'Active'
                            : 'Inactive'}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <button
                          onClick={() =>
                            toggleOfficerStatus(
                              officer.officer_id
                            )
                          }
                          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                            String(officer.is_active) === 'true'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {String(officer.is_active) === 'true'
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default AdminOfficers