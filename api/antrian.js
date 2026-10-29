// api/antrian.js - ANTI AIDS & ANTI CACHE VERSION
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req, res) {
  // 1. MATIKAN CACHE VERCEL TOTAL!
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const today = new Date()
    today.setHours(0,0,0,0)

    // 2. COBA AMBIL DARI TABEL ANTRIAN DULU
    let antrian = []
    try {
      antrian = await prisma.antrian.findMany({
        where: { tanggal: { gte: today } },
        include: { pasien: true, kunjungan: { include: { pasien: true } } },
        orderBy: { nomor: 'asc' }
      })
    } catch (e) {
      console.log('Tabel antrian belum ada, fallback ke kunjungan:', e.message)
    }

    // 3. KALO ANTRIAN KOSONG, FALLBACK KE KUNJUNGAN HARI INI (INI KUNCI BIAR DAFTAR ONLINE LANGSUNG MUNCUL!)
    if (antrian.length === 0) {
      const kunjungan = await prisma.kunjungan.findMany({
        where: { 
          tanggal: { gte: today }
        },
        include: { pasien: true },
        orderBy: { createdAt: 'asc' }
      })

      // Format jadi kayak antrian biar kompatibel sama antrian.html lu
      const formatted = kunjungan.map((k, i) => ({
        id: k.id,
        no_antrian: i + 1,
        nomor: i + 1,
        no: i + 1,
        nama: k.pasien?.nama || k.nama || 'Pasien',
        no_rm: k.pasien?.no_rm || k.pasien?.noRM || k.no_rm || k.id,
        pasien: k.pasien,
        kunjungan: k,
        status: k.status || 'MENUNGGU',
        tanggal: k.tanggal
      }))

      return res.status(200).json(formatted)
    }

    // 4. KALO ANTRIAN ADA, FORMAT JUGA BIAR KOMPATIBEL
    const formatted = antrian.map((a, i) => ({
      id: a.id,
      no_antrian: a.nomor || a.no_antrian || i+1,
      nomor: a.nomor || i+1,
      nama: a.pasien?.nama || a.kunjungan?.pasien?.nama || a.kunjungan?.nama || 'Pasien',
      no_rm: a.pasien?.no_rm || a.kunjungan?.pasien?.no_rm || a.id,
      pasien: a.pasien || a.kunjungan?.pasien,
      kunjungan: a.kunjungan,
      status: a.status,
      tanggal: a.tanggal
    }))

    return res.status(200).json(formatted)

  } catch (error) {
    console.error('API ANTRIAN ERROR:', error)
    return res.status(500).json({ error: error.message, stack: error.stack })
  }
}
