import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Ensures that every page navigation resets scroll position to the top.
 * Handles both the window/document scroll and internal scroll containers (dashboards).
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // 1. Reset standard browser window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    })

    // 2. Reset document root elements
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0

    // 3. Reset internal dashboard scroll containers
    const scrollContainers = document.querySelectorAll<HTMLElement>(
      '[data-scroll-container], main, .overflow-y-auto'
    )
    scrollContainers.forEach((container) => {
      container.scrollTop = 0
    })
  }, [pathname, search])

  return null
}
