import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/fonnte';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validasi Keamanan (Signature Key)
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;
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
        // 1. UPDATE STATUS PEMBAYARAN TERLEBIH DAHULU
        await supabaseAdmin
          .from('invoices')
          .update({ 
            status: 'paid', 
            payment_date: new Date().toISOString() // Mengisi payment_date agar tidak NULL
          })
          .eq('id', invoice.id);

        console.log(`✅ Status Invoice ${invoice.id} diubah menjadi Paid`);

        // 2. KIRIM NOTIFIKASI WHATSAPP
        const tenantName = invoice.bookings.users.full_name;
        const phone = invoice.bookings.users.phone_number;
        const pesan = `Halo *${tenantName}*,\n\nPembayaran kost Griya Citra sebesar *Rp ${invoice.amount.toLocaleString('id-ID')}* telah kami terima dan berstatus *LUNAS*. Terima kasih! 🙏`;
        
        await sendWhatsApp(phone, pesan);
        console.log("📱 Notifikasi WA terkirim ke:", phone);

        // 3. BARU KEMUDIAN UPDATE KOLOM whatsapp_sent_at
        await supabaseAdmin
          .from('invoices')
          .update({ 
            whatsapp_sent_at: new Date().toISOString() // Mencatat waktu pengiriman WA
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