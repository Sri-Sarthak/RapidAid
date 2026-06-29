import { MapPin, BedDouble, Phone, Stethoscope } from "lucide-react";

const availabilityBadge = (available, total) => {
  if (total === 0) return { label: "No data", className: "bg-ink-100 text-ink-500" };
  if (available <= 0) return { label: "Full", className: "bg-emergency-100 text-emergency-700" };
  const ratio = available / total;
  if (ratio < 0.15) return { label: "Limited beds", className: "bg-amber-100 text-amber-700" };
  return { label: "Beds available", className: "bg-primary-100 text-primary-700" };
};

const HospitalCard = ({ hospital }) => {
  const { name, address, distanceKm, availableBeds, totalBeds, facilities = [], phone } = hospital;
  const badge = availabilityBadge(availableBeds, totalBeds);

  return (
    <div className="card animate-fade-up p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-800">{name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
            <MapPin size={13} className="shrink-0" />
            {address}
            {typeof distanceKm === "number" && (
              <span className="ml-1 font-medium text-primary-600">• {distanceKm} km away</span>
            )}
          </p>
        </div>
        <span className={`badge shrink-0 ${badge.className}`}>{badge.label}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-600">
        <span className="flex items-center gap-1.5">
          <BedDouble size={16} className="text-primary-600" />
          <span className="font-semibold text-ink-800">{availableBeds}</span> / {totalBeds} beds free
        </span>
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-primary-600 hover:underline">
            <Phone size={14} />
            {phone}
          </a>
        )}
      </div>

      {facilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {facilities.slice(0, 6).map((f) => (
            <span key={f} className="badge bg-ink-50 text-ink-600">
              <Stethoscope size={11} />
              {f}
            </span>
          ))}
          {facilities.length > 6 && (
            <span className="badge bg-ink-50 text-ink-500">+{facilities.length - 6} more</span>
          )}
        </div>
      )}
    </div>
  );
};

export default HospitalCard;
