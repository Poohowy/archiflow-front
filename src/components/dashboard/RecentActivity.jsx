import {
  CalendarClock,
  CheckCircle2,
  FilePlus2,
  FileUp,
  ListChecks,
} from "lucide-react";
import "./RecentActivity.css";

const activityIconMap = {
  "document-added": FilePlus2,
  "client-approved": CheckCircle2,
  "deadline-moved": CalendarClock,
  "stage-finished": ListChecks,
  "document-sent": FileUp,
};

function RecentActivity({ items }) {
  return (
    <section className="recent-activity-section">
      <article className="dashboard-card recent-activity-card">
        <div className="section-header">
          <div>
            <h2>Ostatnia aktywność</h2>
            <p>Chronologiczny podgląd ostatnich działań w projektach</p>
          </div>

          <button className="text-button">Pełna historia</button>
        </div>

        <div className="recent-activity-list">
          {items.map((activity) => {
            const ActivityIcon = activityIconMap[activity.type] || FileUp;

            return (
              <div className="recent-activity-item" key={activity.id}>
                <div className={`recent-activity-icon ${activity.type}`}>
                  <ActivityIcon size={16} aria-hidden="true" />
                </div>

                <div className="recent-activity-content">
                  <strong>{activity.title}</strong>
                  <span>{activity.details}</span>
                </div>

                <div className="recent-activity-meta">
                  <span>{activity.date}</span>
                  <strong>{activity.time}</strong>
                </div>

                <button
                  className="row-arrow"
                  aria-label={`Otwórz aktywność: ${activity.title}`}
                >
                  →
                </button>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

export default RecentActivity;
