import { NavLink } from 'react-router-dom'
import { CalendarDaysIcon, QrCodeIcon, CubeIcon } from '@heroicons/react/24/outline'
import { CalendarDaysIcon as CalendarSolid, QrCodeIcon as QrSolid, CubeIcon as CubeSolid } from '@heroicons/react/24/solid'

const tabs = [
  { to: '/calendar', label: 'Calendario', Icon: CalendarDaysIcon, ActiveIcon: CalendarSolid },
  { to: '/scanner', label: 'Scanner', Icon: QrCodeIcon, ActiveIcon: QrSolid },
  { to: '/inventory', label: 'Magazzino', Icon: CubeIcon, ActiveIcon: CubeSolid },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav safe-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map(({ to, label, Icon, ActiveIcon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                isActive ? 'text-[var(--color-primary-light)]' : 'text-[var(--color-text-muted)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <ActiveIcon className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
