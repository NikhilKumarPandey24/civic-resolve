import { Link } from 'react-router-dom'

const categories = [
  ['01', 'Roads & pavements', 'Potholes, damaged surfaces and unsafe footpaths.'],
  ['02', 'Water & drainage', 'Leaks, water supply concerns and blocked drains.'],
  ['03', 'Waste & sanitation', 'Missed collection, litter and public cleanliness.'],
  ['04', 'Street lighting', 'Report lights that are broken or not working.'],
]

function Home() {
  let role = null
  try { role = JSON.parse(localStorage.getItem('user') || 'null')?.role || null } catch { role = null }
  const dashboardPath = role === 'admin' ? '/admin' : role === 'officer' ? '/officer' : null
  const reportPath = role && role !== 'citizen' ? dashboardPath : '/report'
  const reportLabel = role && role !== 'citizen' ? 'Open my portal' : 'Report an issue'
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> A clearer way to be heard</p>
            <h1>Better neighborhoods<br /><em>start with a report.</em></h1>
            <p className="hero-lede">CivicResolve connects residents with the teams responsible for local services. Share an issue, get a reference number, and follow its progress.</p>
            <div className="hero-actions">
              <Link to={reportPath} className="button button-primary">{reportLabel} <span aria-hidden="true">→</span></Link>
              <Link to="/track" className="button button-outline">Track a complaint</Link>
            </div>
            <div className="hero-note"><span className="note-check">✓</span> You can report without creating an account</div>
          </div>
          <div className="hero-art" aria-label="Illustration of a connected neighborhood">
            <div className="art-sun" />
            <div className="art-label"><span className="art-pulse" /> LOCAL SERVICES, CONNECTED</div>
            <div className="art-scene">
              <div className="art-cloud cloud-one" /><div className="art-cloud cloud-two" />
              <div className="art-building building-back"><i /><i /><i /><i /></div>
              <div className="art-building building-main"><i /><i /><i /><i /><i /><i /></div>
              <div className="art-building building-side"><i /><i /><i /><i /></div>
              <div className="art-ground" />
              <div className="art-tree tree-one"><i /><b /></div><div className="art-tree tree-two"><i /><b /></div>
              <div className="art-pin"><span>✓</span></div>
              <div className="art-path" />
            </div>
            <div className="art-caption"><span className="caption-icon">⌖</span><span><b>Your community</b><small>Every report helps move things forward</small></span></div>
          </div>
        </div>
        <div className="hero-bottom"><span>MADE FOR EVERYDAY CIVIC LIFE</span><span className="hero-bottom-rule" /><span>REPORT · ROUTE · RESOLVE</span></div>
      </section>

      <section className="home-section category-section">
        <div className="section-intro">
          <div><p className="eyebrow"><span className="eyebrow-line" /> What needs attention?</p><h2>Small issues matter.<br /><em>Let’s get them moving.</em></h2></div>
          <p>From a faulty streetlight to a blocked drain, send the details to the right place and keep your complaint reference close for updates.</p>
        </div>
        <div className="category-grid">
          {categories.map(([number, title, description]) => <article className="category-card" key={title}>
            <span className="category-number">{number}</span><span className="category-arrow" aria-hidden="true">↗</span>
            <h3>{title}</h3><p>{description}</p>
          </article>)}
        </div>
      </section>

      <section className="process-section">
        <div className="home-section process-inner">
          <div className="process-heading"><p className="eyebrow"><span className="eyebrow-line" /> Simple from the start</p><h2>One report.<br /><em>A clear next step.</em></h2><p>Keep a record of what you report and see how it moves through the process.</p><Link to="/track" className="text-link">Already have a reference? Track it <span aria-hidden="true">→</span></Link></div>
          <div className="process-list">
            <article className="process-step"><span className="step-index">01</span><div><h3>Tell us what happened</h3><p>Add a description, location and category so the issue is easy to understand.</p></div><span className="step-symbol">↗</span></article>
            <article className="process-step"><span className="step-index">02</span><div><h3>It reaches the right team</h3><p>Your complaint is routed to the department responsible for that service.</p></div><span className="step-symbol">⌁</span></article>
            <article className="process-step"><span className="step-index">03</span><div><h3>Follow the progress</h3><p>Use your complaint reference to check the latest status and updates.</p></div><span className="step-symbol">✓</span></article>
          </div>
        </div>
      </section>

      <section className="closing-cta"><div className="cta-mark" aria-hidden="true">✳</div><div><p className="eyebrow">Your neighborhood, your voice</p><h2>{role && role !== 'citizen' ? 'Manage your civic workspace.' : 'See something that needs fixing?'}</h2><p>{role && role !== 'citizen' ? 'Open your role-specific portal to continue.' : 'It only takes a few minutes to make a report.'}</p></div><Link to={reportPath} className="button button-light">{role && role !== 'citizen' ? 'Open my portal' : 'Start a report'} <span aria-hidden="true">→</span></Link></section>

      <footer className="site-footer"><Link to="/" className="footer-brand">Civic<span>Resolve</span></Link><p>Local issues deserve a clear path to resolution.</p><span className="footer-copy">© 2026 CivicResolve</span></footer>
    </main>
  )
}

export default Home
