import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  
  try {
    // PAKAI FIELD YANG BENER SESUAI SCHEMA LU: tanggal, bukan createdAt
    const kunjungan = await prisma.kunjungan.findMany({
      where: {
        tanggal: {
          gte: new Date(new Date().setHours(0,0,0,0)) // hari ini aja
        }
      },
      include: { pasien: true },
      orderBy: { id: 'asc' } // id kecil = antrian pertama
    })

    const formatted = kunjungan.map((k, i) => ({
      id: k.id,
      no_antrian: i + 1,
      nomor: i + 1,
      nama: k.pasien?.nama || 'Pasien',
      no_rm: k.pasien?.no_rm || k.pasienId,
      pasien: k.pasien,
      kunjungan: k,
      status: 'MENUNGGU',
      tanggal: k.tanggal
    }))

    return res.status(200).json(formatted)
  } catch (e) {
    console.error('ANTRIAN ERROR:', e)
    return res.status(200).json([])
  }
}
