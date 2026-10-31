export const LOCATION_MARKER = '[[CIVIC_LOCATION]]'

export function splitComplaintLocation(description = '') {
  const text = String(description)
  const markerIndex = text.lastIndexOf(LOCATION_MARKER)

  if (markerIndex !== -1) {
    return {
      description: text.slice(0, markerIndex).trim(),
      location: parseLocationLines(text.slice(markerIndex + LOCATION_MARKER.length))
    }
  }

  // Older reports stored location labels directly after the description.
  const addressMatch = text.match(/\s+Nearby landmark or address:\s*([\s\S]*?)(?=\s+Map coordinates:|$)/i)
  const coordinatesMatch = text.match(/\s+Map coordinates:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s|$)/i)
  const matches = [addressMatch, coordinatesMatch].filter(Boolean)

  if (!matches.length) return { description: text.trim(), location: null }

  const start = Math.min(...matches.map((match) => match.index))
  const location = {
    address: addressMatch?.[1]?.trim() || '',
    latitude: coordinatesMatch ? Number(coordinatesMatch[1]) : null,
    longitude: coordinatesMatch ? Number(coordinatesMatch[2]) : null
  }

  return {
    description: text.slice(0, start).trim(),
    location: hasLocation(location) ? location : null
  }
}

function parseLocationLines(value) {
  const location = { address: '', latitude: null, longitude: null }

  for (const line of value.split(/\r?\n/)) {
    const address = line.match(/^Nearby landmark or address:\s*(.*)$/i)
    const coordinates = line.match(/^Map coordinates:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/i)

    if (address) location.address = address[1].trim()
    if (coordinates) {
      location.latitude = Number(coordinates[1])
      location.longitude = Number(coordinates[2])
    }
  }

  return hasLocation(location) ? location : null
}

function hasLocation(location) {
  const hasCoordinates = Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180

  return Boolean(location.address) || hasCoordinates
}
