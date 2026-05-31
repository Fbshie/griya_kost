import AddGalleryForm from "@/components/admin/AddGalleryForm";
import GalleryList from "@/components/admin/GalleryList";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  // Ambil semua data galeri yang sudah ada di database
  const { data: galleries } = await supabaseAdmin
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false }); 

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen">
      
      {/* Bagian Judul Halaman */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-black text-gray-800">Manajemen Galeri 📸</h1>
        <p className="text-gray-500 mt-2">
          Tambahkan foto fasilitas dan suasana Kost Griya Citra di sini. Foto yang diunggah akan langsung tampil di halaman depan (Home) website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-1">
          <AddGalleryForm />
        </div>

        {/* Daftar Foto yang sudah di-publish */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
              <span>🖼️</span> Foto Terpublikasi
            </h2>
            
            {/* Panggil komponen daftar galeri di sini */}
            <GalleryList galleries={galleries || []} />
            
          </div>
        </div>

      </div>
    </div>
  );
}