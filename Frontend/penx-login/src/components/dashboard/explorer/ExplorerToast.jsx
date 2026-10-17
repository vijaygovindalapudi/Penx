import "./ExplorerToast.css";

export default function ExplorerToast({
  show,
  icon,
  telugu,
  english,
}) {
  if (!show) return null;

  return (
    <div className="penx-toast">
      <div className="penx-toast-icon">
        {icon}
      </div>

      <div className="penx-toast-content">
        <div className="penx-toast-telugu">
          {telugu}
        </div>

        <div className="penx-toast-english">
          {english}
        </div>
      </div>
    </div>
  );
}