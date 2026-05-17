import AddGalleryForm from "@/components/admin/AddGalleryForm";

export const dynamic = 'force-dynamic';

export default function GaleriPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      
      {/* Bagian Judul Halaman */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-black text-gray-800">Manajemen Galeri 📸</h1>
        <p className="text-gray-500 mt-2">
          Tambahkan foto fasilitas dan suasana Kost Griya Citra di sini. Foto yang diunggah akan langsung tampil di halaman depan (Home) website.
        </p>
      </div>

      {/* Form Upload */}
      <div className="mb-12">
        <AddGalleryForm />
      </div>
      
    </div>
  );
}