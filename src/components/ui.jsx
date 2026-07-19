export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-forest-100/60 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "forest" }) {
  const tones = {
    forest: "bg-forest-50 text-forest-700",
    gold: "bg-gold-50 text-gold-700",
    terracotta: "bg-terracotta-50 text-terracotta-700",
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
    primary: "bg-gold-500 hover:bg-gold-600 text-forest-900 shadow-sm",
    secondary: "bg-forest-700 hover:bg-forest-800 text-white shadow-sm",
    outline: "border-2 border-forest-200 text-forest-700 hover:border-gold-500 hover:text-gold-700",
    ghost: "text-forest-600 hover:bg-forest-50",
    terracotta: "bg-terracotta-400 hover:bg-terracotta-500 text-forest-900 shadow-sm",
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
      <span className="block text-sm font-semibold text-forest-800 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-forest-400 mt-1">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-forest-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-sm ${className}`}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-forest-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-sm ${className}`}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-forest-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-sm ${className}`}
    >
      {children}
    </select>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`mb-8 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <div className="text-gold-600 font-bold text-xs uppercase tracking-wider mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-extrabold text-forest-900">{title}</h2>
      {subtitle && <p className="text-forest-500 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, tone = "forest" }) {
  const tones = {
    forest: "text-forest-800",
    gold: "text-gold-600",
    terracotta: "text-terracotta-500",
  };
  return (
    <Card className="p-5">
      <div className={`text-3xl font-extrabold ${tones[tone]}`}>{value}</div>
      <div className="text-forest-500 text-sm mt-1">{label}</div>
    </Card>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="text-center py-12 text-forest-400 text-sm border border-dashed border-forest-200 rounded-xl">
      {text}
    </div>
  );
}
