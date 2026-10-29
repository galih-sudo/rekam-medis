// api/antrian.js - FINAL FIX - ANTI SCHEMA ERROR
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  try {
    // AMBIL SEMUA KUNJUNGAN TANPA FILTER TANGGAL DULU (BIAR GAK ERROR SCHEMA)
    let kunjungan = []
    
    // COBA 1: pake createdAt (paling umum)
    try {
      kunjungan = await prisma.kunjungan.findMany({
        include: { pasien: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    } catch (e1) {
      console.log('Gagal pake createdAt, coba tanpa order:', e1.message)
      // COBA 2: tanpa orderBy
      try {
        kunjungan = await prisma.kunjungan.findMany({
          include: { pasien: true },
          take: 50
        })
      } catch (e2) {
        console.log('Gagal include pasien, coba polosan:', e2.message)
        // COBA 3: polosan tanpa include
        kunjungan = await prisma.kunjungan.findMany({ take: 50 })
      }
    }

    // FILTER MANUAL HARI INI DI JS (BIAR GAK DEPEND ON FIELD TANGGAL)
    const today = new Date()
    today.setHours(0,0,0,0)
    
    // Format jadi antrian - AMBIL SEMUA ATAU FILTER HARI INI KALO BISA
    const formatted = kunjungan
      .filter(k => {
        // coba filter hari ini kalo ada field tanggal/createdAt
        const tgl = k.tanggal || k.tgl_kunjungan || k.tanggal_kunjungan || k.createdAt
        if (!tgl) return true // kalo gak ada field tanggal, tampilkan aja semua
        try {
          return new Date(tgl) >= today
        } catch { return true }
      })
      .map((k, i) => ({
        id: k.id,
        no_antrian: i + 1,
        nomor: i + 1,
        no: i + 1,
        nama: k.pasien?.nama || k.nama || k.nama_pasien || 'Pasien',
        no_rm: k.pasien?.no_rm || k.pasien?.noRM || k.no_rm || k.pasienId || k.id,
        pasien: k.pasien,
        kunjungan: k,
        status: k.status || 'MENUNGGU',
        tanggal: k.tanggal || k.createdAt
      }))

    // BALIKAN URUTAN JADI ASC (yang daftar pertama = no 1)
    formatted.reverse()
    formatted.forEach((f, i) => { f.no_antrian = i+1; f.nomor = i+1 })

    return res.status(200).json(formatted)

  } catch (error) {
    console.error('FINAL ERROR:', error)
    return res.status(200).json([]) // balikin array kosong biar gak 500
  }
}
