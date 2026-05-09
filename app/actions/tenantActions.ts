'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { redirect } from "next/navigation"

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