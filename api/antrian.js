import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const data = await prisma.kunjungan.findMany({
      include: { pasien: true },
      orderBy: { id: 'asc' }, // yang daftar pertama = #1
      take: 100
    })

    // GROUP BY pasienId - 1 PASIEN CUMA 1 ANTRIAN!
    const map = new Map()
    data.forEach(k => {
      if (!k.pasien) return
      if (!map.has(k.pasienId)) {
        map.set(k.pasienId, k)
      }
    })

    const result = Array.from(map.values()).map((k,i)=>({
      id: k.id,
      pasienId: k.pasienId,
      no_antrian: i+1,
      nama: k.pasien.nama,
      no_rm: k.pasien.no_rm,
      pasien: k.pasien,
      tanggal: k.tanggal
    }))

    return res.status(200).json(result)
  } catch(e){
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
