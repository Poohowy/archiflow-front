import { ArrowUpDown, Search } from 'lucide-react'
import { projectSortOptions, projectTabFilters } from '../../data/projects'

function ProjectsControls({
  searchQuery,
  activeTab,
  sortBy,
  onSearchChange,
  onTabChange,
  onSortChange,
}) {
  return (
    <div className="projects-controls">
      <div className="projects-search-field">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Szukaj projektu lub klienta..."
          aria-label="Szukaj projektu lub klienta"
        />
      </div>

      <div className="projects-filters-row">
        <div className="projects-tabs" role="tablist" aria-label="Filtr statusów projektów">
          {projectTabFilters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`projects-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="projects-tab-count">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="projects-sort">
          <ArrowUpDown size={14} aria-hidden="true" />
          <label htmlFor="projects-sort-select">Sortuj:</label>
          <select
            id="projects-sort-select"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {projectSortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default ProjectsControls
