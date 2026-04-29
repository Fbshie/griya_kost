"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PublicRoomGrid({ rooms }: { rooms: any[] }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();

  const handleBooking = (room: any) => {
    if (room.status !== 'available') return;

    if (!isSignedIn) {
      // Jika belum login, arahkan ke login dulu
      router.push("/sign-in");
    } else {
      // Jika sudah login, arahkan ke halaman konfirmasi booking
      router.push(`/rooms/book/${room.id}`);
    }
  };

  return (
    <div className="space-y-12">
      {floors.map((floor) => (
        <section key={floor}>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-gray-800">Lantai {floor}</h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {rooms.filter(r => r.floor === floor).map((kamar) => (
              <div 
                key={kamar.id}
                onClick={() => handleBooking(kamar)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                  kamar.status === 'available' 
                  ? 'bg-white border-transparent hover:border-blue-500 hover:shadow-lg' 
                  : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-black text-gray-800">{kamar.room_number}</span>
                  {kamar.status === 'available' ? (
                    <span className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Terisi</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Harga per bulan:</p>
                <p className="font-bold text-gray-900">Rp {kamar.price_per_month.toLocaleString('id-ID')}</p>
                
                {kamar.status === 'available' && (
                  <button className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors">
                    Pesan Sekarang
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}