import { PrismaClient } from '@prisma/client'
const g=globalThis; const prisma=g.prisma||new PrismaClient(); if(process.env.NODE_ENV!=='production')g.prisma=prisma
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 try{
  if(req.method==='GET'){
    const {pasienId}=req.query
    const data=await prisma.kunjungan.findMany({where:{pasienId:parseInt(pasienId)||0},orderBy:{tanggal:'desc'},take:20,include:{pasien:true}})
    return res.json(data)
  }
  if(req.method==='POST'){
    const {pasienId,subjective,objective,assessment,plan,obat,diagnosa}=req.body
    const kunj=await prisma.kunjungan.create({data:{
      pasienId:parseInt(pasienId),
      tanggal:new Date(),
      keluhan:subjective||'',
      diagnosa:diagnosa||assessment||'',
      tindakan:plan||'',
      catatan:JSON.stringify({subjective,objective,assessment,plan,obat})
    }})
    return res.json(kunj)
  }
 }catch(e){return res.status(500).json({error:e.message})}
}
