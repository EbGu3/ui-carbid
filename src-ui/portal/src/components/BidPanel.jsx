import Button from './Button.jsx'

export default function BidPanel({ montoActual = 400000, onBid, onConfirm, disabled }) {
    const incrementos = [1000, 5000, 10000]
    return (
        <div className="bg-brand-800 text-white rounded-3xl p-6 space-y-4">
            <div className="text-sm uppercase tracking-widest opacity-70">Monto actual</div>
            <div className="text-4xl font-extrabold">${montoActual.toLocaleString()}</div>
            <div className="grid grid-cols-3 gap-2">
                {incrementos.map((inc) => (
                    <Button
                        key={inc}
                        className="bg-white text-black"
                        onClick={() => onBid?.(montoActual + inc)}
                        disabled={disabled}
                    >
                        +${inc.toLocaleString()}
                    </Button>
                ))}
            </div>
            <Button className="w-full" onClick={() => onConfirm?.(montoActual)} disabled={disabled}>
                Ofertar
            </Button>
        </div>
    )
}
