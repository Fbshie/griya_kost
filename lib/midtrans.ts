// @ts-ignore
import midtransClient from 'midtrans-client';

// Inisialisasi Snap API dengan pengecekan ketat agar tidak error saat build
export const snap = new (midtransClient as any).Snap({
  isProduction: false, // Set ke true jika sudah menggunakan akun Production Midtrans
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});