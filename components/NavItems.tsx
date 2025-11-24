'use client'
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React from 'react'



    const navItems = [
    { label: 'Pesan Kamar', href: '/' },
    { label: 'Kamar Saya', href: '/' },
]

    const NavItems = () => {
    const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4">
        {navItems.map(({ label, href}) => (
            <Link 
            href={href} 
            key={label} 
            className={cn(pathname === href && 'text-primary font-semibold')}>
                {label}
            </Link>
        ))}
    </nav>
  )
}

export default NavItems