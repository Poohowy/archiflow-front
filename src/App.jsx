import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Schedule from './pages/Schedule'
import './index.css'

const views = {
  dashboard: 'dashboard',
  projects: 'projects',
  schedule: 'schedule',
}

function getViewFromHash(hash) {
  const normalizedHash = hash.toLowerCase()

  if (normalizedHash.startsWith('#/projekty') || normalizedHash.startsWith('#/projects')) {
    return views.projects
  }

  if (normalizedHash.startsWith('#/harmonogram') || normalizedHash.startsWith('#/schedule')) {
    return views.schedule
  }

  if (normalizedHash.startsWith('#/dashboard')) {
    return views.dashboard
  }

  return views.dashboard
}

function getHashForView(view) {
  if (view === views.projects) {
    return '#/projekty'
  }

  if (view === views.schedule) {
    return '#/harmonogram'
  }

  return '#/dashboard'
}

function App() {
  const [activeView, setActiveView] = useState(() => getViewFromHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(getViewFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = getHashForView(views.dashboard)
    }
  }, [])

  function handleNavigate(view) {
    const nextHash = getHashForView(view)

    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
      return
    }

    setActiveView(view)
  }

  return (
    <div className="app">
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />

      <main className="main-content">
        {activeView === views.dashboard && <Dashboard />}
        {activeView === views.projects && <Projects />}
        {activeView === views.schedule && <Schedule />}
      </main>
    </div>
  )
}

export default App