'use client'

// PERUBAHAN 1: Hapus SignedIn/SignedOut, ganti dengan Show
import { useUser, Show, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { checkUserActiveBooking } from '@/app/actions/manageRoomActions' 

const Navbar = () => {
    const { user } = useUser();
    // State untuk mengontrol buka/tutup menu di layar HP
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // State baru untuk mengecek apakah penyewa sudah punya kamar aktif
    const [hasActiveRoom, setHasActiveRoom] = useState(false);
    
    const isAdmin = user?.publicMetadata?.role === 'admin';

    // Mengecek status kamar saat user sudah login
    useEffect(() => {
        if (user?.id && !isAdmin) {
            checkUserActiveBooking(user.id).then((isBooked) => {
                setHasActiveRoom(isBooked);
            });
        }
    }, [user?.id, isAdmin]);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm transition-all">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                
                {/* Bagian Logo */}
                <div className="shrink-0">
                    <Link href={'/'}>
                        <Image width={140} height={45} src="/logo.png" alt="Logo Kost Griya Citra" className="w-auto h-10 object-contain" />
                    </Link>
                </div>

                {/* Navigasi Desktop (Disembunyikan di HP) */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-gray-600 hover:text-blue-600 font-semibold transition-colors" href={'/'}>Home</Link>

                    <Link className="text-gray-600 hover:text-blue-600 font-semibold transition-colors" href={'/#lokasi'}>Lokasi</Link>

                    {/* PERUBAHAN 2: Ganti SignedOut */}
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="rounded-full border-2 border-blue-600 px-6 py-2 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all">
                                Login
                            </button>
                        </SignInButton>
                    </Show>

                    {/* PERUBAHAN 3: Ganti SignedIn */}
                    <Show when="signed-in">
                        <Link className="text-gray-600 hover:text-blue-600 font-semibold transition-colors" href={'/rooms'}>Pesan Kamar</Link>
                        
                        {/* LINK DASHBOARD PENYEWA: Hanya muncul jika bukan admin DAN punya kamar */}
                        {hasActiveRoom && !isAdmin && (
                            <Link className="text-blue-600 hover:text-blue-800 font-bold transition-colors" href={'/dashboard'}>
                                Dashboard Saya
                            </Link>
                        )}

                        {isAdmin && (
                            <Link href="/admin-panel" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">
                                Admin Panel
                            </Link>
                        )}
                        <div className="ml-2 border-l pl-4 border-gray-300">
                            {/* DIPERBAIKI: Hapus afterSignOutUrl */}
                            <UserButton />
                        </div>
                    </Show>
                </nav>

                {/* Tombol Hamburger Menu (Hanya Muncul di HP) */}
                <div className="md:hidden flex items-center gap-4">
                    <Show when="signed-in">
                        {/* DIPERBAIKI: Hapus afterSignOutUrl */}
                        <UserButton />
                    </Show>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none rounded-lg bg-gray-50"
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

            {/* Dropdown Menu Mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t px-4 pt-4 pb-6 space-y-4 shadow-xl">
                    <Link href={'/'} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-gray-600 hover:text-blue-600 font-semibold py-2">
                        Home
                    </Link>

                    <Link href={'/#lokasi'} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-gray-600 hover:text-blue-600 font-semibold py-2">
                        Lokasi
                    </Link>

                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="w-full rounded-xl border-2 border-blue-600 px-4 py-3 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all mt-2">
                                Login untuk Melanjutkan
                            </button>
                        </SignInButton>
                    </Show>

                    <Show when="signed-in">
                        <Link href={'/rooms'} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-gray-600 hover:text-blue-600 font-semibold py-2">
                            Pesan Kamar
                        </Link>
                        
                        {/* LINK DASHBOARD PENYEWA UNTUK HP */}
                        {hasActiveRoom && !isAdmin && (
                            <Link href={'/dashboard'} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-blue-600 hover:text-blue-800 font-bold py-2">
                                Dashboard Saya
                            </Link>
                        )}

                        {isAdmin && (
                            <Link href="/admin-panel" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left text-gray-600 hover:text-blue-600 font-semibold py-2">
                                Admin Panel
                            </Link>
                        )}
                    </Show>
                </div>
            )}
        </header>
    )
}

export default Navbar