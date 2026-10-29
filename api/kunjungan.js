import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  if(req.method==='OPTIONS') return res.status(200).end()
  
  try{
    if(req.method==='GET'){
      const no_rm = req.query.no_rm
      if(!no_rm) {
        // kalau gak ada no_rm, balikin semua kunjungan hari ini buat antrian
        const today = new Date()
        today.setHours(0,0,0,0)
        const all = await prisma.kunjungan.findMany({
          where: { tanggal: { gte: today } },
          include: { pasien: true },
          orderBy: { id: 'asc' }
        })
        return res.json(all)
      }
      const pasien = await prisma.pasien.findUnique({ 
        where:{ no_rm }, 
        include:{ kunjungan:{ orderBy:{ tanggal:'desc' } } } 
      })
      if(!pasien) return res.status(404).json({error:'Pasien tidak ditemukan'})
      return res.json(pasien)
    }

    if(req.method==='POST'){
      const b = req.body

      // 1. CARI ATAU BIKIN PASIEN BARU - INI KUNCI BIAR DAFTAR KE-2 DST BISA!
      let pasien = await prisma.pasien.findUnique({ where:{ no_rm: b.no_rm } })
      
      if(!pasien) {
        // AUTO CREATE PASIEN BARU (UNTUK DAFTAR ONLINE)
        try {
          pasien = await prisma.pasien.create({
            data: {
              no_rm: b.no_rm || `RM-${Date.now().toString().slice(-6)}`,
              nama: b.nama || b.nama_pasien || 'Pasien Baru',
              no_hp: b.no_hp || b.no_telp || '',
              alamat: b.alamat || '',
              nik: b.nik || null,
            }
          })
        } catch (e) {
          // kalau no_rm duplikat karena race condition
          if (e.code === 'P2002') {
            pasien = await prisma.pasien.findUnique({ where:{ no_rm: b.no_rm } })
            if(!pasien) throw e
          } else throw e
        }
      }

      // 2. BIKIN KUNJUNGAN - KASIH DEFAULT BIAR GAK ERROR NOT NULL (sesuai schema lu)
      const kun = await prisma.kunjungan.create({
        data:{
          pasienId: pasien.id,
          tanggal: new Date(),
          keluhan: b.keluhan || 'Daftar antrian online',
          lama_sakit: b.lama_sakit || null,
          riwayat_alergi: b.riwayat_alergi || null,
          riwayat_penyakit: b.riwayat_penyakit || null,
          tensi: b.tensi || null,
          suhu: b.suhu?parseFloat(b.suhu):null,
          nadi: b.nadi?parseInt(b.nadi):null,
          rr: b.rr?parseInt(b.rr):null,
          bb: b.bb?parseFloat(b.bb):null,
          spo2: b.spo2?parseInt(b.spo2):null,
          pemeriksaan_fisik: b.pemeriksaan_fisik || null,
          diagnosa: b.diagnosa || '-',  // WAJIB ADA
          icd10_code: b.icd10_code || null,
          icd10_nama: b.icd10_nama || null,
          terapi: b.terapi || '-',      // WAJIB ADA
          obat: b.obat || null,
          obatId: b.obatId?parseInt(b.obatId):null,
          qty_obat: b.qty_obat?parseInt(b.qty_obat):1,
          edukasi: b.edukasi || null,
          kontrol: b.kontrol?new Date(b.kontrol):null
        }
      })

      if(b.obatId && b.qty_obat){
        await prisma.obat.update({ 
          where:{id:parseInt(b.obatId)}, 
          data:{ stok:{ decrement: parseInt(b.qty_obat) } } 
        }).catch(()=>{})
      }

      return res.json({ success:true, data: kun, pasien })
    }

    return res.status(405).json({error:'Method not allowed'})

  }catch(e){ 
    console.error('KUNJUNGAN ERROR:', e)
    return res.status(500).json({error:e.message, detail: e.stack}) 
  }
}
