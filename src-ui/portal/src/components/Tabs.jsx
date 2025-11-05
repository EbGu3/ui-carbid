export default function Tabs({ items = [], value, onChange }) {
    return (
        <div role="tablist" aria-label="Secciones" className="flex items-center gap-2 bg-brand-200 rounded-full p-1">
            {items.map((i) => (
                <button
                    key={i.value}
                    role="tab"
                    aria-selected={value === i.value}
                    onClick={() => onChange(i.value)}
                    type="button"
                    className={`px-4 py-1.5 rounded-full text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 ${
                        value === i.value ? 'bg-white shadow-soft' : 'text-brand-700'
                    }`}
                >
                    {i.label}
                </button>
            ))}
        </div>
    )
}
