"use client";

import Link from "next/link";
import { useState, useRef } from "react";

export default function HomePage() {

  // === LOGIKA DRAG-TO-SCROLL (MOUSE GESER) ===
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    if (!sliderRef.current) return;
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Angka 2 adalah kecepatan geser
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Data Galeri Foto Kost
  const galeriKost = [
    {
      src: "/depan.jpeg",
      judul: "Tampak Depan Kost",
      deskripsi: "Bangunan modern dengan desain minimalis dan sirkulasi udara yang sangat baik untuk kenyamanan penghuni."
    },
    {
      src: "/parkir.jpeg",
      judul: "Area Parkir Kendaraan",
      deskripsi: "Parkiran luas yang muat untuk banyak motor dan mobil, diawasi CCTV 24 jam penuh."
    },
    {
      src: "/lorong.jpeg",
      judul: "Lorong Kamar",
      deskripsi: "Lorong yang bersih, tenang, dan terang dengan pencahayaan maksimal di siang maupun malam hari."
    },
    {
      src: "/dapur.jpeg",
      judul: "Dapur Bersama",
      deskripsi: "Fasilitas dapur kompor gas dan wastafel cuci piring yang bisa digunakan bersama dengan rapi."
    },
    {
      src: "/jemuran.jpeg",
      judul: "Area Jemuran",
      deskripsi: "Tempat menjemur pakaian yang luas dan tertutup kanopi transparan agar aman dari hujan."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-blue-50/50 pt-20 pb-28 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Kamar Tersedia Bulan Ini!
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
            Kenyamanan Maksimal, <br className="hidden md:block" />
            <span className="text-blue-600">Seperti di Rumah Sendiri.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kost Griya Citra menawarkan hunian eksklusif dengan fasilitas lengkap, keamanan 24 jam, dan lokasi yang strategis di Pontianak. Pesan kamar Anda sekarang dengan sistem pintar kami.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/rooms" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all">
              Lihat Kamar Tersedia
            </Link>
            <Link href="#fasilitas" className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
              Eksplor Fasilitas
            </Link>
          </div>
        </div>
      </section>

      {/* 2. GALERI KOST (Menggantikan Keunggulan) */}
      <section id="galeri" className="py-12 bg-white border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Lihat Lebih Dekat</h2>
              <p className="text-gray-500 max-w-2xl">
                Jelajahi setiap sudut Kost Griya Citra. Kami memastikan kebersihan dan kenyamanan area bersama selalu terjaga.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              Geser untuk melihat
            </div>
          </div>

          {/* Container Galeri Geser */}
          <div 
          ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth 
                          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {galeriKost.map((item, index) => (
              <div key={index} className="snap-center shrink-0 w-[80vw] md:w-[350px] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col pointer-events-none select-none">
                {/* Area Gambar */}
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.src} 
                    alt={item.judul} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback jika gambar belum ada di folder public
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x400/e2e8f0/64748b?text=Foto+${index + 1}`;
                    }}
                  />
                </div>
                
                {/* Area Teks (Judul & Deskripsi) */}
                <div className="p-6 flex-1 flex flex-col bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.judul}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
            ))}
            
          </div>
          
          {/* Instruksi Geser untuk HP */}
          <div className="flex justify-center md:hidden mt-2 text-gray-400 text-sm items-center gap-2">
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            Geser foto ke samping
          </div>

        </div>
      </section>
      

      {/* 3. FASILITAS KAMAR & KELAS */}
      <section id="fasilitas" className="py-10 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Pilihan Kelas Kamar</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Pilih fasilitas yang paling sesuai dengan kebutuhan dan anggaran Anda. Semua kamar didesain untuk kenyamanan istirahat maksimal.
            </p>
          </div>

          {/* Grid Cards - 1 kolom di HP, 3 kolom di Layar Besar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* KARTU 1: KELAS KETIGA (Paling Murah ditaruh kiri biasanya) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kelas Ketiga</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">Rp 700<span className="text-2xl">.000</span></span>
                  <span className="text-gray-500 font-medium">/bln</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Kipas Angin",
                  "Kamar Mandi Dalam",
                  "Kasur & Lemari Pakaian",
                  "Air PDAM & Wi-Fi Gratis",
                  "Listrik Gratis"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/rooms" className="w-full block text-center py-4 rounded-xl font-bold border-2 border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors">
                Pesan Sekarang
              </Link>
            </div>

            {/* KARTU 2: KELAS PERTAMA (Paling Direkomendasikan ditaruh tengah) */}
            <div className="bg-blue-600 border border-blue-600 rounded-3xl p-8 shadow-2xl shadow-blue-200 transform md:-translate-y-4 flex flex-col relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-orange-400 to-yellow-400 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-lg">
                Terpopuler
              </div>
              
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-blue-100 mb-2">Kelas Pertama</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-white">Rp 1.100<span className="text-2xl">.000</span></span>
                  <span className="text-blue-200 font-medium">/bln</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "AC (Pendingin Ruangan)",
                  "Kamar Mandi Dalam",
                  "Kasur & Lemari Pakaian",
                  "Air PDAM & Wi-Fi Gratis",
                  "Listrik dibiayai sendiri"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-blue-50">
                    <svg className="w-6 h-6 text-blue-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/rooms" className="w-full block text-center py-4 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-colors">
                Pesan Sekarang
              </Link>
            </div>

            {/* KARTU 3: KELAS KEDUA */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kelas Kedua</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">Rp 850<span className="text-2xl">.000</span></span>
                  <span className="text-gray-500 font-medium">/bln</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Kipas Angin",
                  "Kamar Mandi Dalam",
                  "Kasur & Lemari Pakaian",
                  "Air PDAM & Wi-Fi Gratis",
                  "Listrik dibiayai sendiri"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/rooms" className="w-full block text-center py-4 rounded-xl font-bold border-2 border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors">
                Pesan Sekarang
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CTA AKHIR */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Siap Untuk Pindah ke Kamar Baru Anda?</h2>
          <p className="text-xl text-gray-500 mb-10">Cek ketersediaan kamar hari ini dan amankan tempat Anda sebelum kehabisan.</p>
          <Link href="/rooms" className="inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black shadow-2xl hover:shadow-black/50 hover:-translate-y-1 transition-all text-lg">
            Pesan Kamar Sekarang
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
        </div>
      </section>

    </div>
  );
}