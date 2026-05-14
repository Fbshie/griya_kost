import DashboardStats from "@/components/admin/DashboardStats";

export const dynamic = 'force-dynamic';

export default function TagihanPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Tambahkan Header agar halamannya terlihat profesional */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Manajemen Tagihan</h1>
        <p className="text-gray-500">Pantau pendapatan bulan ini, status pembayaran, dan riwayat tunggakan penyewa Kost Griya Citra.</p>
      </header>
      
      {/* Memanggil komponen statistik dan tabel yang sudah pintar */}
      <DashboardStats />
      
    </div>
  );
}