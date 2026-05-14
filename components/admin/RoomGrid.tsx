"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";
import OccupiedModal from "./OccupiedModal"; 
// Import 2 fungsi baru kita
import { setRoomMaintenance, setRoomAvailable } from "@/app/actions/manageRoomActions";

type Kamar = {
  id: string;
  room_number: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance';
  room_classes: {
    name: string;
    price: number;
  } | null; 
};

export default function RoomGrid({ rooms }: { rooms: Kamar[] }) {
  const [selectedRoom, setSelectedRoom] = useState<Kamar | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isOccupiedModalOpen, setIsOccupiedModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();

  // Handle klik kartu utama
  const handleRoomClick = async (room: Kamar) => {
    if (loadingAction) return;

    setSelectedRoom(room);
    
    if (room.status === 'available') {
      setIsBookingModalOpen(true);
    } else if (room.status === 'occupied') {
      setIsOccupiedModalOpen(true);
    } else if (room.status === 'maintenance') {
      // Jika kamar perbaikan diklik, tawarkan untuk mengubahnya jadi Kosong
      const confirm = window.confirm(`Kamar ${room.room_number} sudah selesai diperbaiki?\nUbah status kembali menjadi Kosong (Tersedia)?`);
      if (confirm) {
        setLoadingAction(true);
        await setRoomAvailable(room.id);
        alert("Sip! Kamar sekarang sudah bisa disewakan kembali.");
        setLoadingAction(false);
      }
    }
  };

  // Handle klik tombol obeng (Ubah ke Perbaikan)
  const handleSetMaintenance = async (e: React.MouseEvent, room: Kamar) => {
    e.stopPropagation(); // Mencegah modal booking ikut terbuka saat tombol obeng diklik
    
    const confirm = window.confirm(`Tandai Kamar ${room.room_number} sedang dalam perbaikan?`);
    if (confirm) {
      setLoadingAction(true);
      await setRoomMaintenance(room.id);
      setLoadingAction(false);
    }
  };

  return (
    <>
      {floors.map((floorNum) => (
        <div key={floorNum} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black text-gray-800 whitespace-nowrap">
              Lantai {floorNum}
            </h2>
            <div className="w-full h-[2px] bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {rooms.filter(r => r.floor === floorNum).map((kamar) => (
              <div 
                key={kamar.id} 
                onClick={() => handleRoomClick(kamar)}
                className={`bg-white border rounded-xl p-4 shadow-sm transition-all group cursor-pointer hover:shadow-md flex flex-col justify-between min-h-[100px] relative ${
                  kamar.status === 'available' ? 'hover:border-green-500' : 
                  kamar.status === 'occupied' ? 'hover:border-blue-500' : 
                  'bg-yellow-50 border-yellow-200 hover:border-yellow-400 opacity-90'
                } ${loadingAction ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-2xl font-black text-gray-800 group-hover:text-blue-600">
                      {kamar.room_number}
                    </span>
                    
                    {/* Badge Status dan Tombol Obeng */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                        kamar.status === 'available' ? 'bg-green-100 text-green-700 border-green-200' : 
                        kamar.status === 'occupied' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {kamar.status === 'available' ? 'Kosong' : kamar.status === 'occupied' ? 'Terisi' : 'Perbaikan'}
                      </span>

                      {/* Tombol Obeng Hanya Muncul Jika Kamar Kosong */}
                      {kamar.status === 'available' && (
                        <button
                          onClick={(e) => handleSetMaintenance(e, kamar)}
                          className="text-gray-400 hover:text-yellow-600 bg-gray-50 hover:bg-yellow-100 p-1 rounded transition-colors"
                          title="Ubah ke status Perbaikan"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    {kamar.room_classes?.name || 'Belum ada kelas'}
                  </p>
                </div>
                
                <p className="text-sm font-bold text-gray-700 mt-auto">
                  Rp {kamar.room_classes?.price?.toLocaleString('id-ID') || "0"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedRoom && (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          room={selectedRoom} 
        />
      )}

      {selectedRoom && (
        <OccupiedModal 
          isOpen={isOccupiedModalOpen} 
          onClose={() => setIsOccupiedModalOpen(false)} 
          room={selectedRoom} 
        />
      )}
    </>
  );
}