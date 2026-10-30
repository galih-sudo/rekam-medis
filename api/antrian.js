import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 try{
  const today=new Date(); today.setHours(0,0,0,0)
  const data=await prisma.kunjungan.findMany({
    where:{ tanggal:{ gte: today } },
    include:{ pasien:true },
    orderBy:{ id:'asc' },
    take:100
  })
  const map=new Map()
  data.forEach(k=>{
    if(!k.pasien) return
    if(!map.has(k.pasienId)) map.set(k.pasienId,k)
  })
  const result=Array.from(map.values()).map((k,i)=>({
    id:k.id, pasienId:k.pasienId, no_antrian:i+1,
    nama:k.pasien.nama, no_rm:k.pasien.no_rm,
    pasien:k.pasien, tanggal:k.tanggal,
    keluhan:k.keluhan
  }))
  return res.status(200).json(result)
 }catch(e){ return res.status(500).json({error:e.message}) }
}
