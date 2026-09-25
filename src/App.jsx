import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import ReportIssue from './pages/ReportIssue'
import TrackComplaint from './pages/TrackComplaint'
import Login from './pages/Login'
import OfficerDashboard from './pages/OfficerDashboard'
import OfficerComplaint from './pages/OfficerComplaint'
import AdminDashboard from './pages/AdminDashboard'
import AdminComplaint from './pages/AdminComplaint'
import AdminOfficers from './pages/AdminOfficers'


function LegacyHome() {
  return (
    <div className="app">

      {/* Navigation Bar */}
      <nav className="navbar">

        <div className="logo">
          Civic<span>Resolve</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#issues">Issues</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
        </div>

      </nav>


      {/* Hero Section */}
      <section className="hero" id="home">

        <div className="hero-content">

          <p className="small-heading">
            SMART CIVIC ISSUE MANAGEMENT
          </p>

          <h1>
            Build a better City.
            <br />
            <span>Together.</span>
          </h1>

          <p className="hero-description">
            Report roads, garbage, water, streetlights and other
            civic problems directly to the responsible department.
          </p>

          <div className="hero-buttons">
            <Link to="/report" className="primary-btn">
              Report an Issue
            </Link>

            <button className="secondary-btn">
              Track Complaint
            </button>

          </div>

        </div>

      </section>


      {/* Statistics */}
      <section className="stats">

        <div className="stat-card">
          <h2>12,450</h2>
          <p>Issues Reported</p>
        </div>

        <div className="stat-card">
          <h2>3,210</h2>
          <p>In Progress</p>
        </div>

        <div className="stat-card">
          <h2>6,900</h2>
          <p>Issues Resolved</p>
        </div>

        <div className="stat-card">
          <h2>8</h2>
          <p>Cities Connected</p>
        </div>

      </section>


      {/* Issue Categories */}
      <section className="issues" id="issues">

        <div className="section-heading">

          <p className="small-heading">
            REPORT CIVIC PROBLEMS
          </p>

          <h2>
            What problem did you find?
          </h2>

          <p>
            Select an issue category and report it to the
            appropriate government department.
          </p>

        </div>


        <div className="issue-grid">

          <div className="issue-card">
            <div className="issue-icon">🛣️</div>
            <h3>Roads</h3>
            <p>Potholes, damaged roads and road maintenance.</p>
          </div>

          <div className="issue-card">
            <div className="issue-icon">🗑️</div>
            <h3>Garbage</h3>
            <p>Waste collection and garbage-related problems.</p>
          </div>

          <div className="issue-card">
            <div className="issue-icon">💧</div>
            <h3>Water</h3>
            <p>Water supply, leakage and pipeline problems.</p>
          </div>

          <div className="issue-card">
            <div className="issue-icon">💡</div>
            <h3>Streetlights</h3>
            <p>Broken or non-functioning streetlights.</p>
          </div>

          <div className="issue-card">
            <div className="issue-icon">🚰</div>
            <h3>Drainage</h3>
            <p>Blocked drains and drainage problems.</p>
          </div>

          <div className="issue-card">
            <div className="issue-icon">🌳</div>
            <h3>Parks</h3>
            <p>Maintenance problems in public parks.</p>
          </div>

        </div>

      </section>


      {/* How It Works */}
      <section className="how-it-works">

        <div className="section-heading">

          <p className="small-heading">
            SIMPLE PROCESS
          </p>

          <h2>
            How CivicResolve Works
          </h2>

        </div>


        <div className="steps">

          <div className="step">
            <div className="step-number">1</div>
            <h3>Report</h3>
            <p>
              Upload a photo and describe the civic problem.
            </p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Route</h3>
            <p>
              The system identifies the responsible department.
            </p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Resolve</h3>
            <p>
              The responsible officer works on the issue.
            </p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>
              Citizens can track the complaint until resolution.
            </p>
          </div>

        </div>

      </section>


      {/* Footer */}
      <footer id="about">

        <div className="logo">
          Civic<span>Resolve</span>
        </div>

        <p>
          Report. Route. Resolve.
        </p>

        <p className="copyright">
          © 2026 CivicResolve. Civic Issue Management Platform.
        </p>

      </footer>

    </div>
  )
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/report"
          element={<ReportIssue />}
        />

        <Route
          path="/track"
          element={<TrackComplaint />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/officer"
          element={
            <ProtectedRoute allowedRoles={['officer']}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/officer/complaint/:complaintId"
          element={
            <ProtectedRoute allowedRoles={['officer']}>
              <OfficerComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaint/:complaintId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/officers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOfficers />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App