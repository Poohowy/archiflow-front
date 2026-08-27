import "./Dashboard.css";
import {
  kpis,
  attentionProjects,
  upcomingDeadlines,
  teamLoad,
  recentProjects,
} from "../data/dashboard";

function KpiIcon({ type }) {
  const icons = {
    projects: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h3M8 12h8M8 16h5" />
      </>
    ),
    attention: (
      <>
        <path d="M12 4 21 20H3L12 4Z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
    delay: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    team: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c0-3.2 2.8-5 7-5s7 1.8 7 5" />
      </>
    ),
  };

  return (
    <div className={`kpi-icon kpi-icon-${type}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icons[type]}
      </svg>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Przegląd sytuacji w Twojej firmie</p>
        </div>

        <button className="notification-button" aria-label="Powiadomienia">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          <span className="notification-dot" />
        </button>
      </header>

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <article className="kpi-card" key={kpi.label}>
            <div className="kpi-card-top">
              <KpiIcon type={kpi.type} />

              <button className="kpi-menu" aria-label={`Opcje: ${kpi.label}`}>
                •••
              </button>
            </div>

            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-section-grid">
        <article className="dashboard-card attention-card">
          <div className="section-header">
            <div>
              <h2>Wymaga uwagi</h2>
              <p>Projekty wymagające reakcji</p>
            </div>

            <button className="text-button">Zobacz wszystkie</button>
          </div>

          <div className="attention-list">
            {attentionProjects.map((project) => (
              <div className="attention-item" key={project.name}>
                <div className={`attention-status ${project.type}`} />

                <div className="attention-content">
                  <div className="attention-project-name">{project.name}</div>

                  <div className="attention-issue">{project.issue}</div>
                </div>

                <div className="attention-date">{project.date}</div>

                <button
                  className="row-arrow"
                  aria-label={`Otwórz ${project.name}`}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card deadlines-card">
          <div className="section-header">
            <div>
              <h2>Najbliższe terminy</h2>
              <p>Nadchodzące ważne wydarzenia</p>
            </div>

            <button className="text-button">Wszystkie</button>
          </div>

          <div className="deadline-list">
            {upcomingDeadlines.map((deadline) => (
              <div
                className="deadline-item"
                key={`${deadline.date}-${deadline.title}`}
              >
                <div className="deadline-date">
                  <strong>{deadline.date}</strong>
                  <span>{deadline.month}</span>
                </div>

                <div className="deadline-content">
                  <strong>{deadline.title}</strong>
                  <span>{deadline.project}</span>
                </div>

                <button
                  className="row-arrow"
                  aria-label={`Otwórz ${deadline.title}`}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-card team-load-card">
          <div className="section-header">
            <div>
              <h2>Obciążenie zespołu</h2>
              <p>Aktualne wykorzystanie zespołu</p>
            </div>

            <button className="text-button">Szczegóły</button>
          </div>

          <div className="team-load-main">
            <div className="load-circle">
              <div className="load-circle-inner">
                <strong>76%</strong>
                <span>średnie</span>
              </div>
            </div>

            <div className="load-summary">
              {teamLoad.map((item) => (
                <div className="load-row" key={item.label}>
                  <div className="load-row-label">
                    <span className={`load-dot ${item.type}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="load-row-value">
                    <strong>{item.value}</strong>
                    <span>{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="team-load-footer">
            <span>8 członków zespołu</span>
            <span className="load-warning">1 osoba wymaga uwagi</span>
          </div>
        </article>

        <article className="dashboard-card projects-card">
          <div className="section-header">
            <div>
              <h2>Ostatnie projekty</h2>
              <p>Ostatnio aktualizowane projekty</p>
            </div>

            <button className="text-button">Wszystkie projekty</button>
          </div>

          <div className="projects-table-wrapper">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Projekt / Klient</th>
                  <th>Etap</th>
                  <th>Postęp</th>
                  <th>Termin</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.name}>
                    <td>
                      <div className="project-cell">
                        <div className="project-avatar">
                          {project.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <strong>{project.name}</strong>
                          <span>{project.client}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="stage-text">{project.stage}</span>
                    </td>

                    <td>
                      <div className="progress-cell">
                        <div className="progress-track">
                          <div
                            className="progress-bar"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>

                        <span>{project.progress}%</span>
                      </div>
                    </td>

                    <td>
                      <span className="deadline-text">{project.deadline}</span>
                    </td>

                    <td>
                      <span className={`project-status ${project.statusType}`}>
                        {project.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="row-arrow"
                        aria-label={`Otwórz ${project.name}`}
                      >
                        →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
