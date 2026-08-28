import { ArrowUpDown, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  clientSortOptions,
  clients,
  clientStatusFilterOptions,
  clientTypeFilterOptions,
} from '../data/clients'
import './Clients.css'

function normalizeText(value) {
  return value.toLocaleLowerCase('pl-PL')
}

function createInitials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatLastActivity(dateValue) {
  if (!dateValue) {
    return 'Brak aktywności'
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function formatProjectValue(value) {
  if (typeof value !== 'number') {
    return '—'
  }

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(value)
}

function sortClients(clientRows, sortBy) {
  const sortedClients = [...clientRows]

  sortedClients.sort((clientA, clientB) => {
    if (sortBy === 'active-projects-desc') {
      if (clientA.activeProjectsCount !== clientB.activeProjectsCount) {
        return clientB.activeProjectsCount - clientA.activeProjectsCount
      }
    }

    if (sortBy === 'last-activity-desc') {
      const dateA = clientA.lastActivityAt ? new Date(clientA.lastActivityAt).getTime() : 0
      const dateB = clientB.lastActivityAt ? new Date(clientB.lastActivityAt).getTime() : 0

      if (dateA !== dateB) {
        return dateB - dateA
      }
    }

    return clientA.name.localeCompare(clientB.name, 'pl')
  })

  return sortedClients
}

function buildProjectsHashForClient(clientId) {
  const searchParams = new URLSearchParams()
  searchParams.set('klient', clientId)
  return `#/projekty?${searchParams.toString()}`
}

function Clients() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')

  const visibleClients = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery.trim())
    const filteredClients = clients.filter((client) => {
      const searchMatch =
        normalizedSearch.length === 0 ||
        normalizeText(client.name).includes(normalizedSearch) ||
        client.projects.some((project) => normalizeText(project.name).includes(normalizedSearch))

      const statusMatch = selectedStatus === 'all' || client.statusType === selectedStatus
      const typeMatch = selectedType === 'all' || client.type === selectedType

      return searchMatch && statusMatch && typeMatch
    })

    return sortClients(filteredClients, sortBy)
  }, [searchQuery, selectedStatus, selectedType, sortBy])

  return (
    <div className="clients-page">
      <header className="clients-header">
        <div className="clients-title-group">
          <h1>Klienci</h1>
          <p>Przeglądaj klientów i przechodź bezpośrednio do ich projektów.</p>
        </div>

        <button className="primary-action-button" type="button">
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          <span>Dodaj klienta</span>
        </button>
      </header>

      <section className="clients-list-shell">
        <div className="clients-controls-panel" aria-label="Filtry listy klientów">
          <div className="clients-search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Szukaj klienta lub projektu..."
              aria-label="Szukaj klienta lub projektu"
            />
          </div>

          <div className="clients-controls-right">
            <label className={`clients-select-filter ${selectedStatus !== 'all' ? 'active' : ''}`}>
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                aria-label="Filtr statusu klienta"
              >
                {clientStatusFilterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`clients-select-filter ${selectedType !== 'all' ? 'active' : ''}`}>
              <span>Typ klienta:</span>
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                aria-label="Filtr typu klienta"
              >
                {clientTypeFilterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="clients-sort">
              <ArrowUpDown size={14} aria-hidden="true" />
              <label htmlFor="clients-sort-select">Sortuj:</label>
              <select
                id="clients-sort-select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {clientSortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="clients-table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Klient</th>
                <th>Typ klienta</th>
                <th>Aktywne projekty</th>
                <th>Wartość projektów</th>
                <th>Ostatnia aktywność</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {visibleClients.map((client) => {
                const projectLink = buildProjectsHashForClient(client.id)

                return (
                  <tr key={client.id} className={`client-row client-row-${client.statusType}`}>
                    <td>
                      <div className="client-main-cell">
                        <div className="client-main-avatar">{createInitials(client.name)}</div>

                        <div className="client-main-text">
                          <strong>{client.name}</strong>
                          <span>{client.totalProjectsCount} projektów łącznie</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="client-type-pill">{client.type}</span>
                    </td>

                    <td>
                      {client.activeProjectsCount > 0 ? (
                        <div className="client-projects-cell">
                          <a href={projectLink} className="client-projects-count-link">
                            {client.activeProjectsCount}
                          </a>
                          <a href={projectLink} className="client-projects-link">
                            Zobacz projekty
                          </a>
                        </div>
                      ) : (
                        <span className="client-projects-empty">Brak</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`client-value ${client.projectsValue == null ? 'is-empty' : ''}`}
                        title={client.projectsValue == null ? 'Brak danych o wartości projektów' : undefined}
                      >
                        {formatProjectValue(client.projectsValue)}
                      </span>
                    </td>

                    <td>
                      <div className="client-activity-cell">
                        <span>{formatLastActivity(client.lastActivityAt)}</span>
                        {client.lastActivityProjectName && <small>{client.lastActivityProjectName}</small>}
                      </div>
                    </td>

                    <td>
                      <span className={`client-status client-status-${client.statusType}`}>
                        {client.statusLabel}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {visibleClients.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="clients-empty">
                      Brak klientów spełniających wybrane kryteria.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Clients
