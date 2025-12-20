'use client'

import { useUser, ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import NavItems from './NavItems'

const Navbar = () => {
    const { user, isLoaded } = useUser();

    const isAdmin = user?.publicMetadata?.role === 'admin';

    return (
        <>
            <header>
                <div className="flex items-center justify-between px-2 py-5 ">

                    <div className="mx-7">
                        <Link href={'/'}>
                            <Image width={150} height={150} src="/logo.png" alt="" />
                        </Link>
                    </div>

                    <div className='mr-10 flex items-center'>
                        <Link className="mr-3 text-primary font-semibold" href={'https://maps.app.goo.gl/mjGEiuxtC7jp6Hz79'}>Lokasi</Link>
                        
                            {/* <NavItems /> */}
                            <SignedOut>
                                <SignInButton>
                                    <button className="rounded-xl border-4 p-2 gap-4 border-primary text-primary" >Login</button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link className='mr-3 text-primary font-semibold' href={'/PemesananKamar'}>Pesan Kamar</Link>

                                {/* Menu KHUSUS ADMIN */}
                                {isAdmin && (
                                    <Link
                                        href="/admin-panel"
                                        className="mr-4 text-primary font-semibold"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <UserButton />

                            </SignedIn>
                        
                    </div>
                </div>
            </header>
        </>
    )
}

export default Navbar