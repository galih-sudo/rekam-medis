// api/daftar.js - FINAL FIX DAFTAR ONLINE = PASIEN + KUNJUNGAN = ANTRIAN LANGSUNG NAMBAH!
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'POST') {
      const b = req.body
      console.log('DAFTAR MASUK:', b)

      // 1. GENERATE NO RM OTOMATIS
      let no_rm = b.no_rm
      if (!no_rm || no_rm.trim() === '') {
        const count = await prisma.pasien.count()
        no_rm = `26-${String(count + 1).padStart(5, '0')}`
      }

      // 2. CEK ATAU BIKIN PASIEN
      let pasien = await prisma.pasien.findUnique({ where: { no_rm } })
      
      if (!pasien) {
        pasien = await prisma.pasien.create({
          data: {
            no_rm: no_rm,
            nama: b.nama || b.nama_pasien || 'Pasien Baru',
            no_hp: b.no_hp || b.hp || b.no_telp || '',
            alamat: b.alamat || '',
            nik: b.nik || null,
            tgl_lahir: b.tgl_lahir ? new Date(b.tgl_lahir) : null,
          }
        })
      }

      // 3. BIKIN KUNJUNGAN - INI YANG BIKIN ANTRIAN BERTAMBAH!
      const kunjungan = await prisma.kunjungan.create({
        data: {
          pasienId: pasien.id,
          tanggal: new Date(),
          keluhan: b.keluhan || 'Daftar antrian online',
          diagnosa: '-',
          terapi: '-',
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Berhasil daftar antrian',
        pasien,
        kunjungan,
        no_antrian: kunjungan.id
      })
    }

    // GET buat debug
    if (req.method === 'GET') {
      const all = await prisma.kunjungan.findMany({
        include: { pasien: true },
        orderBy: { id: 'desc' },
        take: 10
      })
      return res.status(200).json(all)
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (e) {
    console.error('DAFTAR ERROR:', e)
    
    // Handle no_rm duplikat
    if (e.code === 'P2002') {
      try {
        const count = await prisma.pasien.count()
        const newRM = `26-${String(count + 1 + Math.floor(Math.random()*100)).padStart(5,'0')}`
        const pasien = await prisma.pasien.create({
          data: {
            no_rm: newRM,
            nama: req.body.nama || 'Pasien Baru',
            no_hp: req.body.no_hp || '',
            alamat: req.body.alamat || ''
          }
        })
        const kunjungan = await prisma.kunjungan.create({
          data: {
            pasienId: pasien.id,
            tanggal: new Date(),
            keluhan: req.body.keluhan || 'Daftar antrian online',
            diagnosa: '-',
            terapi: '-'
          }
        })
        return res.status(200).json({ success: true, pasien, kunjungan })
      } catch(e2){
        return res.status(500).json({ error: e2.message })
      }
    }
    
    return res.status(500).json({ error: e.message, stack: e.stack })
  }
}
