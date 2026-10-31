import { useState, useEffect, useRef } from 'react'

function ReportIssue() {

  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])

  const [cityId, setCityId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationText, setLocationText] = useState('')
  const [coordinates, setCoordinates] = useState(null)
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const nextImageId = useRef(0)
  const imagePreviewUrls = useRef(new Set())

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const descriptionLimit = 2000

  useEffect(() => () => {
    imagePreviewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    imagePreviewUrls.current.clear()
  }, [])

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    setMessage('')

    if (selectedImages.length + files.length > 5) {
      setMessage('You can attach up to five photos to a complaint.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const invalidType = files.find((file) => !allowedTypes.includes(file.type))
    if (invalidType) {
      setMessage('Choose JPEG, PNG, or WebP images only.')
      return
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFile) {
      setMessage('Each photo must be 5 MB or smaller.')
      return
    }

    const additions = files.map((file) => {
      const preview = URL.createObjectURL(file)
      imagePreviewUrls.current.add(preview)
      return { id: nextImageId.current++, file, preview }
    })
    setSelectedImages((current) => [...current, ...additions])
  }

  function removeSelectedImage(imageId) {
    setSelectedImages((current) => {
      const image = current.find((item) => item.id === imageId)
      if (image) {
        URL.revokeObjectURL(image.preview)
        imagePreviewUrls.current.delete(image.preview)
      }
      return current.filter((item) => item.id !== imageId)
    })
  }

  function clearSelectedImages() {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.preview)
      imagePreviewUrls.current.delete(image.preview)
    })
    setSelectedImages([])
  }

  function useMyLocation() {
    setLocationMessage('')
    if (!navigator.geolocation) {
      setLocationMessage('Your browser may not allow location access on this connection. Location requires HTTPS or localhost. Enter a nearby street, address, or landmark instead.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setLocationAccuracy(position.coords.accuracy)
        setLocationMessage('Location added. Please check the map pin is near the issue.')
        setLocating(false)
      },
      (error) => {
        const messages = {
          1: 'Location permission was denied. Allow location access in your browser, or enter a nearby address or landmark.',
          2: 'Your location could not be determined. Try again outdoors or enter a nearby address or landmark.',
          3: 'Getting your location took too long. Try again or enter a nearby address or landmark.'
        }
        setLocationMessage(messages[error.code] || 'Unable to get your location. Enter a nearby address or landmark instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
    )
  }

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

    if (!cityId || !categoryId || !title.trim() || !description.trim()) {

      setMessage('Please fill all required fields.')

      return
    }

    if (description.trim().length > 2000) {
      setMessage('The description must be 2,000 characters or fewer.')
      return
    }

    try {

      setLoading(true)

      const token = localStorage.getItem('access_token')

      const complaintData = {
        city_id: Number(cityId),
        category_id: Number(categoryId),
        title: title.trim(),
        description: description.trim(),
        location_address: locationText.trim() || null,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      let body

      if (selectedImages.length) {
        body = new FormData()
        Object.entries(complaintData).forEach(([key, value]) => {
          if (value !== null) body.append(key, String(value))
        })
        selectedImages.forEach(({ file }) => body.append('images', file, file.name))
      } else {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(complaintData)
      }

      const response = await fetch('http://localhost:8000/complaints', {
        method: 'POST',
        headers,
        body
      })

      if (!response.ok) {

        const errorData = await response.json().catch(() => null)

        const detail = errorData?.detail
        setMessage(Array.isArray(detail)
          ? detail.map((item) => item.msg).join(' ')
          : detail || errorData?.message || 'Failed to submit complaint.')

        return

      }

      const data = await response.json()


      if (data.success) {

        setMessage(
          `Complaint submitted successfully${data.image_count ? ` with ${data.image_count} ${data.image_count === 1 ? 'photo' : 'photos'}` : ''}! Complaint ID: ${data.complaint_id}`
        )

        setTitle('')
        setDescription('')
        setCityId('')
        setCategoryId('')
        setLocationText('')
        setCoordinates(null)
        setLocationAccuracy(null)
        setLocationMessage('')
        clearSelectedImages()

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

        {user?.role === 'citizen' && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-600">
              Logged in as
            </p>

            <p className="font-semibold text-gray-900">
              {user.name}
            </p>

            <p className="text-sm text-gray-500">
              Your complaint will be linked to your account.
            </p>
          </div>
        )}


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
                maxLength={descriptionLimit}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Explain what happened, where the problem is located, and any other useful information..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-sm text-slate-500">
                More details help the responsible department understand the problem. {description.length}/{descriptionLimit}
              </p>

            </div>


            {/* PHOTO */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Upload Photos <span className="font-normal text-slate-500">(optional, up to 5)</span>
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">

                <div className="mb-2 text-3xl">
                  📷
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelection}
                  className="mx-auto block max-w-full text-sm text-slate-600"
                />

                <p className="mt-2 text-sm text-slate-500">
                  Add clear JPEG, PNG, or WebP photos. Each photo must be 5 MB or smaller.
                </p>

              </div>

            </div>


            {selectedImages.length > 0 && (
              <div className="selected-image-grid" aria-live="polite">
                {selectedImages.map((image, index) => (
                  <figure className="selected-image-card" key={image.id}>
                    <img src={image.preview} alt={`Preview of selected photo ${index + 1}`} />
                    <figcaption>
                      <span title={image.file.name}>{image.file.name}</span>
                      <button type="button" onClick={() => removeSelectedImage(image.id)} aria-label={`Remove ${image.file.name}`}>Remove</button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {/* LOCATION */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-xl">
                      📍
                    </span>

                    <h3 className="font-bold text-slate-800">
                      Where is the issue?
                    </h3>

                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    Add a nearby address or landmark, or pin your current location on the map.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="rounded-xl border border-blue-600 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                >
                  {locating ? 'Finding location…' : coordinates ? 'Update my location' : 'Use my location'}
                </button>

              </div>

              <div className="mt-5">
                <label htmlFor="location-description" className="mb-2 block text-sm font-semibold text-slate-700">
                  Nearby address, street, or landmark <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="location-description"
                  type="text"
                  maxLength={250}
                  value={locationText}
                  onChange={(event) => setLocationText(event.target.value)}
                  placeholder="e.g. Outside the library on Park Street"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {coordinates && (
                <div className="location-result" role="status">
                  <span className="location-pin" aria-hidden="true">●</span>
                  <div className="location-result-copy">
                    <strong>Map pin added</strong>
                    <span>{coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}{locationAccuracy ? ` · accurate to about ${Math.round(locationAccuracy)} m` : ''}</span>
                  </div>
                  <a
                    className="location-map-link"
                    href={`https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=18/${coordinates.latitude}/${coordinates.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >View map ↗</a>
                  <button type="button" className="location-clear" onClick={() => { setCoordinates(null); setLocationAccuracy(null) }} aria-label="Remove map pin">Remove</button>
                </div>
              )}

              {locationMessage && <p className="mt-3 text-sm text-slate-600" role="status">{locationMessage}</p>}
              <p className="mt-3 text-xs leading-5 text-slate-600">
                Location is optional. Any address or map coordinates you add become part of the complaint details and can be seen by people with its tracking reference.
              </p>

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
