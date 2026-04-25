"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";

type Kamar = {
  id: string;
  room_number: string;
  floor: number;
  price_per_month: number;
  status: 'available' | 'occupied' | 'maintenance';
};

export default function RoomGrid({ rooms }: { rooms: Kamar[] }) {
  const [selectedRoom, setSelectedRoom] = useState<Kamar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter lantai secara otomatis
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();

  const handleRoomClick = (room: Kamar) => {
    if (room.status === 'available') {
      setSelectedRoom(room);
      setIsModalOpen(true);
    } else {
      alert("Kamar ini sudah terisi atau dalam perbaikan.");
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
                className={`bg-white border rounded-xl p-4 shadow-sm transition-all group cursor-pointer hover:shadow-md ${
                  kamar.status === 'available' ? 'hover:border-blue-500' : 'opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-black text-gray-800 group-hover:text-blue-600">
                    {kamar.room_number}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                    kamar.status === 'available' ? 'bg-green-100 text-green-700 border-green-200' : 
                    kamar.status === 'occupied' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    {kamar.status === 'available' ? 'Kosong' : kamar.status === 'occupied' ? 'Terisi' : 'Perbaikan'}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  Rp {kamar.price_per_month.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Tampilkan Modal jika state terbuka */}
      {selectedRoom && (
        <BookingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          room={selectedRoom} 
        />
      )}
    </>
  );
}