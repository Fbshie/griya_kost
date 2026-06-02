'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendWhatsApp } from "@/lib/fonnte"

export async function markAsPaidManual(formData: FormData) {
  const invoiceId = formData.get('invoice_id') as string;
  const file = formData.get('proof') as File;
  
  let proofUrl = null;

  // 1. Ambil data penyewa terlebih dahulu untuk dikirimkan WA nanti
  const { data: invoiceData, error: fetchError } = await supabaseAdmin
    .from('invoices')
    .select(`
      amount,
      bookings (
        users ( full_name, phone_number )
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (fetchError || !invoiceData) {
    throw new Error("Data tagihan tidak ditemukan");
  }

  // 2. Upload file bukti pembayaran (Jika Admin mengunggahnya)
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${invoiceId}-${Date.now()}.${fileExt}`;

    // DISESUAIKAN: Menggunakan nama bucket yang sama yaitu 'bukti_bayar'
    const { error: uploadError } = await supabaseAdmin.storage
      .from('bukti_bayar')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Gagal upload bukti:", uploadError);
      throw new Error("Gagal mengunggah foto kuitansi");
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('bukti_bayar')
      .getPublicUrl(fileName);
      
    proofUrl = publicUrlData.publicUrl;
  }

  // 3. Update status invoice di database
  const { error: updateError } = await supabaseAdmin
    .from('invoices')
    .update({ 
      status: 'paid', 
      payment_date: new Date().toISOString(),
      payment_proof: proofUrl,
      payment_method: 'Offline / Transfer Manual' // <--- INI DIA BARIS SAKTINYA!
    })
    .eq('id', invoiceId);

  if (updateError) {
    console.error("Gagal update invoice:", updateError);
    throw new Error("Gagal melunaskan tagihan");
  }

  // 4. KIRIM NOTIFIKASI WA KHUSUS PEMBAYARAN MANUAL (Perbaikan TypeScript)
  const bookingData = invoiceData.bookings as any;
  const tenantName = bookingData?.users?.full_name || 'Penyewa';
  const phone = bookingData?.users?.phone_number;
  
  // Teksnya dibedakan sedikit agar penyewa tahu ini divalidasi oleh Admin
  if (phone) {
    const pesan = `Halo *${tenantName}*,\n\nPembayaran tunai/manual untuk kamar Anda sebesar *Rp ${invoiceData.amount.toLocaleString('id-ID')}* telah kami terima dan diverifikasi oleh Admin. Status tagihan bulan ini sekarang *LUNAS*.\n\nTerima kasih! 🙏`;
    await sendWhatsApp(phone, pesan);
  }

  // 5. Refresh halaman
  revalidatePath('/admin-panel');
}

export async function sendPaymentReminder(invoiceId: string) {
  // 1. Ambil data tagihan dan penyewa
  const { data: invoice, error: fetchError } = await supabaseAdmin
    .from('invoices')
    .select(`
      amount, due_date,
      bookings (
        users ( full_name, phone_number )
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (fetchError || !invoice) {
    throw new Error("Data tagihan tidak ditemukan");
  }

  // Perbaikan TypeScript
  const bookingData = invoice.bookings as any;
  const tenantName = bookingData?.users?.full_name || 'Penyewa';
  const phone = bookingData?.users?.phone_number;
  
  // Format tanggal jatuh tempo menjadi lebih rapi (opsional)
  const dueDate = new Date(invoice.due_date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  if (phone) {
    // 2. Siapkan Teks Pesan Fonnte
    const pesan = `Halo *${tenantName}*,\n\nIni adalah pesan pengingat otomatis dari Admin Kost Griya Citra. 🏠\n\nTagihan kamar Anda sebesar *Rp ${invoice.amount.toLocaleString('id-ID')}* untuk bulan ini belum kami terima.\n\nMohon segera melakukan pembayaran melalui website untuk menghindari denda atau pemutusan akses kamar. Jika sudah membayar, mohon abaikan pesan ini.\n\nTerima kasih! 🙏`;

    // 3. Kirim pesan WA
    const waResponse = await sendWhatsApp(phone, pesan);

    if (!waResponse) {
      throw new Error("Gagal mengirim pesan WhatsApp via Fonnte");
    }
  }

  // 4. Update waktu pengingat terakhir di database
  const { error: updateError } = await supabaseAdmin
    .from('invoices')
    .update({ 
      last_reminder_at: new Date().toISOString() 
    })
    .eq('id', invoiceId);

  if (updateError) {
    console.error("Gagal update last_reminder_at:", updateError);
  }

  // 5. Refresh UI
  revalidatePath('/admin-panel');
}