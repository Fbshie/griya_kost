import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/fonnte';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Vercel Cron Jobs selalu menggunakan method GET
export async function GET(req: Request) {
    try {
        // 1. Opsional: Keamanan (Memastikan hanya Vercel yang bisa menjalankan ini)
        // Jika sudah mengatur CRON_SECRET di Vercel, buka komentar kode di bawah ini:
        
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response('Unauthorized', { status: 401 });
        }
        

        // 2. Cari semua tagihan yang belum dibayar
        const { data: unpaidInvoices, error: fetchError } = await supabaseAdmin
            .from('invoices')
            .select(`
        id, amount, due_date, last_reminder_at,
        bookings!inner (
          status,
          users ( full_name, phone_number )
        )
      `)
            .eq('status', 'unpaid')
            .eq('bookings.status', 'active');

        if (fetchError || !unpaidInvoices) {
            throw new Error("Gagal mengambil data tagihan");
        }

        let terkirim = 0;

        // 3. Looping semua tagihan yang belum lunas
        for (const invoice of unpaidInvoices) {
            const sekarang = new Date();
            let bolehKirim = true;

            // Logika Anti-Spam: Cek apakah sudah dikirim hari ini?
            if (invoice.last_reminder_at) {
                const waktuTerakhir = new Date(invoice.last_reminder_at);
                const selisihJam = Math.abs(sekarang.getTime() - waktuTerakhir.getTime()) / 36e5;

                // Jika belum lewat 24 jam sejak reminder terakhir, lewati pengiriman ini
                if (selisihJam < 24) {
                    bolehKirim = false;
                }
            }

            if (bolehKirim) {
                // Perbaikan TypeScript: Bypass tipe data relasi objek join
                const bookingData = invoice.bookings as any;
                const userData = bookingData?.users;
                
                const tenantName = userData?.full_name || "Penyewa";
                const phone = userData?.phone_number;

                if (phone) {
                    const pesan = `Halo *${tenantName}*,\n\nIni adalah sistem pengingat otomatis Kost Griya Citra. 🤖\n\nKami menginformasikan bahwa tagihan kamar Anda sebesar *Rp ${invoice.amount.toLocaleString('id-ID')}* masih berstatus *BELUM LUNAS*.\n\nMohon segera selesaikan pembayaran Anda melalui website. Abaikan pesan ini jika Anda sudah membayar.\n\nTerima kasih! 🙏`;

                    // Kirim WA
                    await sendWhatsApp(phone, pesan);

                    // Update database bahwa reminder sudah dikirim hari ini
                    await supabaseAdmin
                        .from('invoices')
                        .update({ last_reminder_at: sekarang.toISOString() })
                        .eq('id', invoice.id);

                    terkirim++;

                    await delay(2000);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Proses cron selesai. ${terkirim} pesan reminder berhasil dikirim.`
        });

    } catch (error: any) {
        console.error('Cron Error:', error.message);
        return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
    }
}