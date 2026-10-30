import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const totalPasien = await prisma.pasien.count()
    const totalKunjungan = await prisma.kunjungan.count()
    
    const today = new Date()
    today.setHours(0,0,0,0)
    const hariIni = await prisma.kunjungan.count({
      where: { tanggal: { gte: today } }
    })

    // Stok kritis
    let stokMenipis = []
    try {
      stokMenipis = await prisma.obat.findMany({
        where: { stok: { lte: 10 } },
        take: 10
      })
    } catch(e){ stokMenipis = [] }

    // 7 hari terakhir
    const kunjungan7hari = []
    for(let i=6;i>=0;i--){
      const d = new Date()
      d.setDate(d.getDate()-i)
      d.setHours(0,0,0,0)
      const d2 = new Date(d)
      d2.setHours(23,59,59,999)
      const jumlah = await prisma.kunjungan.count({
        where: { tanggal: { gte: d, lte: d2 } }
      })
      kunjungan7hari.push({ tgl: d.toISOString(), jumlah })
    }

    return res.status(200).json({
      totalPasien,
      hariIni,
      totalKunjungan,
      stokMenipis,
      kunjungan7hari
    })
  } catch(e){
    console.error('LAPORAN ERROR:', e)
    return res.status(500).json({ error: e.message })
  }
}
