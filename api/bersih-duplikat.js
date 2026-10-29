import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    // Hapus pasien duplikat atas nama Endang Utami R, sisain yang id 3 (26-00077) yang udah bener
    const duplikat = await prisma.pasien.findMany({
      where: { nama: { contains: 'Endang Utami R' } },
      orderBy: { id: 'asc' }
    })
    
    if (duplikat.length > 1) {
      const keepId = duplikat[0].id // simpan yang pertama (id 3)
      const deleteIds = duplikat.slice(1).map(p => p.id)
      
      // hapus kunjungan yang pakai pasien duplikat
      await prisma.kunjungan.deleteMany({ where: { pasienId: { in: deleteIds } } })
      // hapus pasien duplikat
      await prisma.pasien.deleteMany({ where: { id: { in: deleteIds } } })
      
      return res.json({ success: true, message: `Hapus ${deleteIds.length} duplikat Endang, sisa id ${keepId}`, deleted: deleteIds })
    }
    
    return res.json({ success: true, message: 'Gak ada duplikat', data: duplikat })
  } catch(e){
    return res.status(500).json({ error: e.message })
  }
}
