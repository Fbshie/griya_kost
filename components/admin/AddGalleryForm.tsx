'use client'

import { useState } from 'react'
import { addGalleryItem } from '@/app/actions/galleryActions'

export default function AddGalleryForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await addGalleryItem(formData);

    if (res.success) {
      alert("✅ Foto berhasil ditambahkan ke galeri Kost Griya Citra!");
      (e.target as HTMLFormElement).reset(); // Kosongkan form setelah berhasil
    } else {
      alert("❌ Gagal mengunggah: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <span>📸</span> Tambah Foto Galeri
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Judul Foto</label>
          <input
            type="text"
            name="title"
            required
            placeholder="Contoh: Tampak Depan Kost"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat (Opsional)</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Contoh: Bangunan modern dengan sirkulasi udara yang baik..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Foto (JPG/PNG)</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 mt-2 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md shadow-blue-200"
        >
          {loading ? 'Mengunggah...' : 'Simpan Foto ke Galeri'}
        </button>
      </form>
    </div>
  )
}