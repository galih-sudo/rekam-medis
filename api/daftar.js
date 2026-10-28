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

        // cegah double daftar hp sama hari ini
        const existingPasien = await prisma.pasien.findFirst({
          where: { no_hp: hpFinal }
        });

        if(existingPasien){
          const existingDaftar = await prisma.pendaftaran.findFirst({
            where: { pasienId: existingPasien.id, created_at: { gte: startOfDay, lte: endOfDay } }
          });
          if(existingDaftar){
            return res.json({ success:true, no_rm: existingPasien.no_rm, no_antrian: existingDaftar.no_antrian, existing:true })
          }
        }

        const countToday = await prisma.pendaftaran.count({
          where: { created_at: { gte: startOfDay, lte: endOfDay } }
        });

        const no_antrian = countToday + 1;
        if(no_antrian > 50) return res.status(400).json({error:'Kuota 50 penuh hari ini'});

        // No RM 26-00001 urut
        const countPasien = await prisma.pasien.count()
        const year = new Date().getFullYear().toString().slice(-2)
        const no_rm = `${year}-${String(countPasien + 1).padStart(5, '0')}`

        const pasien = existingPasien || await prisma.pasien.create({
          data: { no_rm, nama, no_hp: hpFinal, alamat }
        })

        const daftar = await prisma.pendaftaran.create({
          data: { pasienId: pasien.id, no_antrian, status: 'MENUNGGU' }
        })

        return res.json({ success:true, no_rm: pasien.no_rm, no_antrian: daftar.no_antrian })
      }catch(e){
        console.error(e);
        return res.status(500).json({error:e.message})
      }
}
