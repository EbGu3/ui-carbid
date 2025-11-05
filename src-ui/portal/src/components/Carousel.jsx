import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Img from './Img.jsx'
import { HERO } from '../data/images.js'

const slides = [
    { id: 1, titulo: 'Mustang GT', texto: 'Adrenalina en cada puja', fuentes: HERO[0] },
    { id: 2, titulo: 'Dodge Charger', texto: 'Clásicos y modernos', fuentes: HERO[1] },
    { id: 3, titulo: 'Honda Civic', texto: 'Tu próximo proyecto', fuentes: HERO[2] }
]

export default function Carousel({ height=520 }){
    const [index,setIndex]=useState(0)
    useEffect(()=>{ const t=setInterval(()=>setIndex(i=>(i+1)%slides.length),5000); return ()=>clearInterval(t)},[])
    return (
        <div className="relative w-full overflow-hidden rounded-3xl" style={{height}}>
            <AnimatePresence initial={false}>
                <motion.div key={slides[index].id} initial={{opacity:0,scale:1.02}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.8}} className="absolute inset-0">
                    <Img src={slides[index].fuentes} alt={slides[index].titulo} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-white">
                        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow">{slides[index].titulo}</h2>
                        <p className="mt-2 text-white/90">{slides[index].texto}</p>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((s,i)=>(
                    <button key={s.id} onClick={()=>setIndex(i)} className={`w-3 h-3 rounded-full ${i===index?'bg-white':'bg-white/50'}`} aria-label={`Ir al slide ${i+1}`} />
                ))}
            </div>
        </div>
    )
}
