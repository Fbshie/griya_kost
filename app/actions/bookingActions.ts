'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendWhatsApp } from "@/lib/fonnte"

export async function createBooking(formData: FormData) {
  const userId = formData.get('user_id') as string 
  const roomNumber = formData.get('room_number') as string 
  const roomId = formData.get('room_id') as string
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const startDate = formData.get('start_date') as string
  const amount = Number(formData.get('amount'))
  
  // Tangkap file bukti pembayaran
  const proofFile = formData.get('payment_proof') as File | null;

  try {
    // 1. CEK STATUS OFFLINE
    const isOffline = userId.startsWith('offline_');
    
    let invoiceStatus = 'unpaid';
    let paymentMethod = null;
    let proofUrl = null;

    // Jika ini adalah input dari Admin (Offline)
    if (isOffline) {
      invoiceStatus = 'paid'; // Set langsung lunas
      paymentMethod = 'Offline / Transfer Manual';

      // 2. PROSES UPLOAD GAMBAR BUKTI (Jika Ada)
      if (proofFile && proofFile.size > 0) {
        // Ambil ekstensi asli (contoh: .jpg, .png)
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        
        // Upload ke bucket Supabase bernama 'bukti_bayar'
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('bukti_bayar')
          .upload(`public/${fileName}`, proofFile);
        
        if (!uploadError) {
          // Jika sukses, dapatkan URL publiknya
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('bukti_bayar')
            .getPublicUrl(`public/${fileName}`);
          proofUrl = publicUrlData.publicUrl;
        } else {
          console.error("Gagal upload gambar:", uploadError);
        }
      }
    }

    // A. Simpan/Update User
    // (Jika email kosong dari form offline, kita cegah error dengan set nilai null)
    await supabaseAdmin.from('users').upsert({
      id: userId,
      email: email || null,
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

    // C. Buat Invoice dengan status dan data yang Dinamis
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        booking_id: booking.id,
        due_date: startDate, 
        amount: amount,
        status: invoiceStatus,          // Bisa 'paid' atau 'unpaid'
        payment_method: paymentMethod,  // 'Offline' atau null
        payment_proof: proofUrl         // URL Gambar atau null
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // D. Update Status Kamar
    await supabaseAdmin
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', roomId)

    // E. Susun dan Kirim Pesan WhatsApp Dinamis
    const pesanWA = isOffline 
      ? `Halo *${fullName}* 👋\n\nSelamat datang di Kost Griya Citra!\nKamar *${roomNumber}* Anda telah berhasil didaftarkan.\n\nPembayaran bulan pertama sebesar 
      *Rp ${amount.toLocaleString('id-ID')}* telah kami terima dan berstatus *LUNAS*.\n\nTerima kasih!`
      : `Halo *${fullName}* 👋\n\nSelamat datang di Kost Griya Citra! Kamar *${roomNumber}* Anda telah berhasil didaftarkan.\n\nTagihan bulan pertama Anda sebesar 
      *Rp ${amount.toLocaleString('id-ID')}* telah terbit dan jatuh tempo pada tanggal ${startDate}.\n\nTerima kasih!`;
    
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