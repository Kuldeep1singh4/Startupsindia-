/**
 * Application Security Controls:
 * - Disables right-click context menu across the app
 * - Blocks developer/debugging keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
 * - Disables unauthorized drag-and-drop of assets
 */
export function initSecurityGuards() {
  if (typeof window === "undefined") return

  // 1. Disable Right-Click Context Menu
  window.addEventListener(
    "contextmenu",
    (e) => {
      e.preventDefault()
      return false
    },
    { capture: true }
  )

  // 2. Block Developer / Inspection Shortcuts
  window.addEventListener(
    "keydown",
    (e) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey

      // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect), Ctrl+Shift+K (Console)
      if (isCtrlOrMeta && e.shiftKey) {
        const key = e.key.toUpperCase()
        if (key === "I" || key === "J" || key === "C" || key === "K") {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }

      // Ctrl+U / Cmd+U (View Source)
      if (isCtrlOrMeta && (e.key === "u" || e.key === "U")) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Ctrl+S / Cmd+S (Save Page)
      if (isCtrlOrMeta && (e.key === "s" || e.key === "S")) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    },
    { capture: true }
  )

  // 3. Prevent unauthorized image dragging
  window.addEventListener(
    "dragstart",
    (e) => {
      const target = e.target as HTMLElement
      if (target && target.tagName === "IMG") {
        e.preventDefault()
      }
    },
    { capture: true }
  )
}
