export async function sendWhatsApp(target: string, message: string) {
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    console.error("GAGAL: FONNTE_TOKEN belum diatur di file .env");
    return false;
  }

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        countryCode: "62", // Memastikan nomor format 08... akan otomatis dikonversi ke 628...
      }),
    });

    const data = await response.json();
    
    if (data.status) {
      console.log(`Berhasil mengirim WA ke ${target}`);
      return true;
    } else {
      console.error(`Gagal mengirim WA ke ${target}:`, data.reason);
      return false;
    }
  } catch (error) {
    console.error("Error saat menghubungi server Fonnte:", error);
    return false;
  }
}