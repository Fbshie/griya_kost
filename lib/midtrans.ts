import midtransClient from 'midtrans-client';

// Inisialisasi Snap API
export const snap = new midtransClient.Snap({
  isProduction: false, // Ingat, kita masih pakai Sandbox!
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});