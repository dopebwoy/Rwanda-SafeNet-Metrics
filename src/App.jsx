import './App.css'

function App() {
  const navItems = [
    { label: 'Dashboard', active: true, icon: '⌂' },
    { label: 'Poverty Explorer', icon: '⌕' },
    { label: 'Vulnerability Profiler', icon: '◬' },
    { label: 'Multidimensional Poverty', icon: '▣' },
    { label: 'Financial Inclusion', icon: '◫' },
    { label: 'Rwanda Map', icon: '▦' },
    { label: 'Insights & Reports', icon: '▤' },
  ]

  const mapDistricts = [
    { name: 'Nyagatare', value: 35.4, x: 315, y: 140 },
    { name: 'Rubavu', value: 38.8, x: 120, y: 176 },
    { name: 'Gatsibo', value: 18.4, x: 310, y: 216 },
    { name: 'Kayonza', value: 36.6, x: 365, y: 257 },
    { name: 'Kirehe', value: 14.2, x: 430, y: 250 },
    { name: 'Nyanza', value: 51.4, x: 215, y: 385 },
    { name: 'Musanze', value: 42.8, x: 165, y: 290 },
    { name: 'Kigali', value: 31.2, x: 215, y: 330 },
    { name: 'Gisagara', value: 45.6, x: 260, y: 445 },
    { name: 'Rutsiro', value: 40.8, x: 95, y: 230 },
    { name: 'Nyabihu', value: 27.9, x: 110, y: 145 },
    { name: 'Karongi', value: 46.4, x: 135, y: 350 },
    { name: 'Rusizi', value: 44.2, x: 70, y: 420 },
    { name: 'Nyamagabe', value: 51.4, x: 230, y: 420 },
    { name: 'Nyaruguru', value: 39.7, x: 310, y: 460 },
  ]

  const keyDeprivation = [
    { label: 'Housing', value: 78 },
    { label: 'Cooking fuel', value: 62 },
    { label: 'Water', value: 48 },
    { label: 'Health insurance', value: 35 },
  ]

  const districtLegend = [
    { label: '< 20%', color: '#4ecb9a' },
    { label: '20 - 30%', color: '#8ed66a' },
    { label: '31 - 40%', color: '#f4d95d' },
    { label: '41 - 50%', color: '#f4a65d' },
    { label: '> 50%', color: '#f15d5d' },
  ]

  return (
    <div className="page-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-icon">♣</div>
          <div className="brand-title">
            Rwanda Poverty &amp; Vulnerability
            <span>Intelligence Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <button key={item.label} className={item.active ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-brand">Rwanda</div>
          <div className="footer-tag">Inclusive Growth</div>
          <div className="footer-sub">for a Brighter Future</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="mini-brand">Rwanda Poverty &amp; Vulnerability Intelligence Platform</div>
            <div className="topbar-subtitle">Data-driven insights for a more inclusive Rwanda</div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn" aria-label="Notifications">◔</button>
            <div className="user-cta">
              <span className="user-avatar">◌</span>
              <span>Guest User</span>
            </div>
          </div>
        </header>

        <div className="dashboard-panel">
          <div className="page-heading">
            <div className="title-wrap">
              <div className="section-mark">◉</div>
              <div>
                <h1>Rwanda Map</h1>
                <p>Explore poverty, financial inclusion and other key indicators across all 30 districts.</p>
              </div>
            </div>
          </div>

          <section className="filters">
            <div className="filter-box">
              <label>Indicator</label>
              <select defaultValue="Poverty Rate">
                <option>Poverty Rate</option>
                <option>Financial Exclusion</option>
                <option>Multidimensional Poverty</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Compare with</label>
              <select defaultValue="Financial Exclusion">
                <option>Financial Exclusion</option>
                <option>Education</option>
                <option>Water access</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Province</label>
              <select defaultValue="All Provinces">
                <option>All Provinces</option>
                <option>Southern</option>
                <option>Western</option>
                <option>Northern</option>
                <option>Eastern</option>
                <option>Kigali</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Urban/Rural</label>
              <select defaultValue="All">
                <option>All</option>
                <option>Urban</option>
                <option>Rural</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Year</label>
              <select defaultValue="2023/24">
                <option>2023/24</option>
                <option>2022/23</option>
                <option>2021/22</option>
              </select>
            </div>
          </section>

          <section className="map-layout">
            <div className="map-panel">
              <div className="map-header">
                <h2>Poverty Rate (District Level)</h2>
                <div className="legend-inline">
                  {districtLegend.map((item) => (
                    <div key={item.label} className="legend-item">
                      <span style={{ background: item.color }} />
                      <small>{item.label}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="map-wrap">
                <svg viewBox="0 0 500 560" className="rwanda-svg" aria-label="Rwanda map">
                  <g>
                    <path d="M20 260 L90 175 L150 120 L210 122 L295 90 L355 118 L360 170 L420 220 L390 280 L430 335 L357 390 L332 470 L255 488 L205 455 L150 430 L118 372 L82 337 L42 310 Z" fill="#f5f7fa" stroke="#d5d9df" strokeWidth="1" />
                    <path d="M112 170 L136 138 L166 142 L194 160 L188 210 L161 240 L122 220 Z" fill="#8ecf7b" />
                    <path d="M205 120 L255 82 L312 108 L334 150 L300 190 L262 184 L218 170 Z" fill="#f3d26f" />
                    <path d="M316 160 L360 140 L410 167 L390 214 L342 204 L308 183 Z" fill="#74c98a" />
                    <path d="M104 245 L162 225 L180 280 L140 328 L103 312 Z" fill="#f39d60" />
                    <path d="M196 209 L246 198 L277 250 L228 292 L183 276 Z" fill="#f4d15d" />
                    <path d="M270 250 L332 220 L375 264 L346 316 L280 308 Z" fill="#6fc1a7" />
                    <path d="M146 330 L182 305 L235 332 L225 392 L160 402 L128 374 Z" fill="#f09d5d" />
                    <path d="M230 323 L286 308 L298 380 L245 400 L206 366 Z" fill="#f2b74c" />
                    <path d="M286 378 L358 322 L404 360 L376 442 L306 438 Z" fill="#f15a5d" />
                    <path d="M92 353 L147 339 L167 402 L134 454 L78 432 Z" fill="#f9d15d" />
                    <path d="M190 418 L232 392 L270 442 L230 490 L170 473 Z" fill="#eb6e4b" />
                    <path d="M120 450 L175 440 L195 492 L150 528 L101 500 Z" fill="#ecb649" />
                    <path d="M268 440 L330 422 L350 485 L300 522 L250 495 Z" fill="#d95b67" />
                  </g>

                  {mapDistricts.map((district) => (
                    <g key={district.name}>
                      <circle cx={district.x} cy={district.y} r="9" fill="#ffffff" opacity="0.85" />
                      <circle cx={district.x} cy={district.y} r="12" fill="rgba(255,255,255,0.22)" />
                      <text x={district.x} y={district.y + 3} textAnchor="middle" className="district-name">{district.name}</text>
                      <text x={district.x} y={district.y + 18} textAnchor="middle" className="district-value">{district.value.toFixed(1)}%</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            <aside className="intel-panel">
              <div className="intel-header">Intelligence Panel</div>

              <div className="selected-district">
                <div className="district-badge">◌</div>
                <div>
                  <div className="district-title">Nyamagabe District</div>
                  <div className="district-region">Southern Province</div>
                </div>
                <button className="district-btn">Selected District</button>
              </div>

              <div className="mini-cards">
                <div className="mini-card pink">
                  <div className="mini-label">Poverty Rate</div>
                  <div className="mini-value">51.4%</div>
                  <div className="mini-meta">of the population</div>
                </div>

                <div className="mini-card lavender">
                  <div className="mini-label">Multidimensional Poverty</div>
                  <div className="mini-value">—</div>
                  <div className="mini-meta">not available</div>
                </div>

                <div className="mini-card mint">
                  <div className="mini-label">Financial Exclusion</div>
                  <div className="mini-value">—</div>
                  <div className="mini-meta">not available</div>
                </div>
              </div>

              <div className="deprivation-box">
                <div className="subhead">Key Deprivation Patterns</div>
                <div className="deprivation-list">
                  {keyDeprivation.map((item) => (
                    <div key={item.label} className="deprivation-row">
                      <div className="deprivation-label">
                        <span className="deprivation-icon">⌂</span>
                        {item.label}
                      </div>
                      <div className="deprivation-meter">
                        <span style={{ width: `${item.value}%` }} />
                      </div>
                      <strong>{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="compare-box">
                <div className="compare-header">Compare Indicators</div>
                <div className="compare-actions">
                  <button className="compare-pill">High poverty + high financial exclusion</button>
                  <button className="compare-pill">Lower poverty + high financial exclusion</button>
                </div>
              </div>
            </aside>
          </section>

          <section className="bottom-banner">
            <div className="banner-left">
              <div className="info-icon">i</div>
              <div>
                <h3>Why it matters</h3>
                <p>This map helps you explore how poverty, multidimensional deprivation and financial access gap overlap across districts, so you can identify where support is needed most and make evidence-based decisions.</p>
              </div>
            </div>

            <div className="banner-right">
              <div className="banner-stat">25K</div>
              <div className="banner-text">Data-driven insights for a more inclusive Rwanda</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
