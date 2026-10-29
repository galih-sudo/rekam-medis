import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const nama = req.query.nama || 'Endang Utami R'
    const count = await prisma.pasien.count()
    const no_rm = `26-${String(count + 1 + Date.now()%100).padStart(5,'0')}`
    
    const pasien = await prisma.pasien.create({
      data: { no_rm, nama, no_hp: '081', alamat: 'Mataram' }
    })
    
    const kunjungan = await prisma.kunjungan.create({
      data: { pasienId: pasien.id, tanggal: new Date(), keluhan: 'Daftar cepat', diagnosa: '-', terapi: '-' }
    })
    
    return res.status(200).json({ 
      success: true, 
      message: `${nama} BERHASIL MASUK ANTRIAN!`,
      pasien, kunjungan,
      cek_antrian: '/api/antrian'
    })
  } catch(e){
    return res.status(500).json({ error: e.message })
  }
}
