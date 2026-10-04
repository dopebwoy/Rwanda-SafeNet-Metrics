import { useMemo, useState } from 'react'
import './App.css'

const navItems = [
  { label: 'Dashboard', icon: '⌂' },
  { label: 'Poverty Explorer', icon: '⌕' },
  { label: 'Vulnerability Profiler', icon: '◬' },
  { label: 'Multidimensional Poverty', icon: '▣' },
  { label: 'Financial Inclusion', icon: '◫' },
  { label: 'Rwanda Map', icon: '▦' },
  { label: 'Insights & Reports', icon: '▤' },
]

const districts = [
  { name: 'Nyagatare', province: 'Eastern', value: 35.4, x: 315, y: 140, urbanRural: 'Rural', poverty: 35.4, financialExclusion: 42.1, multidimensional: 33.2 },
  { name: 'Rubavu', province: 'Western', value: 38.8, x: 120, y: 176, urbanRural: 'Urban', poverty: 38.8, financialExclusion: 41.7, multidimensional: 35.1 },
  { name: 'Gatsibo', province: 'Eastern', value: 18.4, x: 310, y: 216, urbanRural: 'Rural', poverty: 18.4, financialExclusion: 27.5, multidimensional: 20.8 },
  { name: 'Kayonza', province: 'Eastern', value: 36.6, x: 365, y: 257, urbanRural: 'Rural', poverty: 36.6, financialExclusion: 39.9, multidimensional: 31.6 },
  { name: 'Kirehe', province: 'Eastern', value: 14.2, x: 430, y: 250, urbanRural: 'Rural', poverty: 14.2, financialExclusion: 26.8, multidimensional: 22.4 },
  { name: 'Nyanza', province: 'Southern', value: 51.4, x: 220, y: 385, urbanRural: 'Rural', poverty: 51.4, financialExclusion: 62.2, multidimensional: 48.7 },
  { name: 'Musanze', province: 'Northern', value: 42.8, x: 165, y: 290, urbanRural: 'Rural', poverty: 42.8, financialExclusion: 44.5, multidimensional: 39.1 },
  { name: 'Kigali', province: 'Kigali', value: 31.2, x: 215, y: 330, urbanRural: 'Urban', poverty: 31.2, financialExclusion: 24.6, multidimensional: 28.5 },
  { name: 'Gisagara', province: 'Southern', value: 45.6, x: 260, y: 445, urbanRural: 'Rural', poverty: 45.6, financialExclusion: 54.1, multidimensional: 46.8 },
  { name: 'Rutsiro', province: 'Western', value: 40.8, x: 95, y: 230, urbanRural: 'Rural', poverty: 40.8, financialExclusion: 47.3, multidimensional: 37.6 },
  { name: 'Nyabihu', province: 'Western', value: 27.9, x: 110, y: 145, urbanRural: 'Rural', poverty: 27.9, financialExclusion: 31.2, multidimensional: 28.8 },
  { name: 'Karongi', province: 'Western', value: 46.4, x: 135, y: 350, urbanRural: 'Rural', poverty: 46.4, financialExclusion: 52.8, multidimensional: 42.3 },
  { name: 'Rusizi', province: 'Western', value: 44.2, x: 70, y: 420, urbanRural: 'Rural', poverty: 44.2, financialExclusion: 48.6, multidimensional: 41.5 },
  { name: 'Nyamagabe', province: 'Southern', value: 51.4, x: 230, y: 420, urbanRural: 'Rural', poverty: 51.4, financialExclusion: 58.4, multidimensional: 49.9 },
  { name: 'Nyaruguru', province: 'Southern', value: 39.7, x: 310, y: 460, urbanRural: 'Rural', poverty: 39.7, financialExclusion: 46.7, multidimensional: 38.5 },
]

const provinceStats = [
  { label: 'Northern', value: 41.2 },
  { label: 'Eastern', value: 34.7 },
  { label: 'Southern', value: 28.3 },
  { label: 'Western', value: 22.1 },
  { label: 'Kigali', value: 17.6 },
]

const districtLegend = [
  { label: '< 20%', color: '#4ecb9a' },
  { label: '20 - 30%', color: '#8ed66a' },
  { label: '31 - 40%', color: '#f4d95d' },
  { label: '41 - 50%', color: '#f4a65d' },
  { label: '> 50%', color: '#f15d5d' },
]

const keyDeprivation = [
  { label: 'Housing', value: 78 },
  { label: 'Cooking fuel', value: 62 },
  { label: 'Water', value: 48 },
  { label: 'Health insurance', value: 35 },
]

const priorityRows = [
  { district: 'Nyamagabe', status: 'High priority', score: 81 },
  { district: 'Nyanza', status: 'High priority', score: 79 },
  { district: 'Karongi', status: 'Priority', score: 72 },
  { district: 'Rubavu', status: 'Moderate', score: 64 },
  { district: 'Kigali', status: 'Moderate', score: 58 },
]

const insights = [
  'Higher poverty rates are observed in rural areas (36.7%) compared to urban areas (18.4%).',
  'Households with lower education levels and unstable employment are more likely to be vulnerable to poverty.',
  'Financial exclusion is higher among youth (18-24) and women, especially in rural areas.',
  'The multidimensional poverty index is highest in the Northern and Southern Provinces.',
]

const fullStats = [
  { label: 'Poverty Rate', value: '27.4%', detail: 'of the population', tone: 'blue' },
  { label: 'Extreme Poverty Rate', value: '6.7%', detail: 'of the population', tone: 'purple' },
  { label: 'Multidimensional Poverty', value: '30.5%', detail: 'of the population', tone: 'green' },
  { label: 'Financial Inclusion', value: '96.0%', detail: 'of adults', tone: 'orange' },
]

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value)

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [selectedDistrict, setSelectedDistrict] = useState('Nyamagabe')
  const [filters, setFilters] = useState({
    indicator: 'Poverty Rate',
    compare: 'Financial Exclusion',
    province: 'All Provinces',
    urbanRural: 'All',
    year: '2023/24',
  })

  const provinceOptions = ['All Provinces', 'Northern', 'Eastern', 'Southern', 'Western', 'Kigali']
  const urbanOptions = ['All', 'Urban', 'Rural']

  const filteredDistricts = useMemo(() => {
    return districts.filter((district) => {
      const matchesProvince = filters.province === 'All Provinces' || district.province === filters.province
      const matchesUrbanRural = filters.urbanRural === 'All' || district.urbanRural === filters.urbanRural
      return matchesProvince && matchesUrbanRural
    })
  }, [filters])

  const averageRate = useMemo(() => {
    if (!filteredDistricts.length) return 0
    return filteredDistricts.reduce((sum, item) => sum + item.poverty, 0) / filteredDistricts.length
  }, [filteredDistricts])

  const selectedDistrictInfo =
    districts.find((district) => district.name === selectedDistrict) ?? filteredDistricts[0] ?? districts[0]

  const currentRate = selectedDistrictInfo?.poverty ?? 0
  const currentExclusion = selectedDistrictInfo?.financialExclusion ?? 0
  const currentMultidim = selectedDistrictInfo?.multidimensional ?? 0

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const renderDashboard = () => (
    <>
      <div className="page-heading">
        <div className="title-wrap">
          <div className="section-mark">◉</div>
          <div>
            <h1>Welcome to the Rwanda Poverty &amp; Vulnerability Intelligence Platform</h1>
            <p>Explore data, discover patterns, and support evidence-based decisions for inclusive development.</p>
          </div>
        </div>
      </div>

      <section className="filters-row dashboard-filters">
        <div className="filter-box">
          <label>Province</label>
          <select name="province" value={filters.province} onChange={handleFilterChange}>
            {provinceOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>District</label>
          <select
            name="district"
            value={selectedDistrict}
            onChange={(event) => setSelectedDistrict(event.target.value)}
          >
            <option value="All Districts">All Districts</option>
            {districts.map((district) => (
              <option key={district.name} value={district.name}>{district.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>Urban/Rural</label>
          <select name="urbanRural" value={filters.urbanRural} onChange={handleFilterChange}>
            {urbanOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>Population Group</label>
          <select defaultValue="All">
            <option>All</option>
            <option>Women</option>
            <option>Children</option>
            <option>Youth</option>
            <option>Older persons</option>
          </select>
        </div>
      </section>

      <section className="stats-grid">
        {fullStats.map((stat) => (
          <article key={stat.label} className={`stat-card ${stat.tone}`}>
            <div className="stat-icon">
              {stat.tone === 'blue' ? '👥' : stat.tone === 'purple' ? '◫' : stat.tone === 'green' ? '▣' : '🏛'}
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-detail">{stat.detail}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="main-grid">
        <div className="panel chart-panel">
          <div className="panel-title">Poverty Rate by Province</div>
          <div className="bar-chart">
            {provinceStats.map((item) => (
              <div key={item.label} className="bar-group">
                <div className="bar-value">{item.value}%</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${item.value}%` }} />
                </div>
                <div className="bar-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel map-panel">
          <div className="panel-title">District vulnerability map</div>
          <svg viewBox="0 0 500 520" className="rwanda-map" aria-label="Rwanda map preview">
            <g>
              <path d="M120 118 L195 100 L260 118 L236 175 L176 168 L120 152 Z" fill="#8dc26f" stroke="#fff" strokeWidth="2" />
              <path d="M195 100 L280 80 L345 145 L310 190 L260 118 Z" fill="#f4d36b" stroke="#fff" strokeWidth="2" />
              <path d="M120 152 L176 168 L165 255 L95 265 L65 202 Z" fill="#ff9a6f" stroke="#fff" strokeWidth="2" />
              <path d="M176 168 L236 175 L270 246 L210 300 L165 255 Z" fill="#ef8aa9" stroke="#fff" strokeWidth="2" />
              <path d="M270 246 L310 190 L386 225 L355 300 L291 312 Z" fill="#7abef5" stroke="#fff" strokeWidth="2" />
              <path d="M210 300 L291 312 L275 395 L215 392 L180 345 Z" fill="#71c57d" stroke="#fff" strokeWidth="2" />
              <path d="M275 395 L355 300 L405 353 L340 452 L276 438 Z" fill="#f0c153" stroke="#fff" strokeWidth="2" />
              <path d="M95 265 L165 255 L180 345 L125 392 L58 325 Z" fill="#58b4df" stroke="#fff" strokeWidth="2" />
              <path d="M125 392 L180 345 L215 392 L175 454 L87 438 Z" fill="#7ad0a2" stroke="#fff" strokeWidth="2" />
            </g>

            {districts.slice(0, 9).map((district) => (
              <g key={district.name}>
                <circle cx={district.x} cy={district.y} r="8" fill="#0d3b74" />
                <circle cx={district.x} cy={district.y} r="14" fill="rgba(13,59,116,0.17)" />
                <text x={district.x} y={district.y - 15} className="map-label" textAnchor="middle">{district.name}</text>
                <text x={district.x} y={district.y + 18} className="map-value" textAnchor="middle">{district.value.toFixed(1)}%</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="panel insights-panel">
          <div className="panel-title">Key Insights</div>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-badge">{index + 1}</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
          <button className="mini-button">View detailed analysis</button>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel large-panel">
          <div className="panel-title-row">
            <div className="panel-title">Multidimensional Poverty by Dimension</div>
            <button className="text-link">View full analysis</button>
          </div>

          <div className="dimension-list">
            {[
              { label: 'Education', value: 18.2 },
              { label: 'Health', value: 12.6 },
              { label: 'Living Standards', value: 20.4 },
              { label: 'Housing', value: 16.8 },
              { label: 'Water & Sanitation', value: 10.3 },
              { label: 'Electricity', value: 8.7 },
              { label: 'Employment', value: 14.5 },
            ].map((item) => (
              <div key={item.label} className="dimension-row">
                <div className="dimension-label">{item.label}</div>
                <div className="dimension-bar">
                  <span style={{ width: `${item.value}%` }} />
                </div>
                <div className="dimension-value">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel profile-panel">
          <div className="panel-title-row">
            <div className="panel-title">Household Vulnerability Profile</div>
            <button className="text-link">View full analysis</button>
          </div>

          <div className="profile-list">
            {[
              { label: 'Large household size (≥ 6)', value: 42.3 },
              { label: 'No formal education', value: 38.7 },
              { label: 'Unemployment', value: 34.1 },
              { label: 'Poor housing conditions', value: 28.6 },
              { label: 'No financial access', value: 26.9 },
              { label: 'Dependents (children/elderly)', value: 24.7 },
            ].map((item) => (
              <div key={item.label} className="profile-row">
                <div className="profile-text">{item.label}</div>
                <div className="profile-value">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel financial-panel">
          <div className="panel-title-row">
            <div className="panel-title">Financial Inclusion Access</div>
            <button className="text-link">View details</button>
          </div>

          <div className="donut-wrap">
            <div className="donut-chart">
              <div className="donut-inner">
                <strong>96.0%</strong>
                <span>Financially Included</span>
              </div>
            </div>
          </div>

          <div className="legend-list">
            <div><span className="legend-dot dot-green" /> Formal bank <strong>72.4%</strong></div>
            <div><span className="legend-dot dot-blue" /> Informal (mobile money) <strong>23.6%</strong></div>
            <div><span className="legend-dot dot-gray" /> Excluded <strong>4.0%</strong></div>
          </div>
        </div>
      </section>
    </>
  )

  const renderMapPage = () => (
    <>
      <div className="page-heading map-page-heading">
        <div className="title-wrap">
          <div className="section-mark">◉</div>
          <div>
            <h1>Rwanda Map</h1>
            <p>Explore poverty, financial inclusion and other key indicators across all 30 districts.</p>
          </div>
        </div>
      </div>

      <section className="filters map-filters">
        <div className="filter-box">
          <label>Indicator</label>
          <select name="indicator" value={filters.indicator} onChange={handleFilterChange}>
            <option>Poverty Rate</option>
            <option>Financial Exclusion</option>
            <option>Multidimensional Poverty</option>
          </select>
        </div>

        <div className="filter-box">
          <label>Compare with</label>
          <select name="compare" value={filters.compare} onChange={handleFilterChange}>
            <option>Financial Exclusion</option>
            <option>Education</option>
            <option>Water access</option>
            <option>Employment</option>
          </select>
        </div>

        <div className="filter-box">
          <label>Province</label>
          <select name="province" value={filters.province} onChange={handleFilterChange}>
            {provinceOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>Urban/Rural</label>
          <select name="urbanRural" value={filters.urbanRural} onChange={handleFilterChange}>
            {urbanOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>Year</label>
          <select name="year" value={filters.year} onChange={handleFilterChange}>
            <option>2023/24</option>
            <option>2022/23</option>
            <option>2021/22</option>
          </select>
        </div>
      </section>

      <section className="map-layout detail-map-layout">
        <div className="map-panel large-map-panel">
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
            <svg viewBox="0 0 500 560" className="rwanda-svg" aria-label="Rwanda district map">
              <g>
                <path d="M20 260 L90 175 L150 120 L210 122 L295 90 L355 118 L360 170 L420 220 L390 280 L430 335 L357 390 L332 470 L255 488 L205 455 L150 430 L118 372 L82 337 L42 310 Z" fill="#f5f7fa" stroke="#d5d9df" strokeWidth="1" />
                <path d="M105 176 L136 140 L166 143 L192 161 L188 212 L158 236 L121 218 Z" fill="#8ecf7b" />
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

              {filteredDistricts.map((district) => {
                const isSelected = selectedDistrict === district.name
                const color = district.value < 20 ? '#4ecb9a' : district.value < 30 ? '#8ed66a' : district.value < 40 ? '#f4d95d' : district.value < 50 ? '#f4a65d' : '#f15d5d'

                return (
                  <g key={district.name} onClick={() => setSelectedDistrict(district.name)} style={{ cursor: 'pointer' }}>
                    <circle cx={district.x} cy={district.y} r={isSelected ? 12 : 9} fill={color} opacity={isSelected ? 1 : 0.92} />
                    <circle cx={district.x} cy={district.y} r={isSelected ? 18 : 14} fill="rgba(255,255,255,0.14)" />
                    <text x={district.x} y={district.y + 3} textAnchor="middle" className="district-name">{district.name}</text>
                    <text x={district.x} y={district.y + 18} textAnchor="middle" className="district-value">{district.value.toFixed(1)}%</text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <aside className="intel-panel">
          <div className="intel-header">Intelligence Panel</div>

          <div className="selected-district">
            <div className="district-badge">◌</div>
            <div>
              <div className="district-title">{selectedDistrictInfo.name} District</div>
              <div className="district-region">{selectedDistrictInfo.province} Province</div>
            </div>
            <button className="district-btn">Selected District</button>
          </div>

          <div className="mini-cards">
            <div className="mini-card pink">
              <div className="mini-label">Poverty Rate</div>
              <div className="mini-value">{currentRate.toFixed(1)}%</div>
              <div className="mini-meta">of the population</div>
            </div>

            <div className="mini-card lavender">
              <div className="mini-label">Multidimensional Poverty</div>
              <div className="mini-value">{currentMultidim.toFixed(1)}%</div>
              <div className="mini-meta">not available</div>
            </div>

            <div className="mini-card mint">
              <div className="mini-label">Financial Exclusion</div>
              <div className="mini-value">{currentExclusion.toFixed(1)}%</div>
              <div className="mini-meta">of households</div>
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
    </>
  )

  const renderExplorer = () => (
    <>
      <div className="page-heading">
        <div className="title-wrap">
          <div className="section-mark">◍</div>
          <div>
            <h1>Poverty Explorer</h1>
            <p>Analyze poverty trends, district density, and estimated population vulnerability.</p>
          </div>
        </div>
      </div>

      <section className="filters-row">
        <div className="filter-box">
          <label>Province</label>
          <select name="province" value={filters.province} onChange={handleFilterChange}>
            {provinceOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>Urban/Rural</label>
          <select name="urbanRural" value={filters.urbanRural} onChange={handleFilterChange}>
            {urbanOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>Year</label>
          <select name="year" value={filters.year} onChange={handleFilterChange}>
            <option>2023/24</option>
            <option>2022/23</option>
            <option>2021/22</option>
          </select>
        </div>
      </section>

      <section className="panel-row explorer-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Priority Districts</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {priorityRows.map((row) => (
                  <tr key={row.district}>
                    <td>{row.district}</td>
                    <td><span className={row.status === 'High priority' ? 'status-warn' : row.status === 'Priority' ? 'status-soft' : 'status-good'}>{row.status}</span></td>
                    <td>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Current view summary</h3>
          </div>
          <div className="summary-box">
            <div className="summary-figure">{averageRate.toFixed(1)}%</div>
            <div className="summary-copy">Average poverty rate across the visible districts in this filter set.</div>
            <div className="summary-stats">
              <div><strong>{filteredDistricts.length}</strong><span>districts</span></div>
              <div><strong>{formatNumber(Math.round((averageRate / 100) * 1200000))}</strong><span>people affected</span></div>
            </div>
          </div>
        </div>
      </section>
    </>
  )

  const renderReports = () => (
    <>
      <div className="page-heading">
        <div className="title-wrap">
          <div className="section-mark">◌</div>
          <div>
            <h1>Insights &amp; Reports</h1>
            <p>Evidence summaries, public policy signals, and operational observations.</p>
          </div>
        </div>
      </div>

      <section className="report-grid">
        <div className="panel report-card">
          <div className="panel-title">Evidence summary</div>
          <ul className="bullet-list">
            {insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="panel report-card">
          <div className="panel-title">Snapshot</div>
          <div className="report-stat-stack">
            <div>
              <span className="report-label">Selected district</span>
              <strong>{selectedDistrictInfo.name}</strong>
            </div>
            <div>
              <span className="report-label">Poverty rate</span>
              <strong>{currentRate.toFixed(1)}%</strong>
            </div>
            <div>
              <span className="report-label">Financial exclusion</span>
              <strong>{currentExclusion.toFixed(1)}%</strong>
            </div>
            <div>
              <span className="report-label">Average filtered rate</span>
              <strong>{averageRate.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  )

  const renderPage = () => {
    switch (activePage) {
      case 'Rwanda Map':
        return renderMapPage()
      case 'Poverty Explorer':
        return renderExplorer()
      case 'Insights & Reports':
        return renderReports()
      default:
        return renderDashboard()
    }
  }

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
            <button
              key={item.label}
              className={activePage === item.label ? 'nav-item active' : 'nav-item'}
              onClick={() => setActivePage(item.label)}
            >
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

        <div className="dashboard-panel">{renderPage()}</div>
      </main>
    </div>
  )
}

export default App
