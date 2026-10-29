import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  // ANTI CACHE - INI KUNCINYA BRO!
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  try {
    const today = new Date()
    today.setHours(0,0,0,0)
    
    const antrian = await prisma.antrian.findMany({
      where: {
        tanggal: { gte: today }
      },
      include: { pasien: true, kunjungan: true },
      orderBy: { nomor: 'asc' }
    })
    
    // KALO ANTRIAN KOSONG TAPI KUNJUNGAN ADA HARI INI, AUTO BIKIN ANTRIAN DARI KUNJUNGAN
    if (antrian.length === 0) {
      const kunjunganHariIni = await prisma.kunjungan.findMany({
        where: { tanggal: { gte: today } },
        include: { pasien: true }
      })
      
      // balikin kunjungan sebagai antrian fallback
      return res.status(200).json(kunjunganHariIni.map((k,i)=>({
        id: k.id,
        nomor: i+1,
        pasien: k.pasien,
        kunjungan: k,
        status: k.status || 'MENUNGGU',
        tanggal: k.tanggal
      })))
    }

    res.status(200).json(antrian)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}
