import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead } from "../../services";

export default function NotificationBell({ employeeId }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);

  const load = () => {
    if (!employeeId) return;
    getNotifications(employeeId).then(setNotes).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const unreadCount = notes.filter((n) => !n.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button className="secondary" onClick={() => setOpen((o) => !o)}>
        🔔 {unreadCount > 0 ? `(${unreadCount})` : ""}
      </button>
      {open && (
        <div
          className="card"
          style={{ position: "absolute", right: 0, top: 40, width: 320, zIndex: 20 }}
        >
          <div className="section-title">Notifications</div>
          <div className="notif-list">
            {notes.length === 0 && <div className="empty-state">No notifications yet.</div>}
            {notes.map((n) => (
              <div
                key={n.id}
                className={"notif-item" + (n.read ? "" : " unread")}
                onClick={() => {
                  if (!n.read) {
                    markNotificationRead(n.id).then(load);
                  }
                }}
                style={{ cursor: n.read ? "default" : "pointer" }}
              >
                {n.message}
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
