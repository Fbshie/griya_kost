import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-8">
      {/* Kiri: Breadcrumb atau Judul Halaman (Bisa dibuat dinamis nanti) */}
      <div>
        <h2 className="text-gray-500 text-sm">Welcome back, Admin</h2>
      </div>

      {/* Kanan: User Profile */}
      <div className="flex items-center gap-4">
        
          <p className="text-md font-semibold text-primary">Super Admin</p>
          <Link href={"/"} className="text-md font-semibold text-primary">Home</Link>
        
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}

export default Header