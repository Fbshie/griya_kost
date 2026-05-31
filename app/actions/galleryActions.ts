'use server'

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function addGalleryItem(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !title) {
      return { success: false, error: "Foto dan Judul wajib diisi!" };
    }

    // 1. Generate nama file unik agar tidak bentrok (contoh: 16812345-abcde.jpg)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // 2. Upload gambar ke Supabase Storage (Pastikan Anda sudah membuat bucket 'galeri_kost')
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('galeri_kost')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // 3. Dapatkan URL publik gambar yang baru diupload
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('galeri_kost')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // 4. Simpan data (URL, judul, deskripsi) ke tabel galleries
    const { error: dbError } = await supabaseAdmin
      .from('galleries')
      .insert([
        {
          title: title,
          description: description,
          image_url: imageUrl
        }
      ]);

    if (dbError) throw dbError;

    // Refresh halaman Admin dan Homepage agar galeri baru langsung muncul
    revalidatePath('/admin-panel');
    revalidatePath('/'); 

    return { success: true };
  } catch (error: any) {
    console.error("Gagal menambah galeri:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem saat upload." };
  }
}

export async function deleteGalleryItem(id: string, imageUrl: string) {
  try {
    // 1. Ekstrak nama file dari URL publik Supabase
    // Contoh URL: https://xyz.supabase.co/storage/v1/object/public/galeri_kost/168-abc.jpg
    const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

    // 2. Hapus file fisik dari Supabase Storage
    if (fileName) {
      const { error: storageError } = await supabaseAdmin
        .storage
        .from('galeri_kost')
        .remove([fileName]);
        
      if (storageError) console.error("Gagal menghapus file di storage:", storageError);
    }

    // 3. Hapus data dari tabel galleries
    const { error: dbError } = await supabaseAdmin
      .from('galleries')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Refresh halaman agar gambar langsung hilang dari layar
    revalidatePath('/admin-panel/galeri');
    revalidatePath('/'); 

    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus galeri:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat menghapus." };
  }
}