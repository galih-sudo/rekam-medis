import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  const q = (req.query.q || '').toString()
  const data = await prisma.iCD10.findMany({
    where: q ? { OR: [{code:{contains:q, mode:'insensitive'}}, {nama:{contains:q, mode:'insensitive'}}] } : {},
    take: 10
  })
  res.json(data)
}
