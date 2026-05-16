import * as React from "react"

export function LenisProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    let animationFrame = 0
    let lenis: { destroy: () => void; raf: (time: number) => void } | null =
      null
    let disposed = false

    void import("lenis").then(({ default: Lenis }) => {
      if (disposed) {
        return
      }

      lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: false,
      })

      const raf = (time: number) => {
        lenis?.raf(time)
        animationFrame = window.requestAnimationFrame(raf)
      }

      animationFrame = window.requestAnimationFrame(raf)
    })

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      lenis?.destroy()
    }
  }, [])

  return children
}
