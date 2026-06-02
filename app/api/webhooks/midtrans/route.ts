import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/fonnte';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validasi Keamanan (Signature Key)
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
            users ( full_name, phone_number ),
            rooms ( room_number )
          )
        `)
        .eq('midtrans_id', order_id)
        .single();

      if (invoice && invoice.status !== 'paid') {
        
        // --- LOGIKA PINTAR MENERJEMAHKAN METODE PEMBAYARAN ---
        let methodString = payment_type;

        if (payment_type === 'bank_transfer') {
          const bank = body.va_numbers && body.va_numbers.length > 0 ? body.va_numbers[0].bank : '';
          methodString = bank ? `Transfer VA ${bank.toUpperCase()}` : 'Bank Transfer';
        } else if (payment_type === 'echannel') {
          methodString = 'Mandiri Virtual Account';
        } else if (payment_type === 'cstore') {
          methodString = body.store ? body.store.toUpperCase() : 'Indomaret/Alfamart';
        } else {
          methodString = payment_type ? payment_type.toUpperCase() : 'Online Payment'; 
        }
        // -----------------------------------------------------

        // 1. UPDATE STATUS PEMBAYARAN TERLEBIH DAHULU
        await supabaseAdmin
          .from('invoices')
          .update({ 
            status: 'paid', 
            payment_date: new Date().toISOString(),
            payment_method: methodString
          })
          .eq('id', invoice.id);

        console.log(`✅ Status Invoice ${invoice.id} diubah menjadi Paid via ${methodString}`);

        // Perbaikan TypeScript: Bypass tipe data relasi objek join
        const bookingData = invoice.bookings as any;
        const userData = bookingData?.users;
        const roomData = bookingData?.rooms;

        // 2. KIRIM NOTIFIKASI WHATSAPP KE PENYEWA
        const tenantName = userData?.full_name || 'Penyewa';
        const phone = userData?.phone_number;
        const roomNumber = roomData?.room_number || '-';
        
        if (phone) {
          const pesanPenyewa = `Halo *${tenantName}*,\n\nPembayaran kost Griya Citra sebesar *Rp ${invoice.amount.toLocaleString('id-ID')}* via *${methodString}* telah kami terima dan berstatus *LUNAS*.\n\nTerima kasih! 🙏`;
          await sendWhatsApp(phone, pesanPenyewa);
          console.log("📱 Notifikasi WA terkirim ke penyewa:", phone);
        }

        // 3. KIRIM NOTIFIKASI WHATSAPP KE HP ADMIN (Dengan Nomor WA Penyewa)
        const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;
        if (adminPhone) {
          const pesanAdmin = `🚨 *PEMBERITAHUAN PEMBAYARAN MASUK* 🚨\n\nHalo Admin, ada transaksi online yang berhasil diverifikasi otomatis oleh sistem!\n\n• *Nama Penyewa:* ${tenantName}\n• *No. WA Penyewa:* ${phone || '-'}\n• *Kamar Kost:* Kamar ${roomNumber}\n• *Nominal:* Rp ${invoice.amount.toLocaleString('id-ID')}\n• *Metode Bayar:* ${methodString}\n• *Status Invoice:* LUNAS (Settlement)\n\nSilakan hubungi penyewa untuk koordinasi lebih lanjut atau cek halaman tagihan di dashboard utama. 🏢`;
          
          await sendWhatsApp(adminPhone, pesanAdmin);
          console.log("📱 Notifikasi WA sukses diteruskan ke Admin:", adminPhone);
        }

        // 4. UPDATE KOLOM whatsapp_sent_at
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