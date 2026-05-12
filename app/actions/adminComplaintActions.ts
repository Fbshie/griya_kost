'use server'

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Fungsi untuk mengambil semua data keluhan
export async function getAdminComplaints() {
  try {
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        rooms (
          room_number
        )
      `)
      .order('created_at', { ascending: false }); // Yang paling baru di atas

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil data keluhan:", error);
    return { success: false, data: [] };
  }
}

// Fungsi untuk memperbarui status keluhan (Pending -> Diproses -> Selesai)
export async function updateComplaintStatus(complaintId: string, newStatus: string) {
  try {
    const { error } = await supabaseAdmin
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', complaintId);

    if (error) throw error;

    revalidatePath('/admin-panel/complaints');
    return { success: true };
  } catch (error) {
    console.error("Gagal update status:", error);
    return { success: false };
  }
}