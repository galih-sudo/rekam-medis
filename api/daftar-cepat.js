import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store')
  try{
    if(req.query.nuklir === '1'){
      const hp = req.query.no_hp || '082123456789'
      const all = await prisma.pasien.findMany({ where:{ nama:{ contains:'Endang' } }, orderBy:{ id:'asc' } })
      if(all.length > 1){
        const keep = all[0].id
        const del = all.slice(1).map(p=>p.id)
        await prisma.kunjungan.deleteMany({ where:{ pasienId:{ in: del } } })
        await prisma.pasien.deleteMany({ where:{ id:{ in: del } } })
        const fixed = await prisma.pasien.update({ where:{ id: keep }, data:{ no_hp: String(hp) } })
        return res.json({ success:true, message:`NUKLIR! ${del.length} ENDANG MATI! SISA ID ${keep}`, kept: fixed, deleted: del })
      } else if(all.length === 1){
        const fixed = await prisma.pasien.update({ where:{ id: all[0].id }, data:{ no_hp: String(hp) } })
        return res.json({ success:true, message:`Tinggal 1, HP di-fix jadi ${hp}`, kept: fixed })
      } else { return res.json({ message:'Gak ada Endang' }) }
    }
    return res.json({ info:'Pakai ?nuklir=1&no_hp=0821...' })
  }catch(e){ return res.status(500).json({ error:e.message }) }
}
// NUKLIR ENDANG 17 MATI 2026-10-29
