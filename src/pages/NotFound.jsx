import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-7xl font-bold text-blue-600">
          404
        </p>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Page Not Found
        </h1>

        <p className="mt-3 text-gray-500">
          Sorry, the page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound