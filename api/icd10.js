import { PrismaClient } from '@prisma/client'
const g=globalThis; const prisma=g.prisma||new PrismaClient(); if(process.env.NODE_ENV!=='production')g.prisma=prisma
export default async function handler(req,res){res.setHeader('Cache-Control','no-store'); try{if(req.method==='GET'){const d=await prisma.iCD10.findMany({orderBy:{kode:'asc'}}); return res.json(d)} if(req.method==='POST'){const {kode,nama,kategori}=req.body; const d=await prisma.iCD10.create({data:{kode,nama,kategori}}); return res.json(d)}}catch(e){return res.status(500).json({error:e.message})}}
