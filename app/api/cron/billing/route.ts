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
    const { data: activeBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, room_id, user_id, start_date,
        rooms ( room_number, room_classes ( price ) ),
        users ( full_name, phone_number )
      `)
      .eq('status', 'active');

    if (bookingError) throw bookingError;

    // PERBAIKAN 1: Paksa zona waktu Vercel menjadi WIB agar tidak meleset hari
    const utcDate = new Date();
    const today = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    let processedCount = 0;

    for (const booking of activeBookings as any[]) {
      const startDate = new Date(booking.start_date);
      
      // PERBAIKAN 3 (BARU): Cegah invoice ganda untuk penyewa masa depan
      if (
        currentYear < startDate.getFullYear() || 
        (currentYear === startDate.getFullYear() && currentMonth < (startDate.getMonth() + 1))
      ) {
        continue; // Lewati penyewa ini, jangan buatkan tagihan dulu
      }

      const billDay = startDate.getDate(); 
      const dueDateThisMonth = new Date(currentYear, currentMonth - 1, billDay);
      
      const notificationDate = new Date(dueDateThisMonth);
      notificationDate.setDate(dueDateThisMonth.getDate() - 3);

      const isTodayNotificationDay = 
        today.getDate() === notificationDate.getDate() &&
        today.getMonth() === notificationDate.getMonth();

      if (isTodayNotificationDay) {
        
        // PERBAIKAN 2: Atasi Bug Tanggal 31 agar dinamis sesuai bulan berjalan
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const lastDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDay}`;

        const { data: existingInvoice } = await supabaseAdmin
          .from('invoices')
          .select('id')
          .eq('booking_id', booking.id)
          .gte('due_date', firstDayOfMonth)
          .lte('due_date', lastDayOfMonth)
          .maybeSingle();

        if (!existingInvoice) {
          const amount = booking.rooms?.room_classes?.price || 0;
          
          // Menggunakan String padding agar format tanggal (YYYY-MM-DD) tidak meleset
          const formattedDueDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(billDay).padStart(2, '0')}`;

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