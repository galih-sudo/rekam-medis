import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  if(req.method!=='GET') return res.status(405).json({error:'GET only'})
  try{
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);
    const list = await prisma.pasien.findMany({
      where: { created_at: { gte: startOfDay, lte: endOfDay } },
      orderBy: { created_at: 'asc' }
    })
    return res.json({ total: list.length, data: list })
  }catch(e){
    return res.status(500).json({error: e.message})
  }
}
