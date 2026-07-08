export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-navy-100/60 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "navy" }) {
  const tones = {
    navy: "bg-navy-50 text-navy-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-sm",
    secondary: "bg-navy-700 hover:bg-navy-800 text-white shadow-sm",
    outline: "border-2 border-navy-200 text-navy-700 hover:border-teal-500 hover:text-teal-700",
    ghost: "text-navy-600 hover:bg-navy-50",
    amber: "bg-amber-400 hover:bg-amber-500 text-navy-900 shadow-sm",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold text-navy-800 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-navy-400 mt-1">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-sm ${className}`}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-sm ${className}`}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-sm ${className}`}
    >
      {children}
    </select>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`mb-8 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <div className="text-teal-600 font-bold text-xs uppercase tracking-wider mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900">{title}</h2>
      {subtitle && <p className="text-navy-500 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, tone = "navy" }) {
  const tones = {
    navy: "text-navy-800",
    teal: "text-teal-600",
    amber: "text-amber-500",
  };
  return (
    <Card className="p-5">
      <div className={`text-3xl font-extrabold ${tones[tone]}`}>{value}</div>
      <div className="text-navy-500 text-sm mt-1">{label}</div>
    </Card>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="text-center py-12 text-navy-400 text-sm border border-dashed border-navy-200 rounded-xl">
      {text}
    </div>
  );
}
