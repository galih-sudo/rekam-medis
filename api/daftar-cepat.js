import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store')
  try{
    // BOM NUKLIR: ?nuklir=1&no_hp=0821....
    if(req.query.nuklir === '1'){
      const hp = req.query.no_hp || '082123456789'
      // 1. Ambil semua Endang
      const all = await prisma.pasien.findMany({ where:{ nama:{ contains:'Endang' } }, orderBy:{ id:'asc' } })
      if(all.length > 1){
        const keep = all[0].id
        const del = all.slice(1).map(p=>p.id)
        await prisma.kunjungan.deleteMany({ where:{ pasienId:{ in: del } } })
        await prisma.pasien.deleteMany({ where:{ id:{ in: del } } })
        // 2. Fix HP yang disisain
        const fixed = await prisma.pasien.update({ where:{ id: keep }, data:{ no_hp: String(hp) } })
        return res.json({ success:true, message:`NUKLIR MELEDAK! ${del.length} ENDANG MATI! SISA 1 ID ${keep} HP JADI ${hp}`, kept: fixed, deleted: del })
      } else if(all.length === 1){
        const fixed = await prisma.pasien.update({ where:{ id: all[0].id }, data:{ no_hp: String(hp) } })
        return res.json({ success:true, message:`Udah 1 doang, tinggal fix HP jadi ${hp}`, kept: fixed })
      } else {
        return res.json({ message:'Gak ada Endang' })
      }
    }
    return res.json({ cara:'Pake ?nuklir=1&no_hp=0821... - SEKALI AJA JANGAN SPAM!' })
  }catch(e){ return res.status(500).json({ error:e.message }) }
}
