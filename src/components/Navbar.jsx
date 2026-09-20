import { Link } from 'react-router-dom'


function Navbar() {

  return (

    <nav className="bg-blue-700 text-white">

      <div className="
        max-w-7xl
        mx-auto
        px-6
        py-4
        flex
        items-center
        justify-between
      ">

        <Link
          to="/"
          className="text-2xl font-bold"
        >
          CivicResolve
        </Link>


        <div className="
          flex
          gap-6
          items-center
        ">

          <Link
            to="/"
            className="hover:text-blue-200"
          >
            Home
          </Link>


          <Link
            to="/report"
            className="hover:text-blue-200"
          >
            Report Issue
          </Link>


          <Link
            to="/track"
            className="hover:text-blue-200"
          >
            Track Complaint
          </Link>


          <Link
            to="/officer"
            className="hover:text-blue-200"
          >
            Officer
          </Link>


          <Link
            to="/admin"
            className="hover:text-blue-200"
          >
            Admin
          </Link>

        </div>

      </div>

    </nav>

  )

}


export default Navbar