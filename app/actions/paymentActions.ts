'use server'

import { snap } from "@/lib/midtrans";
import { supabaseAdmin } from "@/lib/supabase";

export async function generateSnapToken(invoiceId: string) {
  try {
    // 1. Ambil data tagihan lengkap dari database
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        id, amount,
        bookings (
          users ( full_name, email, phone_number )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) throw new Error("Tagihan tidak ditemukan");

    // 2. Buat ID Pesanan yang unik (Penting untuk Webhook nanti)
    // Format: INV-[ID_SUPABASE]-[TIMESTAMP] agar tidak bentrok
    const orderId = `INV-${invoice.id.substring(0,8)}-${Date.now()}`;

    // 3. Siapkan parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: invoice.amount
      },
      customer_details: {
        first_name: invoice.bookings.users.full_name,
        email: invoice.bookings.users.email || "noemail@test.com",
        phone: invoice.bookings.users.phone_number
      },
      // Opsional: Batasi hanya menerima QRIS dan Transfer Bank
      enabled_payments: ["credit_card", "mandiri_clickpay", "cimb_clicks", "bca_klikbca", "bca_klikpay", "bri_epay", "echannel", "permata_va", "bca_va", "bni_va", "bri_va", "other_va", "gopay", "indomaret", "danamon_online", "akulaku", "shopeepay", "qris"]
    };

    // 4. Minta Token ke Midtrans
    const transaction = await snap.createTransaction(parameter);
    
    // 5. Simpan Order ID ini ke Supabase (agar kita tahu invoice mana yang sedang dibayar)
    await supabaseAdmin
      .from('invoices')
      .update({ midtrans_id: orderId })
      .eq('id', invoiceId);

    return { success: true, token: transaction.token };

  } catch (error: any) {
    console.error("Gagal membuat token Midtrans:", error);
    return { success: false, error: error.message };
  }
}