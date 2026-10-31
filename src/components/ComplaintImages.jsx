import { useEffect, useState } from 'react'

function ComplaintImages({ complaintId }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const objectUrls = []

    async function loadImages() {
      setLoading(true)
      setMessage('')
      setImages([])

      const token = localStorage.getItem('access_token')
      if (!token) {
        setMessage('Sign in with an account authorized to view this complaint’s photos.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://localhost:8000/complaints/${complaintId}/images`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          setMessage(typeof data?.detail === 'string' ? data.detail : 'Unable to load complaint photos.')
          setLoading(false)
          return
        }

        const imageResults = await Promise.all(data.map(async (image) => {
          const imageResponse = await fetch(
            `http://localhost:8000${image.url}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (!imageResponse.ok) throw new Error('Unable to load one or more complaint photos.')
          return { ...image, blob: await imageResponse.blob() }
        }))

        if (cancelled) return

        const readyImages = imageResults.map((image) => {
          const url = URL.createObjectURL(image.blob)
          objectUrls.push(url)
          return { ...image, previewUrl: url }
        })
        setImages(readyImages)
      } catch (error) {
        if (!cancelled) setMessage(error.message || 'Unable to load complaint photos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadImages()
    return () => {
      cancelled = true
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [complaintId])

  return (
    <section className="complaint-photos" aria-label="Complaint photos">
      <div className="complaint-photos-heading">
        <div>
          <h3>Complaint photos</h3>
          <p>Images submitted with this report</p>
        </div>
        {!loading && images.length > 0 && <span className="photo-count">{images.length} {images.length === 1 ? 'photo' : 'photos'}</span>}
      </div>

      {loading ? <p className="complaint-photos-message">Loading complaint photos…</p> : null}
      {!loading && message ? <p className="complaint-photos-message is-error" role="status">{message}</p> : null}
      {!loading && !message && images.length === 0 ? <p className="complaint-photos-message">No photos were attached to this complaint.</p> : null}

      {!loading && images.length > 0 && (
        <div className="complaint-photo-grid">
          {images.map((image, index) => (
            <a className="complaint-photo" href={image.previewUrl} target="_blank" rel="noreferrer" key={image.id}>
              <img src={image.previewUrl} alt={`Complaint photo ${index + 1}`} />
              <span>Photo {index + 1} · Open full size ↗</span>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

export default ComplaintImages
