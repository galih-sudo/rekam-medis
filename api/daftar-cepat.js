import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    // JIKA ADA ?bersih=1 → HAPUS DUPLIKAT ENDANG
    if (req.query.bersih === '1') {
      const duplikat = await prisma.pasien.findMany({
        where: { nama: { contains: 'Endang Utami' } },
        orderBy: { id: 'asc' }
      })
      if (duplikat.length > 1) {
        const keepId = duplikat[0].id
        const deleteIds = duplikat.slice(1).map(p => p.id)
        await prisma.kunjungan.deleteMany({ where: { pasienId: { in: deleteIds } } })
        await prisma.pasien.deleteMany({ where: { id: { in: deleteIds } } })
        return res.json({ success: true, message: `Berhasil hapus duplikat, sisa id ${keepId}`, deleted: deleteIds, kept: keepId })
      }
      return res.json({ message: 'Gak ada duplikat', data: duplikat })
    }

    // JIKA ADA ?fix=3&no_hp=... → FIX HP
    if (req.query.fix) {
      const id = parseInt(req.query.fix)
      const pasien = await prisma.pasien.update({
        where: { id },
        data: { no_hp: req.query.no_hp || '', alamat: req.query.alamat || 'Mataram' }
      })
      return res.json({ success: true, message: `HP ${pasien.nama} jadi ${pasien.no_hp}`, pasien })
    }

    // Default daftar cepat (biar gak error)
    return res.json({ info: 'pakai ?bersih=1 buat hapus duplikat Endang, atau ?fix=3&no_hp=0821...' })
    
  } catch(e){
    return res.status(500).json({ error: e.message, stack: e.stack })
  }
}
