import { Link } from 'react-router-dom'


function Home() {

  return (

    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}

      <section className="bg-blue-700 text-white">

        <div className="
          max-w-7xl
          mx-auto
          px-6
          py-20
          text-center
        ">

          <p className="
            text-blue-200
            font-semibold
            uppercase
            tracking-wider
          ">
            Civic Operations Platform
          </p>


          <h1 className="
            mt-4
            text-4xl
            md:text-6xl
            font-bold
          ">
            Report. Track. Resolve.
          </h1>


          <p className="
            mt-6
            text-lg
            md:text-xl
            text-blue-100
            max-w-2xl
            mx-auto
          ">
            CivicResolve helps citizens report
            public issues and allows departments
            to manage, track and resolve them.
          </p>


          <div className="
            mt-8
            flex
            flex-col
            sm:flex-row
            justify-center
            gap-4
          ">

            <Link
              to="/report"
              className="
                bg-white
                text-blue-700
                px-6
                py-3
                rounded-lg
                font-semibold
                hover:bg-blue-50
              "
            >
              Report an Issue
            </Link>


            <Link
              to="/track"
              className="
                border
                border-white
                px-6
                py-3
                rounded-lg
                font-semibold
                hover:bg-blue-600
              "
            >
              Track Complaint
            </Link>

          </div>

        </div>

      </section>


      {/* Quick Statistics */}

      <section className="
        max-w-7xl
        mx-auto
        px-6
        -mt-8
        relative
      ">

        <div className="
          bg-white
          rounded-2xl
          shadow-lg
          grid
          grid-cols-1
          md:grid-cols-3
          overflow-hidden
        ">

          <div className="
            p-6
            text-center
            border-b
            md:border-b-0
            md:border-r
          ">

            <h2 className="
              text-3xl
              font-bold
              text-blue-700
            ">
              8
            </h2>

            <p className="text-gray-600 mt-1">
              Cities
            </p>

          </div>


          <div className="
            p-6
            text-center
            border-b
            md:border-b-0
            md:border-r
          ">

            <h2 className="
              text-3xl
              font-bold
              text-blue-700
            ">
              24/7
            </h2>

            <p className="text-gray-600 mt-1">
              Complaint Tracking
            </p>

          </div>


          <div className="
            p-6
            text-center
          ">

            <h2 className="
              text-3xl
              font-bold
              text-blue-700
            ">
              100%
            </h2>

            <p className="text-gray-600 mt-1">
              Transparent Status
            </p>

          </div>

        </div>

      </section>


      {/* How It Works */}

      <section className="
        max-w-7xl
        mx-auto
        px-6
        py-20
      ">

        <div className="text-center">

          <p className="
            text-blue-600
            font-semibold
          ">
            HOW IT WORKS
          </p>


          <h2 className="
            text-3xl
            md:text-4xl
            font-bold
            mt-2
            text-gray-900
          ">
            From Issue to Resolution
          </h2>


          <p className="
            mt-4
            text-gray-600
            max-w-2xl
            mx-auto
          ">
            A simple process connecting citizens,
            officers and departments.
          </p>

        </div>


        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-8
          mt-12
        ">

          <div className="
            bg-white
            p-8
            rounded-xl
            shadow-sm
            border
          ">

            <div className="
              w-12
              h-12
              rounded-full
              bg-blue-100
              text-blue-700
              flex
              items-center
              justify-center
              font-bold
              text-xl
            ">
              1
            </div>


            <h3 className="
              text-xl
              font-bold
              mt-5
            ">
              Report
            </h3>


            <p className="
              mt-3
              text-gray-600
            ">
              Citizens submit an issue with
              details, location and category.
            </p>

          </div>


          <div className="
            bg-white
            p-8
            rounded-xl
            shadow-sm
            border
          ">

            <div className="
              w-12
              h-12
              rounded-full
              bg-blue-100
              text-blue-700
              flex
              items-center
              justify-center
              font-bold
              text-xl
            ">
              2
            </div>


            <h3 className="
              text-xl
              font-bold
              mt-5
            ">
              Assign & Resolve
            </h3>


            <p className="
              mt-3
              text-gray-600
            ">
              The appropriate department and
              officer manage the complaint.
            </p>

          </div>


          <div className="
            bg-white
            p-8
            rounded-xl
            shadow-sm
            border
          ">

            <div className="
              w-12
              h-12
              rounded-full
              bg-blue-100
              text-blue-700
              flex
              items-center
              justify-center
              font-bold
              text-xl
            ">
              3
            </div>


            <h3 className="
              text-xl
              font-bold
              mt-5
            ">
              Track
            </h3>


            <p className="
              mt-3
              text-gray-600
            ">
              Citizens can follow the status
              and history of their complaint.
            </p>

          </div>

        </div>

      </section>


      {/* Issue Categories */}

      <section className="
        bg-white
        py-20
      ">

        <div className="
          max-w-7xl
          mx-auto
          px-6
        ">

          <div className="text-center">

            <p className="
              text-blue-600
              font-semibold
            ">
              CIVIC ISSUES
            </p>


            <h2 className="
              text-3xl
              md:text-4xl
              font-bold
              mt-2
            ">
              What Can You Report?
            </h2>

          </div>


          <div className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-5
            mt-12
          ">

            <div className="
              p-6
              bg-slate-50
              rounded-xl
              text-center
              border
            ">
              <h3 className="font-bold">
                Roads
              </h3>

              <p className="
                text-sm
                text-gray-500
                mt-2
              ">
                Potholes and road damage
              </p>
            </div>


            <div className="
              p-6
              bg-slate-50
              rounded-xl
              text-center
              border
            ">
              <h3 className="font-bold">
                Water
              </h3>

              <p className="
                text-sm
                text-gray-500
                mt-2
              ">
                Supply and leakage issues
              </p>
            </div>


            <div className="
              p-6
              bg-slate-50
              rounded-xl
              text-center
              border
            ">
              <h3 className="font-bold">
                Sanitation
              </h3>

              <p className="
                text-sm
                text-gray-500
                mt-2
              ">
                Waste and cleanliness
              </p>
            </div>


            <div className="
              p-6
              bg-slate-50
              rounded-xl
              text-center
              border
            ">
              <h3 className="font-bold">
                Street Lights
              </h3>

              <p className="
                text-sm
                text-gray-500
                mt-2
              ">
                Lighting problems
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* Final CTA */}

      <section className="
        bg-blue-700
        text-white
        py-16
      ">

        <div className="
          max-w-4xl
          mx-auto
          px-6
          text-center
        ">

          <h2 className="
            text-3xl
            md:text-4xl
            font-bold
          ">
            Have a civic issue?
          </h2>


          <p className="
            mt-4
            text-blue-100
          ">
            Report it and track its progress
            from submission to resolution.
          </p>


          <Link
            to="/report"
            className="
              inline-block
              mt-7
              bg-white
              text-blue-700
              px-7
              py-3
              rounded-lg
              font-semibold
              hover:bg-blue-50
            "
          >
            Report an Issue
          </Link>

        </div>

      </section>


      {/* Footer */}

      <footer className="
        bg-slate-900
        text-slate-300
        py-8
      ">

        <div className="
          max-w-7xl
          mx-auto
          px-6
          flex
          flex-col
          md:flex-row
          justify-between
          gap-4
        ">

          <div>

            <h3 className="
              text-white
              font-bold
              text-lg
            ">
              CivicResolve
            </h3>

            <p className="
              text-sm
              mt-1
            ">
              Civic issue management platform
            </p>

          </div>


          <p className="text-sm">
            © 2026 CivicResolve
          </p>

        </div>

      </footer>

    </div>

  )

}


export default Home