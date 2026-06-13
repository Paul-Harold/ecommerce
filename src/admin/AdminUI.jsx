/**
 * Shared presentational building blocks for the admin panel.
 * Centralises the long Tailwind class strings that were previously
 * copy-pasted into every tab.
 */

// Reusable input styling so every field looks identical without repeating classes.
export const adminInputClass =
  'w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-electric transition-colors text-xs lg:text-sm';

/** Success / error banner shown at the top of each tab. */
export function AdminMessage({ message }) {
  if (!message || !message.text) return null;
  const isSuccess = message.type === 'success';
  return (
    <div
      role="status"
      className={`mb-4 lg:mb-6 px-4 py-3 lg:px-6 lg:py-4 rounded font-bold uppercase tracking-widest text-xs lg:text-sm flex items-center gap-3 border ${
        isSuccess
          ? 'bg-green-500/10 text-green-500 border-green-500/30'
          : 'bg-red-500/10 text-red-500 border-red-500/30'
      }`}
    >
      {message.text}
    </div>
  );
}

/** Page-level heading with an optional right-aligned action slot. */
export function PageHeading({ title, action }) {
  return (
    <div className="flex justify-between items-center gap-3 mb-6 lg:mb-8 border-b border-gray-800 pb-4">
      <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">{title}</h1>
      {action}
    </div>
  );
}

/** Secondary heading used above lists/sections. */
export function ListHeading({ children }) {
  return (
    <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest mb-4 lg:mb-6 border-b border-gray-800 pb-2 text-gray-400">
      {children}
    </h2>
  );
}

/** Card surface used for forms and panels. */
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0f1115] border border-gray-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

/** Labelled field wrapper. */
export function Field({ label, children, htmlFor }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
