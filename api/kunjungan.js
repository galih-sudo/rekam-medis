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
      const b = req.body
      const pasien = await prisma.pasien.findUnique({ where:{ no_rm: b.no_rm } })
      if(!pasien) return res.status(404).json({error:'Pasien tidak ditemukan'})
      const kun = await prisma.kunjungan.create({
        data:{
          pasienId: pasien.id,
          keluhan: b.keluhan,
          lama_sakit: b.lama_sakit,
          riwayat_alergi: b.riwayat_alergi,
          riwayat_penyakit: b.riwayat_penyakit,
          tensi: b.tensi,
          suhu: b.suhu?parseFloat(b.suhu):null,
          nadi: b.nadi?parseInt(b.nadi):null,
          rr: b.rr?parseInt(b.rr):null,
          bb: b.bb?parseFloat(b.bb):null,
          spo2: b.spo2?parseInt(b.spo2):null,
          pemeriksaan_fisik: b.pemeriksaan_fisik,
          diagnosa: b.diagnosa,
          icd10_code: b.icd10_code,
          icd10_nama: b.icd10_nama,
          terapi: b.terapi,
          obat: b.obat,
          obatId: b.obatId?parseInt(b.obatId):null,
          qty_obat: b.qty_obat?parseInt(b.qty_obat):1,
          edukasi: b.edukasi,
          kontrol: b.kontrol?new Date(b.kontrol):null
        }
      })
      if(b.obatId && b.qty_obat){
        await prisma.obat.update({ where:{id:parseInt(b.obatId)}, data:{ stok:{ decrement: parseInt(b.qty_obat) } } })
      }
      return res.json({ success:true, data: kun })
    }
  }catch(e){ return res.status(500).json({error:e.message}) }
}
