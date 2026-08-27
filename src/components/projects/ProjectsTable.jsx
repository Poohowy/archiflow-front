import { ArrowRight } from 'lucide-react'

function createInitials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function ProjectsTable({ projects, buildProjectLink }) {
  return (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Projekt / Klient</th>
            <th>Odpowiedzialny</th>
            <th>Aktualny etap</th>
            <th>Postęp</th>
            <th>Termin zakończenia</th>
            <th>Status</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => {
            const projectLink = buildProjectLink(project.id)

            return (
              <tr key={project.id} className={`project-row project-row-${project.statusType}`}>
                <td>
                  <div className="project-main-cell">
                    <div className="project-main-avatar">{createInitials(project.name)}</div>

                    <div className="project-main-text">
                      <a href={projectLink} className="project-main-link">
                        {project.name}
                      </a>
                      <span>{project.client}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="project-owner-cell">
                    <div className="project-owner-avatar">
                      {project.owner.initials || createInitials(project.owner.name)}
                    </div>
                    <span>{project.owner.name}</span>
                  </div>
                </td>

                <td>
                  <span className="project-stage">{project.stage}</span>
                </td>

                <td>
                  <div className="project-progress-cell">
                    <span className="project-progress-value">{project.progress}%</span>
                    <div
                      className="project-progress-track"
                      role="progressbar"
                      aria-label={`Postęp projektu ${project.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={project.progress}
                    >
                      <div
                        className={`project-progress-fill project-progress-fill-${project.statusType}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td>
                  <span className="project-deadline">{project.deadline}</span>
                </td>

                <td>
                  <span className={`project-status project-status-${project.statusType}`}>
                    {project.status}
                  </span>
                </td>

                <td>
                  <a
                    href={projectLink}
                    className="project-action-button"
                    aria-label={`Przejdź do szczegółów projektu ${project.name}`}
                  >
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </td>
              </tr>
            )
          })}

          {projects.length === 0 && (
            <tr>
              <td colSpan={7}>
                <div className="projects-empty">
                  Brak projektów spełniających wybrane kryteria.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ProjectsTable
