"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function getDashboardStats() {
  try {
    // 1. Ambil data kamar untuk hitung okupansi
    const { data: rooms } = await supabaseAdmin.from("rooms").select("status");
    const totalRooms = rooms?.length || 0;
    const occupiedRooms = rooms?.filter((r) => r.status === "occupied").length || 0;

    // 2. Ambil semua Invoices beserta relasi user dan kamar
    // HANYA ambil tagihan untuk bulan ini (atau yang belum lunas)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const firstDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

    const { data: invoices } = await supabaseAdmin
      .from("invoices")
      .select(`
        id, amount, status, due_date, payment_proof, payment_method,
        bookings (
          status,
          users ( full_name, phone_number ),
          rooms ( room_number )
        )
      `)
      .or(`status.eq.unpaid,and(due_date.gte.${firstDay},due_date.lte.${lastDay})`);

    // 3. Hitung Statistik Keuangan
    let totalRevenue = 0;
    let totalUnpaid = 0;
    let unpaidCount = 0;
    const detailedList: any[] = []; // Array untuk menampung data tabel

    if (invoices) {
      invoices.forEach((inv) => {
        // Perbaikan TypeScript: Cast objek booking menjadi 'any' agar aman di-build
        const bookingData = inv.bookings as any;

        // Hanya proses invoice dari penyewa yang masih aktif
        if (bookingData?.status === 'active') {
          if (inv.status === "paid") {
            totalRevenue += inv.amount;
          } else if (inv.status === "unpaid") {
            totalUnpaid += inv.amount;
            unpaidCount++;
          }

          // Masukkan ke daftar detail untuk tabel
          detailedList.push({
            id: inv.id,
            userName: bookingData?.users?.full_name || "Penyewa",
            roomNumber: bookingData?.rooms?.room_number || "-",
            amount: inv.amount,
            status: inv.status,
            dueDate: inv.due_date,
            proofUrl: inv.payment_proof,
            paymentMethod: inv.payment_method
          });
        }
      });
    }

    return {
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        totalRevenue,
        totalUnpaid,
        unpaidCount,
        detailedList // Mengirim daftar detail ke UI
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}