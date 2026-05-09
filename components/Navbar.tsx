'use client'

import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

const Navbar = () => {
    const { user } = useUser();
    // State untuk mengontrol buka/tutup menu di layar HP
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const isAdmin = user?.publicMetadata?.role === 'admin';

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm transition-all">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                
                {/* Bagian Logo */}
                <div className="shrink-0">
                    <Link href={'/'}>
                        {/* Sesuaikan ukuran logo agar proporsional */}
                        <Image width={140} height={45} src="/logo.png" alt="Logo Kost Griya Citra" className="w-auto h-10 object-contain" />
                    </Link>
                </div>

                {/* Navigasi Desktop (Disembunyikan di HP) */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-gray-600 hover:text-blue-600 font-semibold transition-colors" href={'/#lokasi'}>Lokasi</Link>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="rounded-full border-2 border-blue-600 px-6 py-2 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all">
                                Login
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <Link className="text-gray-600 hover:text-blue-600 font-semibold transition-colors" href={'/rooms'}>Pesan Kamar</Link>
                        {isAdmin && (
                            <Link href="/admin-panel" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">
                                Admin Panel
                            </Link>
                        )}
                        <div className="ml-2 border-l pl-4 border-gray-300">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                </nav>

                {/* Tombol Hamburger Menu (Hanya Muncul di HP) */}
                <div className="md:hidden flex items-center gap-4">
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none rounded-lg bg-gray-50"
                    >
                        {/* Icon Hamburger / Close menggunakan SVG murni */}
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

            {/* Dropdown Menu Mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t px-4 pt-4 pb-6 space-y-4 shadow-xl">
                    <Link href={'/#lokasi'} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-gray-600 hover:text-blue-600 font-semibold py-2">
                        Lokasi
                    </Link>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="w-full rounded-xl border-2 border-blue-600 px-4 py-3 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all mt-2">
                                Login untuk Melanjutkan
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <Link href={'/rooms'} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-gray-600 hover:text-blue-600 font-semibold py-2">
                            Pesan Kamar
                        </Link>
                        {isAdmin && (
                            <Link href="/admin-panel" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-gray-600 hover:text-blue-600 font-semibold py-2">
                                Admin Panel
                            </Link>
                        )}
                    </SignedIn>
                </div>
            )}
        </header>
    )
}

export default Navbar