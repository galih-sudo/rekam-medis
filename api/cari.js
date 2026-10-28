import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  const q = (req.query.q || '').toString().trim()
  if(!q) return res.json({data:[]})
  try{
    const data = await prisma.pasien.findMany({
      where: {
        OR: [
          { nama: { contains: q, mode: 'insensitive' } },
          { no_rm: { contains: q, mode: 'insensitive' } },
          { no_hp: { contains: q } },
          { alamat: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { created_at: 'desc' },
      take: 50
    })
    return res.json({total: data.length, data})
  }catch(e){
    return res.status(500).json({error:e.message})
  }
}
