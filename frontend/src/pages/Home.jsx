import { Link } from "react-router-dom";
import {
  Siren,
  HeartHandshake,
  Hospital,
  Users,
  Radar,
  Eye,
  MapPin,
  Mail,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: Siren,
    title: "Press the SOS button",
    text: "One press sends your live location and a message to your emergency contacts instantly.",
  },
  {
    icon: Hospital,
    title: "See nearby hospitals",
    text: "Instantly view nearby hospitals with real-time bed availability and facilities like ICU, trauma care and blood banks.",
  },
  {
    icon: Radar,
    title: "Nearby volunteers are alerted",
    text: "Available volunteers near you are notified with your location and situation, so help can arrive fast.",
  },
  {
    icon: Users,
    title: "Search radius grows automatically",
    text: "If no one responds, the alert automatically reaches volunteers in a wider area until someone accepts.",
  },
];

const features = [
  {
    icon: Siren,
    title: "One-tap SOS",
    text: "A single, hold-to-confirm button shares your live location and an alert message with your family.",
  },
  {
    icon: Eye,
    title: "Report for someone else",
    text: "Witnessed an accident? Raise an alert on the victim's behalf with a description and location.",
  },
  {
    icon: Hospital,
    title: "Live hospital availability",
    text: "Hospitals keep their bed counts and facilities updated so you always see accurate information.",
  },
  {
    icon: HeartHandshake,
    title: "Become a volunteer",
    text: "Opt in as a volunteer to get notified about emergencies near you and help when it matters most.",
  },
];

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <span className="badge bg-emergency-100 text-emergency-700">
              <Siren size={13} /> Every second counts
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
              Get help to an accident{" "}
              <span className="text-emergency-600">in seconds</span>, not minutes.
            </h1>
            <p className="mt-4 text-lg text-ink-500">
              RapidAid instantly alerts your family with your live location, shows nearby hospitals with
              real bed availability, and connects you with nearby volunteers ready to help.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="btn-danger px-6 py-3 text-base">
                <Siren size={18} /> Get the App / Sign Up
              </Link>
              <Link to="/login" className="btn-outline px-6 py-3 text-base">
                I already have an account
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-ink-500">
              <Hospital size={16} className="text-primary-600" />
              Run a hospital?{" "}
              <Link to="/hospital/register" className="font-semibold text-primary-700 hover:underline">
                Register your hospital
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm animate-fade-up">
            <div className="card flex flex-col items-center gap-4 p-8">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emergency-400/25 animate-ping-slow" />
                <span
                  className="absolute inset-0 rounded-full bg-emergency-400/15 animate-ping-slow"
                  style={{ animationDelay: "0.9s" }}
                />
                <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-emergency-600 text-white shadow-xl">
                  <Siren size={30} />
                  <span className="mt-1 font-display text-lg font-extrabold">SOS</span>
                </div>
              </div>
              <p className="text-center text-sm text-ink-500">
                Hold the SOS button to instantly notify your family and nearby volunteers with your live
                location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900">How RapidAid works</h2>
          <p className="mt-2 text-ink-500">From a single button press to real help arriving - here's the flow.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <Icon size={20} />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary-600">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold text-ink-800">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{s.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-ink-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold">Built for real emergencies</h2>
            <p className="mt-2 text-ink-300">Three roles, one platform - victims, volunteers and hospitals working together.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emergency-600/20 text-emergency-400">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-300">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <MapPin className="text-primary-600" size={32} />
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Get set up before you ever need it
          </h2>
          <p className="max-w-xl text-ink-500">
            Add your emergency contacts now, so that if anything happens, help is one button press away.
          </p>
          <Link to="/register" className="btn-danger px-6 py-3 text-base">
            Create your free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 py-8 text-center text-sm text-ink-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4">
          <span className="flex items-center gap-2 font-display font-bold text-ink-700">
            <Siren size={16} className="text-emergency-600" /> RapidAid
          </span>
          <p>Accident SOS &amp; Emergency Response Platform - a MERN stack project.</p>
          <p className="flex items-center gap-1.5">
            <Mail size={13} /> support@rapidaid.example
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
