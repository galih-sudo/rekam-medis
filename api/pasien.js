import { PrismaClient } from '@prisma/client'
const g=globalThis; const prisma=g.prisma||new PrismaClient(); if(process.env.NODE_ENV!=='production')g.prisma=prisma
export default async function handler(req,res){res.setHeader('Cache-Control','no-store'); const data=await prisma.pasien.findMany({orderBy:{id:'desc'},take:100}); return res.json(data)}
