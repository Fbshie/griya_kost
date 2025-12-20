'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createKamar(formData: FormData) {
  // 1. Ambil data dari input form
  const namaKamar = formData.get('nama_kamar') as string
  const nomorLantai = formData.get('nomor_lantai')
  const harga = formData.get('harga')

  // 2. Validasi sederhana
  if (!namaKamar || !nomorLantai || !harga) {
    throw new Error("Semua field harus diisi!")
  }

  // 3. Simpan ke Supabase (Table: kamar_lt1)
  // Ingat: nomor_lantai dan harga harus di-convert jadi Number/Int
  const { error } = await supabaseAdmin
    .from('kamar_lt1')
    .insert({
      nama_kamar: namaKamar,
      nomor_lantai: Number(nomorLantai), 
      harga: Number(harga),
    })

  if (error) {
    console.error("Error Insert:", error)
    throw new Error("Gagal menyimpan data kamar")
  }

  // 4. Refresh halaman Admin Panel agar data baru langsung muncul
  revalidatePath('/admin-panel')
  
  // Opsional: Redirect atau biarkan di halaman itu
  // redirect('/admin-panel') 
}