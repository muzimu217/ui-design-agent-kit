import { useRef } from 'react'
import { useApp } from '../store'

/** Transparent surface over the 3D model that converts horizontal drags into rotation. */
export function DragZone({ className = '' }: { className?: string }) {
  const { modelDrag } = useApp()
  const lastX = useRef<number | null>(null)

  return (
    <div
      aria-hidden
      className={`drag-zone ${className}`}
      onPointerDown={(e) => {
        lastX.current = e.clientX
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (lastX.current !== null) {
          modelDrag.current += (e.clientX - lastX.current) * 0.006
          lastX.current = e.clientX
        }
      }}
      onPointerUp={() => {
        lastX.current = null
      }}
      onPointerCancel={() => {
        lastX.current = null
      }}
    />
  )
}
