import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/fonnte';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validasi Keamanan (Signature Key)
    // Tambahkan ekstraksi payment_type dari body Midtrans
    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type } = body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) {
      console.log("❌ Signature Midtrans tidak valid!");
      return NextResponse.json({ message: 'Invalid Signature' }, { status: 400 });
    }

    // 2. Logika Update Database jika Lunas
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      
      const { data: invoice, error: findError } = await supabaseAdmin
        .from('invoices')
        .select(`
          id, amount, status,
          bookings (
            users ( full_name, phone_number )
          )
        `)
        .eq('midtrans_id', order_id)
        .single();

      if (invoice && invoice.status !== 'paid') {
        
        // --- LOGIKA PINTAR MENERJEMAHKAN METODE PEMBAYARAN ---
        let methodString = payment_type; // Default bawaan Midtrans

        if (payment_type === 'bank_transfer') {
          // Cek bank apa yang dipakai (BCA, BNI, BRI, dll)
          const bank = body.va_numbers && body.va_numbers.length > 0 ? body.va_numbers[0].bank : '';
          methodString = bank ? `Transfer VA ${bank.toUpperCase()}` : 'Bank Transfer';
        } else if (payment_type === 'echannel') {
          methodString = 'Mandiri Virtual Account';
        } else if (payment_type === 'cstore') {
          // Pembayaran via Indomaret / Alfamart
          methodString = body.store ? body.store.toUpperCase() : 'Indomaret/Alfamart';
        } else {
          // Untuk qris, gopay, shopeepay akan dijadikan huruf kapital besar (QRIS, GOPAY)
          methodString = payment_type ? payment_type.toUpperCase() : 'Online Payment'; 
        }
        // -----------------------------------------------------

        // 1. UPDATE STATUS PEMBAYARAN TERLEBIH DAHULU
        await supabaseAdmin
          .from('invoices')
          .update({ 
            status: 'paid', 
            payment_date: new Date().toISOString(), // Mengisi payment_date agar tidak NULL
            payment_method: methodString            // <-- SIMPAN METODE PEMBAYARAN KE DATABASE
          })
          .eq('id', invoice.id);

        console.log(`✅ Status Invoice ${invoice.id} diubah menjadi Paid via ${methodString}`);

        // 2. KIRIM NOTIFIKASI WHATSAPP
        const tenantName = invoice.bookings.users.full_name;
        const phone = invoice.bookings.users.phone_number;
        // Opsional: Anda juga bisa menyebutkan metode pembayarannya di dalam chat WA!
        const pesan = `Halo *${tenantName}*,\n\nPembayaran kost Griya Citra sebesar *Rp ${invoice.amount.toLocaleString('id-ID')}* via *${methodString}* telah kami terima dan berstatus *LUNAS*.\n\nTerima kasih! 🙏`;
        
        await sendWhatsApp(phone, pesan);
        console.log("📱 Notifikasi WA terkirim ke:", phone);

        // 3. BARU KEMUDIAN UPDATE KOLOM whatsapp_sent_at
        await supabaseAdmin
          .from('invoices')
          .update({ 
            whatsapp_sent_at: new Date().toISOString()
          })
          .eq('id', invoice.id);
        
        console.log("💾 Waktu pengiriman WA berhasil dicatat di database");
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}