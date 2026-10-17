import { useRef, useState } from "react";
import GoogleUIButton from "../ui/GoogleButton";

export default function GoogleButton({ onClick }) {
  const busyRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (busyRef.current || typeof onClick !== "function") {
      return;
    }

    busyRef.current = true;
    setLoading(true);

    try {
      await onClick();
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="w-full" aria-busy={loading}>
      <fieldset
        disabled={loading}
        className="m-0 w-full min-w-0 border-0 p-0"
      >
        <GoogleUIButton onClick={handleClick} />
      </fieldset>

      {loading && (
        <p
          role="status"
          className="mt-2 text-center text-xs text-ink-muted"
        >
          Connecting to Google…
        </p>
      )}
    </div>
  );
}