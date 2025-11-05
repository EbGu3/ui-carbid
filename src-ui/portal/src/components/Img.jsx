import { useEffect, useMemo, useState } from 'react'

export default function Img({ src, alt = '', className = '', fallbackClass = '' }) {
  const sources = useMemo(() => {
    if (!src) return []
    if (Array.isArray(src)) return src.filter(Boolean)
    return [src].filter(Boolean)
  }, [src])

  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => { setIdx(0); setFailed(false) }, [sources])

  if (!sources.length || failed) {
    return (
        <div className={`bg-brand-200 text-brand-600 flex items-center justify-center ${fallbackClass || className}`}>
          <span className="text-sm">imagen no disponible</span>
        </div>
    )
  }

  const onError = () => { if (idx < sources.length - 1) setIdx(i => i + 1); else setFailed(true) }

  return <img src={sources[idx]} alt={alt} className={className} onError={onError} loading="lazy" />
}
