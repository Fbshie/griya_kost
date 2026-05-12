'use server'

import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitComplaint(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Silakan login terlebih dahulu." };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || !description) {
      return { success: false, message: "Kategori dan detail keluhan wajib diisi." };
    }

    // 1. CARI KAMAR AKTIF & NOMOR KAMARNYA SEKALIGUS
    const { data: activeBooking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(`
        room_id,
        rooms ( room_number )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (bookingError || !activeBooking) {
      return { 
        success: false, 
        message: "Anda tidak memiliki kamar aktif. Hanya penghuni aktif yang dapat melapor." 
      };
    }

    const roomNumber = activeBooking.rooms?.room_number || "Tidak diketahui";

    // 2. MASUKKAN KELUHAN KE DATABASE
    const { error: insertError } = await supabaseAdmin
      .from("complaints")
      .insert({
        user_id: userId,
        room_id: activeBooking.room_id,
        title: title,
        description: description,
        status: "pending"
      });

    if (insertError) {
      console.error("Gagal insert keluhan:", insertError);
      return { success: false, message: "Terjadi kesalahan sistem saat mengirim keluhan." };
    }

    // 3. KIRIM NOTIFIKASI WHATSAPP KE ADMIN (Menggunakan Fonnte API)
    const adminPhone = "089504100165"; // <-- GANTI DENGAN NOMOR WA ADMIN (Awali dengan 08 / 62)
    const waToken = process.env.FONNTE_TOKEN || ""; 

    const waMessage = `*🚨 LAPORAN KELUHAN BARU 🚨*\n\n*Kamar:* ${roomNumber}\n*Kategori:* ${title}\n*Detail:* ${description}\n\nMohon segera cek Dasbor Admin untuk menindaklanjuti.`;

    try {
      await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": waToken, // Token rahasia dari akun Fonnte
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target: adminPhone,
          message: waMessage,
        })
      });
      console.log("Notifikasi WA berhasil dikirim!");
    } catch (waError) {
      // Kita bungkus dalam try-catch terpisah agar jika WA gagal, 
      // keluhan tetap tersimpan di database dan user tetap melihat pesan sukses.
      console.error("Gagal mengirim WA:", waError);
    }

    revalidatePath("/admin-panel/complaints"); 
    return { success: true, message: "Keluhan berhasil terkirim! Admin akan segera memprosesnya." };

  } catch (error) {
    console.error("Error submitComplaint:", error);
    return { success: false, message: "Terjadi kesalahan internal server." };
  }
}