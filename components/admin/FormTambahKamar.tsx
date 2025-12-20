"use client"

import { createKamar } from "@/app/actions/kamarActions"
import { useRef } from "react"
// useFormStatus harus dipakai di dalam komponen anak (tombolnya dipisah)
import { useFormStatus } from "react-dom"

// Komponen Tombol Submit Khusus (agar bisa loading state)
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400"
    >
      {pending ? "Menyimpan..." : "Simpan Data Kamar"}
    </button>
  )
}

export default function FormTambahKamar() {
  const ref = useRef<HTMLFormElement>(null)

  return (
    <>
    <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Tambah Kamar Baru</h3>
      
      <form 
        ref={ref}
        action={async (formData) => {
          await createKamar(formData)
          ref.current?.reset() // Reset form setelah berhasil submit
          alert("Data berhasil disimpan!") // Feedback sederhana
        }}
        className="space-y-4"
      >
        {/* Input Nama Kamar */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nama Kamar
          </label>
          <input
            name="nama_kamar"
            type="text"
            required
            placeholder="Kamar (nomor)"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Input Nomor Lantai */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Lantai
            </label>
            <input
              name="nomor_lantai"
              type="number"
              required
              placeholder="1"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Input Harga */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Harga (Rp)
            </label>
            <input
              name="harga"
              type="number"
              required
              placeholder="500000"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-2">
            <SubmitButton />
        </div>
      </form>
    </div>
    </>
  )
}