import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.query.bersih === '1') {
      const all = await prisma.pasien.findMany({ where: { nama: { contains: 'Endang Utami' } }, orderBy: { id: 'asc' } })
      if (all.length > 1) {
        const keep = all[0].id
        const del = all.slice(1).map(p=>p.id)
        await prisma.kunjungan.deleteMany({ where: { pasienId: { in: del } } })
        await prisma.pasien.deleteMany({ where: { id: { in: del } } })
        return res.json({ success: true, message: `HAPUS ${del.length} KEMBAR ENDANG! SISA 1 ID ${keep}`, deleted: del })
      }
      return res.json({ message: 'Udah bersih, tinggal 1' })
    }
    if (req.query.fix) {
      const id = parseInt(req.query.fix)
      const p = await prisma.pasien.update({ where: { id }, data: { no_hp: req.query.no_hp } })
      return res.json({ success: true, pasien: p })
    }
    return res.json({ info: 'pakai ?bersih=1' })
  } catch(e){ return res.status(500).json({ error: e.message }) }
}
