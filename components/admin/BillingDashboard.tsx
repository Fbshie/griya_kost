"use client";

import { useState } from "react";

export default function BillingDashboard({ initialData }: { initialData: any[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Pisahkan data berdasarkan status menyewa
  const activeBookings = initialData.filter(b => b.status === 'active');
  const completedBookings = initialData.filter(b => b.status === 'completed' || b.status === 'ended');

  // Fungsi untuk menghitung status bulan ini dan sisa hari
  const getBillingStatus = (booking: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ambil tagihan yang paling baru (diurutkan berdasarkan due_date)
    const sortedInvoices = [...(booking.invoices || [])].sort(
      (a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    );

    const latestInvoice = sortedInvoices[0];
    
    // Menghitung sisa waktu (Countdown)
    let daysLeft = 0;
    let nextDueDate = new Date();

    if (latestInvoice && latestInvoice.status === 'unpaid') {
      // Jika ada tagihan belum dibayar, hitung mundur ke due_date tagihan tersebut
      nextDueDate = new Date(latestInvoice.due_date);
    } else {
      // Jika sudah lunas, hitung mundur ke jatuh tempo BULAN DEPAN berdasarkan tanggal masuk
      const startDate = new Date(booking.start_date);
      const billDay = startDate.getDate();
      let nextMonth = today.getMonth() + 1;
      let nextYear = today.getFullYear();
      
      // Jika hari ini sudah melewati tanggal jatuh tempo, targetkan bulan depannya lagi
      if (today.getDate() > billDay) {
        nextMonth++;
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear++;
        }
      }
      nextDueDate = new Date(nextYear, nextMonth, billDay);
    }

    const diffTime = nextDueDate.getTime() - today.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      latestInvoice,
      daysLeft,
      isUnpaid: latestInvoice?.status === 'unpaid'
    };
  };

  const renderBookingList = (bookings: any[]) => {
    if (bookings.length === 0) {
      return <div className="py-12 text-center text-gray-400 italic">Belum ada data di kategori ini.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => {
          const { isUnpaid, daysLeft } = getBillingStatus(booking);
          const userName = booking.users?.full_name || "Penyewa Anonim";
          const roomNumber = booking.rooms?.room_number || "-";

          return (
            <div 
              key={booking.id} 
              onClick={() => setSelectedBooking(booking)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{userName}</h3>
                  <p className="text-sm text-gray-500">Kamar {roomNumber}</p>
                </div>
                {/* Indikator Lunas / Belum */}
                {activeTab === 'active' && (
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    isUnpaid 
                    ? 'bg-red-50 text-red-600 border-red-200' 
                    : 'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    {isUnpaid ? 'Belum Bayar' : 'Lunas'}
                  </span>
                )}
              </div>

              {/* Tampilan Sisa Hari (Hanya untuk yang masih Aktif) */}
              {activeTab === 'active' && (
                <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Sisa waktu tagihan:</span>
                  <span className={`text-sm font-black ${daysLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                    {daysLeft} Hari Lagi
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* TABS NAVIGATION */}
      <div className="flex gap-4 border-b mb-6">
        <button 
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 font-bold transition-all border-b-2 ${
            activeTab === 'active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Penyewa Aktif ({activeBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 font-bold transition-all border-b-2 ${
            activeTab === 'completed' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Selesai Menyewa ({completedBookings.length})
        </button>
      </div>

      {/* RENDER LIST SESUAI TAB */}
      {activeTab === 'active' ? renderBookingList(activeBookings) : renderBookingList(completedBookings)}

      {/* MODAL DETAIL RIWAYAT */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedBooking.users?.full_name}</h2>
                <p className="text-sm text-gray-500">Kamar {selectedBooking.rooms?.room_number}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {/* Konten Riwayat Invoices */}
            <div className="p-6 overflow-y-auto">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Riwayat Tagihan</h4>
              
              <div className="space-y-3">
                {selectedBooking.invoices?.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Belum ada tagihan terbit.</p>
                ) : (
                  selectedBooking.invoices
                    .sort((a: any, b: any) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
                    .map((inv: any) => (
                      <div key={inv.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-bold text-gray-800">Rp {inv.amount.toLocaleString('id-ID')}</p>
                          <p className="text-xs text-gray-500">Jatuh Tempo: {inv.due_date}</p>
                          {inv.payment_method && (
                            <p className="text-xs text-blue-500 font-medium mt-1">Via: {inv.payment_method}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {inv.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                          </span>

                          {/* Tombol Bukti Transfer Offline */}
                          {inv.payment_proof && (
                            <a 
                              href={inv.payment_proof} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Lihat Bukti
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}