import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function AdminDashboard() {
  const [statistics, setStatistics] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [cities, setCities] = useState([])
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])

  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [cityStatistics, setCityStatistics] = useState([])
  const [departmentStatistics, setDepartmentStatistics] = useState([])

  useEffect(() => {
    async function loadDashboard() {
      try {
        const statsResponse = await fetch(
          'http://localhost:8000/admin/statistics'
        )

        const statsData = await statsResponse.json()

        if (statsData.success) {
          setStatistics(statsData.statistics)
        }

        const cityResponse = await fetch(
          'http://localhost:8000/admin/city-statistics'
        )

        const cityData = await cityResponse.json()

        if (cityData.success) {
          setCityStatistics(cityData.cities)
        }

        const departmentResponse = await fetch(
          'http://localhost:8000/admin/department-statistics'
        )

        const departmentData = await departmentResponse.json()

        if (departmentData.success) {
          setDepartmentStatistics(departmentData.departments)
        }
      } catch (error) {
        console.error(error)
        setMessage('Unable to connect to server.')
      } finally {
        setLoading(false)
      }
    }

    async function loadFilters() {
      try {
        const citiesResponse = await fetch(
          'http://localhost:8000/cities'
        )

        const citiesData = await citiesResponse.json()

        const departmentsResponse = await fetch(
          'http://localhost:8000/departments'
        )

        const departmentsData = await departmentsResponse.json()

        const categoriesResponse = await fetch(
          'http://localhost:8000/categories'
        )

        const categoriesData = await categoriesResponse.json()

        setCities(citiesData)
        setDepartments(departmentsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error(error)
      }
    }

    loadDashboard()
    loadFilters()
  }, [])

  async function loadComplaints() {
    try {
      const params = new URLSearchParams()

      if (selectedCity) {
        params.append('city_id', selectedCity)
      }

      if (selectedDepartment) {
        params.append('department_id', selectedDepartment)
      }

      if (selectedStatus) {
        params.append('status', selectedStatus)
      }

      if (selectedCategory) {
        params.append('category_id', selectedCategory)
      }

      const response = await fetch(
        `http://localhost:8000/admin/complaints?${params.toString()}`
      )

      const data = await response.json()

      if (data.success) {
        setComplaints(data.complaints)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [
    selectedCity,
    selectedDepartment,
    selectedStatus,
    selectedCategory,
  ])

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

  function getResolutionWidth(rate) {
    const value = Number(rate)

    if (Number.isNaN(value)) {
      return 0
    }

    return Math.min(Math.max(value, 0), 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-5"></div>

          <h2 className="text-xl font-bold text-gray-900">
            Loading Admin Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait while we load the system data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">
                CivicResolve Administration
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                Admin Dashboard
              </h1>

              <p className="text-blue-100 mt-2 max-w-2xl">
                Monitor complaints, departments, cities and overall civic
                service performance from one place.
              </p>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 backdrop-blur-sm">
              <p className="text-blue-200 text-xs uppercase tracking-wide">
                System Status
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>

                <span className="font-semibold">
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error message */}
        {message && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {message}
          </div>
        )}

        {/* Overview */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              System Overview
            </h2>

            <p className="text-gray-500 mt-1">
              Current complaint status across CivicResolve.
            </p>
          </div>

          {statistics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {/* Total */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Total
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics.total}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  All complaints
                </p>
              </div>

              {/* Submitted */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Submitted
                </p>

                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {statistics.submitted}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Newly reported
                </p>
              </div>

              {/* Under Review */}
              <div className="bg-white border border-yellow-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-yellow-700">
                  Under Review
                </p>

                <p className="text-3xl font-bold text-yellow-700 mt-2">
                  {statistics.under_review}
                </p>

                <p className="text-xs text-yellow-600 mt-2">
                  Being examined
                </p>
              </div>

              {/* Assigned */}
              <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-purple-700">
                  Assigned
                </p>

                <p className="text-3xl font-bold text-purple-700 mt-2">
                  {statistics.assigned}
                </p>

                <p className="text-xs text-purple-600 mt-2">
                  Officer assigned
                </p>
              </div>

              {/* In Progress */}
              <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-blue-700">
                  In Progress
                </p>

                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {statistics.in_progress}
                </p>

                <p className="text-xs text-blue-600 mt-2">
                  Work underway
                </p>
              </div>

              {/* Resolved */}
              <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-green-700">
                  Resolved
                </p>

                <p className="text-3xl font-bold text-green-700 mt-2">
                  {statistics.resolved}
                </p>

                <p className="text-xs text-green-600 mt-2">
                  Successfully closed
                </p>
              </div>

              {/* Rejected */}
              <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-red-700">
                  Rejected
                </p>

                <p className="text-3xl font-bold text-red-700 mt-2">
                  {statistics.rejected}
                </p>

                <p className="text-xs text-red-600 mt-2">
                  Not accepted
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="mt-10">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Complaint Filters
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Filter complaints by city, department, status or category.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>

                <select
                  value={selectedCity}
                  onChange={(event) =>
                    setSelectedCity(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    All Cities
                  </option>

                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>

                <select
                  value={selectedDepartment}
                  onChange={(event) =>
                    setSelectedDepartment(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    All Departments
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

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    All Statuses
                  </option>

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

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    All Categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* City + Department Analytics */}
        <section className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* City Performance */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                City Performance
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Complaint resolution performance by city.
              </p>
            </div>

            {cityStatistics.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No city statistics available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        City
                      </th>

                      <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Total
                      </th>

                      <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Pending
                      </th>

                      <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Resolved
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Rate
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {cityStatistics.map((city) => (
                      <tr
                        key={city.city_id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {city.city}
                        </td>

                        <td className="px-4 py-4 text-center text-gray-700">
                          {city.total}
                        </td>

                        <td className="px-4 py-4 text-center text-orange-600 font-medium">
                          {city.pending}
                        </td>

                        <td className="px-4 py-4 text-center text-green-600 font-medium">
                          {city.resolved}
                        </td>

                        <td className="px-6 py-4 min-w-[150px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-700">
                              {city.resolution_rate}%
                            </span>
                          </div>

                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${getResolutionWidth(
                                  city.resolution_rate
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Department Performance */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Department Performance
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Complaint workload by responsible department.
              </p>
            </div>

            {departmentStatistics.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No department statistics available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Department
                      </th>

                      <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Total
                      </th>

                      <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Pending
                      </th>

                      <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Resolved
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {departmentStatistics.map((department) => (
                      <tr
                        key={department.department_id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {department.department}
                        </td>

                        <td className="px-4 py-4 text-center text-gray-700">
                          {department.total}
                        </td>

                        <td className="px-4 py-4 text-center text-orange-600 font-medium">
                          {department.pending}
                        </td>

                        <td className="px-4 py-4 text-center text-green-600 font-medium">
                          {department.resolved}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Complaints */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                All Complaints
              </h2>

              <p className="text-gray-500 mt-1">
                Review complaints matching the selected filters.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
              {complaints.length} complaint
              {complaints.length === 1 ? '' : 's'}
            </div>
          </div>

          {complaints.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">
                📭
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                No complaints found
              </h3>

              <p className="text-gray-500 mt-2">
                Try changing the filters to view other complaints.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">
                        Complaint
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">
                        Issue
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">
                        Location
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">
                        Department
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">
                        Officer
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/admin/complaint/${complaint.complaint_id}`}
                            className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {complaint.complaint_id}
                          </Link>

                          <p className="text-xs text-gray-400 mt-1">
                            Click to view details
                          </p>
                        </td>

                        <td className="px-6 py-5 min-w-[220px]">
                          <p className="font-semibold text-gray-900">
                            {complaint.title}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {complaint.category}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium text-gray-800">
                            {complaint.city}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-gray-800">
                            {complaint.department}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-gray-700">
                            {complaint.officer || 'Not assigned'}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            CivicResolve Admin Portal • Complaint Management & Analytics
          </p>
        </footer>
      </main>
    </div>
  )
}

export default AdminDashboard