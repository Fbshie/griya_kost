import { supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PaymentCard from '@/components/user/PaymentCard';
import TenantQuickActions from '@/components/user/TenantQuickActions';

export const dynamic = 'force-dynamic';

export default async function TenantDashboard() {
  const user = await currentUser();
  
  if (!user) {
    return redirect('/sign-in');
  }

  // 1. CARI DATA BOOKING (Tambahkan 'users ( full_name )' ke dalam select)
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      id,
      status,
      users ( full_name ), 
      rooms ( room_number, floor ),
      invoices ( id, amount, status, due_date )
    `)
    .eq('user_id', user.id)
    .in('status', ['active', 'pending'])
    .maybeSingle();

  if (error) console.error("Dashboard Error:", error);

  // 2. JIKA BELUM PUNYA KAMAR
  if (!booking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border max-w-md w-full">
          <div className="text-6xl mb-6">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Kamar Aktif</h1>
          <p className="text-gray-500 mb-8">Sepertinya Anda belum memesan kamar atau masa sewa Anda sudah berakhir.</p>
          <a href="/rooms" className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200">
            Pesan Kamar Sekarang
          </a>
        </div>
      </div>
    );
  }

  // 3. AMBIL NAMA LENGKAP DARI DATABASE (Perbaikan TypeScript Build Error)
  // Kita bypass pengecekan ketat TypeScript dengan "as any"
  const userData = booking.users as any;
  const tenantFullName = userData?.full_name || user.firstName || 'Penyewa';

  const unpaidInvoices = booking.invoices?.filter((inv: any) => inv.status === 'unpaid') || [];
  const roomNumber = (booking.rooms as any)?.room_number || '-';
  const roomFloor = (booking.rooms as any)?.floor || '-';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      
      {/* HEADER PROFILE CARD */}
      <header className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-blue-100 font-medium mb-1">Dashboard Penyewa</p>
            <h1 className="text-3xl md:text-4xl font-black mb-2">Halo, {tenantFullName}! 👋</h1>
            <p className="text-blue-50 max-w-md leading-relaxed">
              Selamat datang di pusat kendali kost Anda. Cek tagihan dan manfaatkan layanan kami dengan mudah.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-5 text-center shrink-0">
            <p className="text-blue-100 text-sm font-medium mb-1">Kamar Anda Saat Ini</p>
            <p className="text-4xl font-black text-white">{roomNumber}</p>
            <p className="text-xs text-blue-100 mt-1 bg-black/20 rounded-full py-1 px-3 inline-block">
              Lantai {roomFloor}
            </p>
          </div>
        </div>
      </header>

      {/* QUICK ACTIONS SECTION */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>⚡</span> Menu Cepat
        </h2>
        <TenantQuickActions tenantName={tenantFullName} roomNumber={roomNumber} />
      </div>

      {/* INVOICE SECTION */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🧾</span> Tagihan Anda
        </h2>
        
        {unpaidInvoices.length === 0 ? (
          <div className="bg-green-50 p-8 rounded-3xl border border-green-200 text-center shadow-sm">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-green-800 font-black text-xl mb-1">Semua Tagihan Lunas!</p>
            <p className="text-green-600 text-sm">Terima kasih telah melakukan pembayaran tepat waktu. Anda bebas dari tunggakan bulan ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unpaidInvoices.map((invoice: any) => (
              <PaymentCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}