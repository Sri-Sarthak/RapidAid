import { Siren, Eye, MapPin, Clock, Navigation2 } from "lucide-react";
import { timeAgo, mapsLink } from "../utils/format";

const AlertCard = ({ alert, distanceKm, onAccept, accepting, disabled }) => {
  const isSOS = alert.type === "sos";
  const [lng, lat] = alert.location.coordinates;

  return (
    <div className="card animate-fade-up overflow-hidden border-l-4 border-l-emergency-500 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emergency-100 text-emergency-600">
            {isSOS ? <Siren size={18} /> : <Eye size={18} />}
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-ink-800">
              {isSOS ? "SOS - Person needs immediate help" : "Accident reported by bystander"}
            </h3>
            {alert.victimName && (
              <p className="text-xs text-ink-500">Victim: {alert.victimName}</p>
            )}
            {alert.description && (
              <p className="mt-1 text-sm text-ink-600">{alert.description}</p>
            )}
          </div>
        </div>
        {typeof distanceKm === "number" && (
          <span className="badge shrink-0 bg-emergency-50 text-emergency-600">
            <Navigation2 size={12} />
            {distanceKm} km
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-500">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {timeAgo(alert.createdAt)}
        </span>
        <a
          href={mapsLink(lat, lng)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-primary-600 hover:underline"
        >
          <MapPin size={12} /> View location on map
        </a>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          className="btn-primary flex-1"
          onClick={() => onAccept(alert._id)}
          disabled={accepting || disabled}
        >
          {accepting ? "Accepting..." : "Accept & Help"}
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
