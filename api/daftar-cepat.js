import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    // BERSIHKAN - CUKUP BUKA SEKALI AJA!
    const all = await prisma.pasien.findMany({
      where: { nama: { contains: 'Endang' } },
      orderBy: { id: 'asc' }
    })

    if (all.length <= 1) {
      return res.json({ message: 'Udah bersih bro, tinggal '+all.length, data: all })
    }

    const keepId = all[0].id // SIMPAN YANG PALING TUA #3
    const delIds = all.slice(1).map(p => p.id) // HAPUS SISANYA #4-#9

    await prisma.kunjungan.deleteMany({ where: { pasienId: { in: delIds } } })
    await prisma.pasien.deleteMany({ where: { id: { in: delIds } } })

    return res.json({
      success: true,
      message: `BERHASIL! Hapus ${delIds.length} setan belang Endang! Sisa 1 id ${keepId}`,
      kept: all[0],
      deletedIds: delIds
    })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
