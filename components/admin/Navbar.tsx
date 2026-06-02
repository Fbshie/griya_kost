"use client" // Wajib karena kita pakai useState dan usePathname

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Daftar Menu Admin
  const adminLinks = [
    { name: 'Manajemen Kamar', href: '/admin-panel' },
    // { name: 'Kelola Kamar', href: '/admin-panel/rooms' },
    { name: 'Tagihan', href: '/admin-panel/tagihan' },
    { name: 'Laporan Keluhan', href: '/admin-panel/complaints' },
    { name: 'Manajemen Galeri', href: '/admin-panel/galeri' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-8 h-16 max-w-7xl mx-auto">
        
        {/* Bagian Kiri: Judul & Navigasi Desktop */}
        <div className="flex items-center gap-8">
          <h2 className="text-gray-900 font-black text-lg tracking-widest hidden sm:block">ADMIN PANEL</h2>
          
          {/* Navigasi Khusus Layar Komputer (Disembunyikan di HP) */}
          <nav className="hidden md:flex items-center gap-6">
            {adminLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors border-b-2 py-5 ${
                  pathname === link.href 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bagian Kanan: Profil & Tombol Hamburger */}
        <div className="flex items-center gap-4">
          <Link href={"/"} className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            Kembali ke Web Publik
          </Link>
          
          <div className="hidden sm:block border-l h-6 border-gray-300"></div>
          
          <UserButton/>

          {/* Tombol Hamburger Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu Dropdown Khusus Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
          {adminLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                pathname === link.href 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t my-2 pt-2">
            <Link
              href={"/"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            >
              Kembali ke Web Publik
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header