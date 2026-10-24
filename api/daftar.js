import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end()
  const {nama,hp,alamat} = req.body

  // Auto RM 260001, 260002, dst
  const last = await prisma.pasien.findFirst({orderBy:{no_rm:'desc'}})
  let nextNo = '260001'
  if(last) nextNo = String(parseInt(last.no_rm)+1)

  const pasien = await prisma.pasien.create({
    data:{no_rm:nextNo, nama, hp, alamat}
  })
  res.json(pasien)
}
