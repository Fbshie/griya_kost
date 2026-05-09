import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                
                {/* Grid Responsif: 1 kolom di HP, 3 kolom di Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                    
                    {/* Kolom 1: Logo & Tagline */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link href={'/'} className="inline-block mb-6">
                            <Image width={160} height={50} src="/logo.png" alt="Kost Griya Citra" className="w-auto h-12 object-contain" />
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Manajemen hunian kos modern. Memberikan kenyamanan, keamanan, dan kemudahan transaksi dalam satu genggaman.
                        </p>
                    </div>

                    {/* Kolom 2: Kontak & Sosial Media */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-sm font-black text-gray-900 tracking-widest mb-6 uppercase">Hubungi Kami</h3>
                        <div className="space-y-4">
                            <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-all group">
                                <div className="p-2.5 bg-white shadow-sm border rounded-full group-hover:border-blue-300 transition-colors">
                                    <Image width={20} height={20} src="/footer/footer1.png" alt="Instagram" className="w-5 h-5 object-contain" />
                                </div>
                                <span className="font-medium">@kostgriyacitra</span>
                            </a>
                            <a href="https://wa.me/628" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-all group">
                                <div className="p-2.5 bg-white shadow-sm border rounded-full group-hover:border-green-300 transition-colors">
                                    <Image width={20} height={20} src="/footer/footer2.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                                </div>
                                <span className="font-medium">+62 812-3456-XXXX</span>
                            </a>
                        </div>
                    </div>

                    {/* Kolom 3: Pintasan / Quick Links */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-sm font-black text-gray-900 tracking-widest mb-6 uppercase">Pintasan Layanan</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/rooms" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2">
                                    <span className="text-blue-500 text-lg">▹</span> Cek Ketersediaan Kamar
                                </Link>
                            </li>
                            <li>
                                <Link href="/lapor" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2">
                                    <span className="text-blue-500 text-lg">▹</span> Laporkan Keluhan
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Garis Bawah & Hak Cipta */}
                <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm font-medium text-center md:text-left">
                        © {new Date().getFullYear()} Kost Griya Citra. Seluruh hak cipta dilindungi.
                    </p>
                    <p className="text-gray-400 text-xs tracking-wide">
                        Sistem Informasi Manajemen Kos
                    </p>
                </div>

            </div>
        </footer>
    );
}