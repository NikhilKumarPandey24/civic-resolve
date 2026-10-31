import { splitComplaintLocation } from '../utils/complaintLocation'

function ComplaintDescription({ description, locationAddress, latitude, longitude, compact = false }) {
  const result = splitComplaintLocation(description)
  const parsedLatitude = latitude == null ? null : Number(latitude)
  const parsedLongitude = longitude == null ? null : Number(longitude)
  const structuredCoordinatesValid = Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    Math.abs(parsedLatitude) <= 90 &&
    Math.abs(parsedLongitude) <= 180
  const hasStructuredLocation = Boolean(locationAddress) || structuredCoordinatesValid
  const location = hasStructuredLocation ? {
    address: locationAddress || '',
    latitude: structuredCoordinatesValid ? parsedLatitude : null,
    longitude: structuredCoordinatesValid ? parsedLongitude : null
  } : result.location
  const hasCoordinates = Number.isFinite(location?.latitude) &&
    Number.isFinite(location?.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180
  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=18/${location.latitude}/${location.longitude}`
    : null

  return (
    <div className={`complaint-description-block${compact ? ' is-compact' : ''}`}>
      <h3 className="complaint-section-label">Description</h3>
      <p className="complaint-description-text">{hasStructuredLocation ? (description || 'No description provided.') : (result.description || 'No description provided.')}</p>

      {location && (
        <section className="complaint-location-card" aria-label="Complaint location">
          <span className="complaint-location-icon" aria-hidden="true">⌖</span>
          <div className="complaint-location-content">
            <h4>Issue location</h4>
            {location.address && <p className="complaint-location-address">{location.address}</p>}
            {hasCoordinates ? (
              <>
                <p className="complaint-location-coordinates">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
                <a href={mapUrl} target="_blank" rel="noreferrer" className="complaint-location-link">
                  Open location in OpenStreetMap <span aria-hidden="true">↗</span>
                </a>
              </>
            ) : (
              <p className="complaint-location-note">No map pin was included. Use the address or landmark above to identify the place.</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default ComplaintDescription
