import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  if(req.method==='GET'){
    const data = await prisma.obat.findMany({orderBy:{nama:'asc'}})
    return res.json(data)
  }
  if(req.method==='POST'){
    const {nama, stok, satuan} = req.body
    const data = await prisma.obat.upsert({where:{nama}, update:{stok:{increment: parseInt(stok)}}, create:{nama, stok:parseInt(stok), satuan}})
    return res.json(data)
  }
}
