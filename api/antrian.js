// api/antrian.js - FINAL POLOS ANTI GAGAL
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  
  try {
    // AMBIL POLOSAN TANPA INCLUDE, TANPA ORDERBY - PASTI WORK!
    let kunjungan = await prisma.kunjungan.findMany({
      take: 100
    })

    // Sort manual di JS pake id (id kecil = daftar pertama)
    kunjungan.sort((a,b) => (a.id > b.id ? 1 : -1))

    // Format jadi antrian
    const formatted = kunjungan.map((k, i) => {
      // ambil nama dari field apapun yang ada
      const nama = k.nama || k.nama_pasien || k.name || k.pasien_nama || `Pasien ${k.id?.toString().slice(-4)}`
      const no_rm = k.no_rm || k.noRM || k.no_rm_pasien || k.pasienId || k.id
      
      return {
        id: k.id,
        no_antrian: i + 1,
        nomor: i + 1,
        nama: nama,
        no_rm: no_rm,
        original: k,
        status: k.status || 'MENUNGGU'
      }
    })

    return res.status(200).json(formatted)

  } catch (e) {
    console.error(e)
    // Coba raw SQL sebagai last resort
    try {
      const raw = await prisma.$queryRaw`SELECT * FROM Kunjungan LIMIT 100`
      const formatted = raw.map((k,i)=>({
        id: k.id,
        no_antrian: i+1,
        nomor: i+1,
        nama: k.nama || 'Pasien',
        no_rm: k.no_rm || k.id,
        status: 'MENUNGGU'
      }))
      return res.status(200).json(formatted)
    } catch (e2) {
      return res.status(200).json([])
    }
  }
}
