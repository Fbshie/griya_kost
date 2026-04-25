'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendWhatsApp } from "@/lib/fonnte" // 1. Import Fonnte

export async function createBooking(formData: FormData) {
  const userId = formData.get('user_id') as string 
  // Untuk demo, kita juga butuh nama kamar untuk isi pesan WA
  const roomNumber = formData.get('room_number') as string 
  const roomId = formData.get('room_id') as string
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const startDate = formData.get('start_date') as string
  const amount = Number(formData.get('amount'))

  try {
    // A. Simpan/Update User
    await supabaseAdmin.from('users').upsert({
      id: userId,
      email: email,
      full_name: fullName,
      phone_number: phone,
      role: 'user'
    })

    // B. Buat Booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: userId,
        room_id: roomId,
        start_date: startDate,
        status: 'active'
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // C. Buat Invoice (Perhatikan kita pakai .select() agar dapat ID-nya)
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        booking_id: booking.id,
        due_date: startDate, 
        amount: amount,
        status: 'unpaid'
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // D. Update Status Kamar
    await supabaseAdmin
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', roomId)

    // E. Susun dan Kirim Pesan WhatsApp
    const pesanWA = `Halo *${fullName}* 👋\n\nSelamat datang di Kost Griya Citra! Kamar *${roomNumber}* Anda telah berhasil didaftarkan.\n\nTagihan bulan pertama Anda sebesar *Rp ${amount.toLocaleString('id-ID')}* telah terbit dan jatuh tempo pada tanggal ${startDate}.\n\nTerima kasih!`;
    
    const isSent = await sendWhatsApp(phone, pesanWA);

    // F. Jika WA berhasil terkirim, catat waktunya di database
    if (isSent) {
      await supabaseAdmin
        .from('invoices')
        .update({ whatsapp_sent_at: new Date().toISOString() })
        .eq('id', invoice.id)
    }

    revalidatePath('/admin-panel')
    return { success: true }
    
  } catch (err) {
    console.error(err)
    return { success: false, error: "Gagal memproses booking" }
  }
}