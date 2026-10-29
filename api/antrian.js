import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const totalPasien = await prisma.pasien.count()
    const totalKunjungan = await prisma.kunjungan.count()
    
    const data = await prisma.kunjungan.findMany({
      include: { pasien: true },
      orderBy: { id: 'desc' },
      take: 50
    })

    // JANGAN DI GROUP DULU - LIATIN SEMUA APA ADANYA!
    const result = data.reverse().map((k,i)=>({
      id: k.id,
      no_antrian: i+1,
      nama: k.pasien?.nama || 'TANPA NAMA',
      no_rm: k.pasien?.no_rm || 'TANPA RM',
      pasien: k.pasien,
      _debug_total_pasien: totalPasien,
      _debug_total_kunjungan: totalKunjungan
    }))

    return res.status(200).json(result)
  } catch(e){
    return res.status(500).json({ error: e.message, total: 0 })
  }
}
