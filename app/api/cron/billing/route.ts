import { supabaseAdmin } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/fonnte";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Proteksi Keamanan
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. UPDATE KUERI: Dompleng data harga dari tabel room_classes
    const { data: activeBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, room_id, user_id, start_date,
        rooms ( 
          room_number, 
          room_classes ( price ) 
        ),
        users ( full_name, phone_number )
      `)
      .eq('status', 'active');

    if (bookingError) throw bookingError;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    let processedCount = 0;

    // Tambahkan 'as any[]' untuk mencegah error TypeScript karena struktur bersarang
    for (const booking of activeBookings as any[]) {
      const startDate = new Date(booking.start_date);
      const billDay = startDate.getDate(); // Ambil tanggal masuknya (misal: 15)

      // 1. Tentukan tanggal jatuh tempo untuk bulan ini
      // objek tanggal untuk jatuh tempo bulan ini (misal: 15 Mei 2026)
      const dueDateThisMonth = new Date(currentYear, currentMonth - 1, billDay);
      
      // 2. Hitung kapan notifikasi harus dikirim (H-3 dari jatuh tempo)
      const notificationDate = new Date(dueDateThisMonth);
      notificationDate.setDate(dueDateThisMonth.getDate() - 3);

      // 3. CEK: Apakah HARI INI adalah jadwal kirim notifikasi?
      const isTodayNotificationDay = 
        today.getDate() === notificationDate.getDate() &&
        today.getMonth() === notificationDate.getMonth();

      if (isTodayNotificationDay) {
        // 4. Pastikan tidak double: Cek apakah invoice bulan ini sudah dibuat?
        const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const lastDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

        const { data: existingInvoice } = await supabaseAdmin
          .from('invoices')
          .select('id')
          .eq('booking_id', booking.id)
          .gte('due_date', firstDayOfMonth)
          .lte('due_date', lastDayOfMonth)
          .maybeSingle();

        if (!existingInvoice) {
          // 2. UPDATE VARIABEL: Ambil nominal harga dari relasi kelas
          const amount = booking.rooms?.room_classes?.price || 0;
          const formattedDueDate = dueDateThisMonth.toISOString().split('T')[0];

          // 5. Buat Invoice
          const { data: newInvoice, error: invError } = await supabaseAdmin
            .from('invoices')
            .insert({
              booking_id: booking.id,
              amount: amount,
              due_date: formattedDueDate,
              status: 'unpaid'
            })
            .select().single();

          if (!invError && newInvoice) {
            // 6. Kirim WhatsApp
            const pesan = `Halo *${booking.users.full_name}* 👋\n\nKamar *${booking.rooms.room_number}*\n\nSekedar mengingatkan bahwa 3 hari lagi adalah waktu pembayaran kost.\n\nNominal: *Rp ${amount.toLocaleString('id-ID')}*\nJatuh tempo: *${formattedDueDate}*\n\nMohon siapkan pembayarannya ya. Terima kasih!`;
            
            const isSent = await sendWhatsApp(booking.users.phone_number, pesan);
            
            if (isSent) {
              await supabaseAdmin
                .from('invoices')
                .update({ whatsapp_sent_at: new Date().toISOString() })
                .eq('id', newInvoice.id);
            }
            processedCount++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}