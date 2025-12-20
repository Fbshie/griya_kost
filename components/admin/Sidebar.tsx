"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut, Home } from 'lucide-react'

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin-panel",
    icon: LayoutDashboard
  },
  {
    title: "Penyewa Lantai 1",
    href: "/admin-panel/users1",
    icon: Users
  },
  {
    title: "Penyewa Lantai 2",
    href: "/admin-panel/users2",
    icon: Users
  },
  {
    title: "Kamar",
    href: "/admin-panel/kamar",
    icon: Home
  }
]

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-wider">ADMIN<span className="text-primary">PANEL</span></h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-white shadow-lg" // Style Aktif
                  : "text-slate-400 hover:bg-slate-800 hover:text-white" // Style Tidak Aktif
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Sidebar (Optional) */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">©2026 Kost Griya Citra</p>
      </div>
    </aside>
  )
}

export default Sidebar