import FormTambahKamar from '@/components/admin/FormTambahKamar';
import { supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server' 
import { redirect } from 'next/navigation'

// 1. Definisikan tipe data agar TypeScript mengerti
type Kamar = {
  id: string;
  nama_kamar: string;
  nomor_lantai: number;
  harga: number;
  created_at: string;
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    return redirect('/'); 
  }

  const { data: rawData, error } = await supabaseAdmin
    .from('kamar_lt1')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading data: {error.message}</div>
  }

  
  const rooms = rawData as Kamar[];

  return (
    <div className="p-8">

      <div className="mb-10 max-w-2xl">
         <FormTambahKamar />
      </div>

      <h2 className="text-2xl font-bold mb-6">Daftar Kamar (Direct Supabase)</h2>
      
      
      {!rooms || rooms.length === 0 ? (
        <p className="text-gray-500">Belum ada data kamar.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((item) => (
            <div key={item.id} className="border p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{item.nama_kamar}</h3>
                <p className="text-sm text-gray-500">Lantai {item.nomor_lantai}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-primary font-bold text-lg">
                   Rp {item.harga.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}