import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  try{
    // ambil pasien yang daftar hari ini aja
    const today = new Date()
    today.setHours(0,0,0,0)
    const data = await prisma.pasien.findMany({
      where:{ created_at: { gte: today } },
      orderBy:{ created_at: 'asc' }
    })
    // tambahin no_antrian
    const withAntrian = data.map((p,i)=>({ ...p, no_antrian: i+1 }))
    res.json(withAntrian)
  }catch(e){
    res.status(500).json({error:e.message})
  }
}
