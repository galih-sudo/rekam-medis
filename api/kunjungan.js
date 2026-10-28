import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  if(req.method==='OPTIONS') return res.status(200).end()
  try{
    if(req.method==='GET'){
      const no_rm = req.query.no_rm
      const pasien = await prisma.pasien.findUnique({ where:{ no_rm }, include:{ kunjungan:{ orderBy:{ tanggal:'desc' } } } })
      if(!pasien) return res.status(404).json({error:'Pasien tidak ditemukan'})
      return res.json(pasien)
    }
    if(req.method==='POST'){
      const { no_rm, keluhan, diagnosa, icd10_code, icd10_nama, terapi, obat, obatId, qty_obat } = req.body
      const pasien = await prisma.pasien.findUnique({ where:{ no_rm } })
      if(!pasien) return res.status(404).json({error:'Pasien tidak ditemukan'})
      const kun = await prisma.kunjungan.create({
        data:{ pasienId: pasien.id, keluhan, diagnosa, icd10_code, icd10_nama, terapi, obat, obatId: obatId?parseInt(obatId):null, qty_obat: qty_obat?parseInt(qty_obat):1 }
      })
      if(obatId && qty_obat){
        await prisma.obat.update({ where:{id:parseInt(obatId)}, data:{ stok:{ decrement: parseInt(qty_obat) } } })
      }
      return res.json({ success:true, data: kun })
    }
  }catch(e){ return res.status(500).json({error:e.message}) }
}
