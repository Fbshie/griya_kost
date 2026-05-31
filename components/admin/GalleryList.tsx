'use client'

import { useState } from 'react'
import { deleteGalleryItem } from '@/app/actions/galleryActions'

export default function GalleryList({ galleries }: { galleries: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string, imageUrl: string) => {
    const confirm = window.confirm("Apakah Anda yakin ingin menghapus foto ini?\nFoto akan hilang dari halaman Home.");
    if (!confirm) return;

    setLoadingId(id);
    const res = await deleteGalleryItem(id, imageUrl);

    if (res.success) {
      alert("✅ Foto berhasil dihapus!");
    } else {
      alert("❌ Gagal menghapus: " + res.error);
    }
    setLoadingId(null);
  };

  if (!galleries || galleries.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500 font-medium">
        Belum ada foto yang diunggah.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {galleries.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col group relative">
          
          {/* Efek Loading saat Dihapus */}
          {loadingId === item.id && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center font-bold text-red-600">
              Menghapus...
            </div>
          )}

          <div className="h-48 bg-gray-100 overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description || '-'}</p>
            </div>
            
            <button 
              onClick={() => handleDelete(item.id, item.image_url)}
              disabled={loadingId === item.id}
              className="mt-4 w-full py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
            >
              Hapus Foto
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}