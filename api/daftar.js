import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  if(req.method!=='POST') return res.status(405).json({error:'POST only'})
  const { nama, hp, alamat, no_hp } = req.body
  const hpFinal = no_hp || hp
  if(!nama || !hpFinal || !alamat) return res.status(400).json({error:'Data tidak lengkap'})
  try{
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);
    const existing = await prisma.pasien.findFirst({
      where: { no_hp: hpFinal, created_at: { gte: startOfDay, lte: endOfDay } }
    });
    if(existing){
      return res.json({ success:true, no_rm: existing.no_rm, no_antrian: 1, existing:true })
    }
    const countToday = await prisma.pasien.count({
      where: { created_at: { gte: startOfDay, lte: endOfDay } }
    });
    const no_antrian = countToday + 1;
    if(no_antrian > 50) return res.status(400).json({error:'Kuota 50 penuh hari ini'});
    const countPasien = await prisma.pasien.count()
    const year = new Date().getFullYear().toString().slice(-2)
    const no_rm = `${year}-${String(countPasien + 1).padStart(5, '0')}`
    const p = await prisma.pasien.create({ 
      data: { no_rm, nama, no_hp: hpFinal, alamat } 
    })
    return res.json({ success:true, no_rm: p.no_rm, no_antrian })
  }catch(e){ 
    console.error(e);
    return res.status(500).json({error:e.message}) 
  }
}
