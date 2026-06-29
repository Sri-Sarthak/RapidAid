import { useRef, useState } from "react";
import { Siren } from "lucide-react";

const HOLD_MS = 1200;
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SOSButton = ({ onConfirm, loading }) => {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef(null);

  const startHold = (e) => {
    e.preventDefault();
    if (loading) return;
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, HOLD_MS);
  };

  const cancelHold = () => {
    clearTimeout(timerRef.current);
    setHolding(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
        {/* Pulsing "radius search" rings - echoes the volunteer radius concept */}
        <span className="absolute inset-0 rounded-full bg-emergency-400/25 animate-ping-slow" />
        <span
          className="absolute inset-0 rounded-full bg-emergency-400/20 animate-ping-slow"
          style={{ animationDelay: "0.9s" }}
        />

        {/* Hold-to-confirm progress ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#fecaca" strokeWidth="6" />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={holding ? 0 : CIRCUMFERENCE}
            style={{ transition: holding ? `stroke-dashoffset ${HOLD_MS}ms linear` : "none" }}
          />
        </svg>

        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          disabled={loading}
          className={`relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full bg-emergency-600 text-white shadow-2xl shadow-emergency-600/40 transition-transform active:scale-95 sm:h-44 sm:w-44 ${
            loading ? "opacity-70" : ""
          }`}
        >
          <Siren size={36} />
          <span className="mt-1 font-display text-2xl font-extrabold tracking-wide">SOS</span>
          <span className="mt-0.5 text-[11px] opacity-90">
            {loading ? "Sending alert..." : "Press & hold"}
          </span>
        </button>
      </div>

      <p className="mt-5 max-w-xs text-center text-sm text-ink-500">
        Press and hold the button for a second to send your live location to your family and alert nearby
        volunteers and hospitals.
      </p>
    </div>
  );
};

export default SOSButton;
