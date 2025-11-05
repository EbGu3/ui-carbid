export default function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full px-4 py-2.5 bg-transparent border-b border-white/60 text-white placeholder-white/60 focus:outline-none focus:border-white ${className}`}
            {...props}
        />
    )
}
