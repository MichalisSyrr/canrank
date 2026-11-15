import { useEffect } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { DataProvider } from './lib/data'
import AddDrinkPage from './pages/AddDrinkPage'
import ComparePage from './pages/ComparePage'
import DrinkPage from './pages/DrinkPage'
import DrinksPage from './pages/DrinksPage'
import FriendsPage from './pages/FriendsPage'
import MinePage from './pages/MinePage'

const TABS = [
  ['/', 'Drinks', 'M7 3h10l1 4v12l-1 2H7l-1-2V7z'],
  ['/me', 'Mine', 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.400l6-.8z'],
  ['/friends', 'Friends', 'M8 11a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7zm8.500 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1.500 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6zm15 0c0-1.800-.6-3.400-1.600-4.600 3.500-.6 7.600 1.200 7.600 4.600z'],
  ['/compare', 'Compare', 'M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z'],
] as const

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <DataProvider>
        <ScrollReset />
        <main className="page">
          <Routes>
            <Route path="/" element={<DrinksPage />} />
            <Route path="/drink/:id" element={<DrinkPage />} />
            <Route path="/add" element={<AddDrinkPage />} />
            <Route path="/me" element={<MinePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="*" element={<DrinksPage />} />
          </Routes>
        </main>
        <nav className="tabbar" aria-label="Main">
          {TABS.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={icon} fill="currentColor" /></svg>
              {label}
            </NavLink>
          ))}
        </nav>
      </DataProvider>
    </HashRouter>
  )
}
