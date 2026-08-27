import './Sidebar.css'

const navigationItems = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'Projekty', icon: 'projects' },
  { label: 'Harmonogram', icon: 'schedule' },
  { label: 'Zespół', icon: 'team' },
  { label: 'Dokumenty', icon: 'documents' },
  { label: 'Klienci', icon: 'clients' },
  { label: 'Ustawienia', icon: 'settings' },
  { label: 'Pomoc', icon: 'help' },
]

function Icon({ name }) {
  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    projects: (
      <>
        <path d="M3 7.5h7l2 2h9v10H3z" />
        <path d="M3 7.5V5h7l2 2" />
      </>
    ),
    schedule: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.2 2.4-5 6-5s6 1.8 6 5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M17 14c2.5 0 4 1.5 4 4" />
      </>
    ),
    documents: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h5M9 12h6M9 16h6" />
      </>
    ),
    clients: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.2 2.4-5 6-5s6 1.8 6 5" />
        <path d="M16 6.5a3 3 0 0 1 0 5.5M17 15c2.5.4 4 2 4 4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.8v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1A1.7 1.7 0 0 0 7.4 15a1.7 1.7 0 0 0-1.5-1H5.7v-2.8h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L7 8.2l2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.8v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.6 2.6 0 1 1 4.5 1.8c-.9.9-2 1.4-2 3" />
        <path d="M12 17h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5M15 8l4 4-4 4M19 12H9" />
      </>
    ),
  }

  return (
    <svg
      className="sidebar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
          </div>

          <span className="brand-name">ArchiFlow</span>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <a
              href="#"
              className={`sidebar-nav-item ${item.active ? 'active' : ''}`}
              key={item.label}
              onClick={(event) => event.preventDefault()}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <div className="user-avatar">AK</div>

          <div className="user-info">
            <span className="user-name">Anna Kowalska</span>
            <span className="user-role">Właściciel</span>
          </div>

          <span className="profile-arrow">›</span>
        </div>

        <a
          href="#"
          className="logout-button"
          onClick={(event) => event.preventDefault()}
        >
          <Icon name="logout" />
          <span>Wyloguj się</span>
        </a>
      </div>
    </aside>
  )
}

export default Sidebar