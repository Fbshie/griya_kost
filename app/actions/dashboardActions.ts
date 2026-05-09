'use server'

import { supabaseAdmin } from "@/lib/supabase";

export async function getDashboardStats() {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Batas tanggal bulan ini untuk filter tagihan
    const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

    // 1. Hitung total kamar & kamar yang sedang disewa
    const { count: totalRooms } = await supabaseAdmin
      .from('rooms')
      .select('*', { count: 'exact', head: true });

    const { count: occupiedRooms } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 2. Ambil data tagihan HANYA untuk bulan ini & dari penyewa aktif
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select(`
        amount, 
        status,
        bookings!inner (
          status
        )
      `)
      .gte('due_date', firstDayOfMonth)
      .lte('due_date', lastDayOfMonth)
      .eq('bookings.status', 'active'); // Filter ini yang menyembunyikan tagihan dari penyewa yg sudah checkout

    let totalRevenue = 0;
    let totalUnpaid = 0;
    let unpaidCount = 0;

    if (invoices) {
      invoices.forEach(inv => {
        if (inv.status === 'paid') {
          totalRevenue += inv.amount;
        } else if (inv.status === 'unpaid') {
          totalUnpaid += inv.amount;
          unpaidCount++; // Sekarang ini hanya akan menghitung kamar yang benar-benar aktif
        }
      });
    }

    return {
      success: true,
      data: {
        totalRooms: totalRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        availableRooms: (totalRooms || 0) - (occupiedRooms || 0),
        totalRevenue,
        totalUnpaid,
        unpaidCount
      }
    };
  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error);
    return { success: false, error: "Gagal memuat analitik" };
  }
}