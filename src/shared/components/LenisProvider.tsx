import * as React from "react"

const DASHBOARD_PATH_PATTERN = /^\/(?:jobseeker|hrd|superadmin)(?:\/|$)/
const NAVIGATION_EVENT = "careermatch:navigation"

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
    let starting = false

    const shouldRunLenis = () =>
      !DASHBOARD_PATH_PATTERN.test(window.location.pathname)

    const stopLenis = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      lenis?.destroy()
      lenis = null
    }

    const startLenis = () => {
      if (starting || lenis || !shouldRunLenis()) {
        return
      }

      starting = true

      void import("lenis")
        .then(({ default: Lenis }) => {
          if (disposed || !shouldRunLenis()) {
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
        .finally(() => {
          starting = false
        })
    }

    const syncLenisWithRoute = () => {
      if (shouldRunLenis()) {
        startLenis()
      } else {
        stopLenis()
      }
    }

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    const pushState = function (
      this: History,
      ...args: Parameters<History["pushState"]>
    ) {
      const result = originalPushState.apply(this, args)
      window.dispatchEvent(new Event(NAVIGATION_EVENT))

      return result
    }
    const replaceState = function (
      this: History,
      ...args: Parameters<History["replaceState"]>
    ) {
      const result = originalReplaceState.apply(this, args)
      window.dispatchEvent(new Event(NAVIGATION_EVENT))

      return result
    }

    window.history.pushState = pushState
    window.history.replaceState = replaceState
    window.addEventListener("popstate", syncLenisWithRoute)
    window.addEventListener(NAVIGATION_EVENT, syncLenisWithRoute)

    syncLenisWithRoute()

    return () => {
      disposed = true
      stopLenis()
      window.removeEventListener("popstate", syncLenisWithRoute)
      window.removeEventListener(NAVIGATION_EVENT, syncLenisWithRoute)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  return children
}
