import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  try{
    const today = new Date()
    today.setHours(0,0,0,0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate()+1)

    const totalPasien = await prisma.pasien.count()
    const totalKunjungan = await prisma.kunjungan.count()
    const hariIni = await prisma.kunjungan.count({ where:{ tanggal:{ gte: today, lt: tomorrow } } })

    const kunjungan7hari = await prisma.$queryRaw`
      SELECT DATE(tanggal) as tgl, COUNT(*)::int as jumlah
      FROM "Kunjungan"
      WHERE tanggal >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(tanggal)
      ORDER BY tgl ASC
    `

    const topDiagnosa = await prisma.kunjungan.groupBy({
      by:['diagnosa','icd10_code'],
      _count:{ diagnosa:true },
      orderBy:{ _count:{ diagnosa:'desc' } },
      take:5
    })

    const stokMenipis = await prisma.obat.findMany({ where:{ stok:{ lte: 10 } }, orderBy:{ stok:'asc' } })

    const obatLaku = await prisma.kunjungan.groupBy({
      by:['obat'],
      _count:{ obat:true },
      where:{ obat:{ not: null } },
      orderBy:{ _count:{ obat:'desc' } },
      take:5
    })

    res.json({ totalPasien, totalKunjungan, hariIni, kunjungan7hari, topDiagnosa, stokMenipis, obatLaku })
  }catch(e){ res.status(500).json({error:e.message}) }
}
