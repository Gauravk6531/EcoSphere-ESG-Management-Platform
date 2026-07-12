export function Pill({ value }) {
  if (value === null || value === undefined) return <span>-</span>;
  const key = String(value).toLowerCase();
  return <span className={`badge-pill pill-${key}`}>{key.replace(/_/g, " ")}</span>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="error-banner">{message}</div>;
}

export function Empty({ text = "No records yet." }) {
  return <div className="empty-state">{text}</div>;
}
