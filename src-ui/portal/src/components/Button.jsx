// src/components/Button.jsx
export default function Button({
                                   children,
                                   className = '',
                                   type = 'button',
                                   disabled = false,
                                   ...props
                               }) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`btn-primary disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
