import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  if(req.method!=='POST') return res.status(405).json({error:'POST only'})
  const { nama, hp, alamat } = req.body
  const no_rm = 'RM-'+Date.now().toString().slice(-6)
  try{
    const p = await prisma.pasien.create({ data: { no_rm, nama, no_hp: hp, alamat } })
    return res.json({ success:true, no_rm: p.no_rm })
  }catch(e){ return res.status(500).json({error:e.message}) }
}
