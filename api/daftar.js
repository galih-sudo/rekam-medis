import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  if(req.method!=='POST') return res.status(405).json({error:'POST only'})
  
  const { nama, hp, alamat, no_hp } = req.body
  const hpFinal = no_hp || hp
  if(!nama || !hpFinal || !alamat) return res.status(400).json({error:'Data tidak lengkap'})
  
  const no_rm = 'RM-'+Date.now().toString().slice(-6)
  
  try{
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

    // cegah double daftar no hp sama hari ini
    const existing = await prisma.pasien.findFirst({
      where: { no_hp: hpFinal, created_at: { gte: startOfDay, lte: endOfDay } }
    });
    if(existing){
      return res.json({ success:true, no_rm: existing.no_rm, no_antrian: existing.no_antrian || existing.id, existing:true })
    }

    const countToday = await prisma.pasien.count({
      where: { created_at: { gte: startOfDay, lte: endOfDay } }
    });
    
    const no_antrian = countToday + 1;
    if(no_antrian > 50) return res.status(400).json({error:'Kuota 50 penuh hari ini'});

    const p = await prisma.pasien.create({ 
      data: { no_rm, nama, no_hp: hpFinal, alamat, no_antrian } 
    })
    return res.json({ success:true, no_rm: p.no_rm, no_antrian: p.no_antrian })
  }catch(e){ 
    console.error(e);
    return res.status(500).json({error:e.message}) 
  }
}
