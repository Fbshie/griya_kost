'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { sendWhatsApp } from "@/lib/fonnte"

export async function createBookingForTenant(formData: FormData) {
  const roomId = formData.get('room_id') as string;
  const userId = formData.get('user_id') as string;
  const amount = Number(formData.get('amount'));
  const fullName = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  const start_date = formData.get('start_date') as string;
  
  // Tangkap nomor WA dari form
  const phone = formData.get('phone_number') as string;

  // 1. Simpan/Update user beserta nomor teleponnya
  await supabaseAdmin.from('users').upsert({
    id: userId,
    full_name: fullName,
    email: email,
    phone_number: phone, // Simpan ke database
    role: 'user'
  });

  // 2. Buat Booking
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .insert({
      user_id: userId,
      room_id: roomId,
      start_date: start_date,
      status: 'active'
    })
    .select().single();

  if (booking) {
    // 3. Buat Invoice pertama
    await supabaseAdmin.from('invoices').insert({
      booking_id: booking.id,
      amount: amount,
      due_date: booking.start_date,
      status: 'unpaid'
    });

    // 4. Update status kamar
    await supabaseAdmin.from('rooms').update({ status: 'occupied' }).eq('id', roomId);
  }

  // 5. Lempar ke Dashboard
  redirect('/dashboard');
}

export async function requestCheckoutNotification(tenantName: string, roomNumber: string) {
  try {
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;
    if (!adminPhone) {
      return { success: false, error: "Nomor Admin tidak ditemukan di sistem." };
    }

    const pesan = `🚨 *PERMOHONAN PINDAH / CHECKOUT* 🚨\n\nHalo Admin, penyewa atas nama *${tenantName}* di *Kamar ${roomNumber}* baru saja menekan tombol pengajuan keluar dari kost melalui Dashboard.\n\nMohon segera hubungi penyewa yang bersangkutan untuk proses serah terima kunci dan pengecekan kondisi kamar. 🏢`;
    
    await sendWhatsApp(adminPhone, pesan);

    return { success: true };
  } catch (error) {
    console.error("Gagal mengirim WA Checkout:", error);
    return { success: false, error: "Gagal mengirim permohonan ke Admin." };
  }
}

