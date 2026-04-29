'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendWhatsApp } from "@/lib/fonnte"

// 1. Mengambil detail penyewa yang sedang aktif di kamar tersebut
export async function getRoomDetails(roomId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        start_date,
        users ( full_name, phone_number ),
        invoices ( id, amount, status, due_date )
      `)
      .eq('room_id', roomId)
      .eq('status', 'active')
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal mengambil data penghuni" }
  }
}

// 2. Mengubah status tagihan menjadi lunas & kirim WA nota
export async function markInvoiceAsPaid(invoiceId: string, phone: string, amount: number, tenantName: string) {
  try {
    await supabaseAdmin
      .from('invoices')
      .update({ 
        status: 'paid', 
        payment_date: new Date().toISOString() 
      })
      .eq('id', invoiceId)

    // Kirim WA Nota Lunas
    const pesanWA = `Halo *${tenantName}*,\n\nTerima kasih, pembayaran tagihan kost Anda sebesar *Rp ${amount.toLocaleString('id-ID')}* telah kami terima dan berstatus *LUNAS*.\n\nSemoga harinya menyenangkan!`;
    await sendWhatsApp(phone, pesanWA);

    revalidatePath('/admin-panel')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal memproses pembayaran" }
  }
}

// 3. Mengosongkan kamar (Checkout)
export async function checkoutRoom(roomId: string, bookingId: string) {
  try {
    // Akhiri kontrak booking
    await supabaseAdmin
      .from('bookings')
      .update({ 
        status: 'finished', 
        end_date: new Date().toISOString() 
      })
      .eq('id', bookingId)

    // Ubah status kamar kembali menjadi 'available'
    await supabaseAdmin
      .from('rooms')
      .update({ status: 'available' })
      .eq('id', roomId)

    revalidatePath('/admin-panel')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal melakukan checkout" }
  }
}