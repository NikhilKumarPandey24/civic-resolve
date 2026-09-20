import { useState, useEffect } from 'react'

function ReportIssue() {

  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])

  const [cityId, setCityId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    async function loadCities() {

      try {

        const response = await fetch(
          'http://localhost:8000/cities'
        )

        const data = await response.json()

        setCities(data)

      } catch (error) {

        console.error('Error loading cities:', error)

      }
    }

    loadCities()

  }, [])


  useEffect(() => {

    async function loadCategories() {

      try {

        const response = await fetch(
          'http://localhost:8000/categories'
        )

        const data = await response.json()

        setCategories(data)

      } catch (error) {

        console.error('Error loading categories:', error)

      }
    }

    loadCategories()

  }, [])


  async function handleSubmit(event) {

    event.preventDefault()

    setMessage('')

    if (!cityId || !categoryId || !title || !description) {

      setMessage('Please fill all required fields.')

      return
    }

    try {

      setLoading(true)

      const response = await fetch(
        'http://localhost:8000/complaints',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            city_id: Number(cityId),
            category_id: Number(categoryId),
            title: title,
            description: description
          })
        }
      )

      const data = await response.json()


      if (data.success) {

        setMessage(
          `Complaint submitted successfully! Complaint ID: ${data.complaint_id}`
        )

        setTitle('')
        setDescription('')
        setCityId('')
        setCategoryId('')

      } else {

        setMessage(
          data.message || 'Something went wrong.'
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


  return (

    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-5xl">

        {/* PAGE HEADER */}

        <div className="mb-8 text-center">

          <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            CivicResolve
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Report a Civic Issue
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Help improve your city by reporting roads, water,
            sanitation, street light and other civic problems.
          </p>

        </div>


        {/* FORM CARD */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

          {/* CARD HEADER */}

          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-6 text-white">

            <h2 className="text-2xl font-bold">
              Complaint Details
            </h2>

            <p className="mt-1 text-blue-100">
              Please provide accurate information about the issue.
            </p>

          </div>


          <form
            onSubmit={handleSubmit}
            className="space-y-7 p-6 md:p-8"
          >

            {/* CITY + CATEGORY */}

            <div className="grid gap-6 md:grid-cols-2">

              {/* CITY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  City <span className="text-red-500">*</span>
                </label>

                <select
                  value={cityId}
                  onChange={(event) =>
                    setCityId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >

                  <option value="">
                    Select your city
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


              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue Category <span className="text-red-500">*</span>
                </label>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >

                  <option value="">
                    Select issue type
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


            {/* TITLE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Issue Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Example: Large pothole near market"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Describe the Problem <span className="text-red-500">*</span>
              </label>

              <textarea
                rows="6"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Explain what happened, where the problem is located, and any other useful information..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-sm text-slate-500">
                More details help the responsible department understand the problem.
              </p>

            </div>


            {/* PHOTO */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Upload Photo
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">

                <div className="mb-2 text-3xl">
                  📷
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="mx-auto block max-w-full text-sm text-slate-600"
                />

                <p className="mt-2 text-sm text-slate-500">
                  Upload a clear photo of the civic problem.
                </p>

              </div>

            </div>


            {/* LOCATION */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-xl">
                      📍
                    </span>

                    <h3 className="font-bold text-slate-800">
                      Issue Location
                    </h3>

                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    Location support will help identify the exact place of the issue.
                  </p>

                </div>


                <button
                  type="button"
                  className="rounded-xl border border-blue-600 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                >
                  Use My Location
                </button>

              </div>

            </div>


            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? 'Submitting Complaint...'
                : 'Submit Complaint'
              }

            </button>


            {/* MESSAGE */}

            {message && (

              <div
                className={`rounded-xl border px-5 py-4 text-center font-medium ${
                  message.includes('successfully')
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>

            )}

          </form>

        </div>


        {/* INFORMATION */}

        <div className="mt-6 text-center text-sm text-slate-500">

          <p>
            Your complaint will be stored securely and can be tracked using its Complaint ID.
          </p>

        </div>

      </div>

    </div>

  )
}

export default ReportIssue