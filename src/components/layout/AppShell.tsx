import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from '../dashboard/Sidebar'
import { TopBar } from '../dashboard/TopBar'

export function AppShell({ title, crumb, children }: { title: string; crumb?: string; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const mainRegion = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => { if (mainRegion.current) mainRegion.current.inert = menuOpen }, [menuOpen])
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const closeMenu = () => {
    if (mainRegion.current) mainRegion.current.inert = false
    setMenuOpen(false)
    menuButton.current?.focus()
  }

  const navigateMenu = () => {
    if (mainRegion.current) mainRegion.current.inert = false
    setMenuOpen(false)
    requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector<HTMLElement>('.top h1')?.focus()))
  }

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={closeMenu} onNavigate={navigateMenu} />
      <div className="main" ref={mainRegion}>
        <TopBar title={title} crumb={crumb} onOpenMenu={() => setMenuOpen(true)} menuButtonRef={menuButton} />
        {children}
      </div>
    </div>
  )
}
