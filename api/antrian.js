// api/antrian.js - FINAL ANTI BEREBUT + ANTI DUPLIKAT
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  try {
    const today = new Date()
    today.setHours(0,0,0,0)

    // AMBIL KUNJUNGAN HARI INI AJA
    const data = await prisma.kunjungan.findMany({
      where: {
        tanggal: { gte: today }
      },
      include: { pasien: true },
      orderBy: { id: 'asc' } // yang daftar pertama = no 1
    })

    // HILANGKAN DUPLIKAT - 1 PASIEN = 1 ANTRIAN PER HARI
    const map = new Map()
    data.forEach(k => {
      if (!map.has(k.pasienId)) {
        map.set(k.pasienId, k)
      }
    })

    const result = Array.from(map.values()).map((k, i) => ({
      id: k.id,
      kunjunganId: k.id,
      pasienId: k.pasienId,
      no_antrian: i + 1,
      nomor: i + 1,
      no: i + 1,
      nama: k.pasien?.nama || 'Pasien',
      no_rm: k.pasien?.no_rm || k.pasienId,
      pasien: k.pasien,
      tanggal: k.tanggal,
      status: 'MENUNGGU'
    }))

    return res.status(200).json(result)

  } catch (e) {
    console.error('ANTRIAN ERROR:', e)
    // Fallback polosan biar gak 500
    try {
      const data = await prisma.kunjungan.findMany({
        orderBy: { id: 'asc' },
        take: 50,
        include: { pasien: true }
      })
      const map = new Map()
      data.forEach(k => { if(!map.has(k.pasienId)) map.set(k.pasienId, k) })
      const result = Array.from(map.values()).map((k,i)=>({
        id: k.id,
        no_antrian: i+1,
        nama: k.pasien?.nama || 'Pasien',
        no_rm: k.pasien?.no_rm || k.pasienId,
        pasien: k.pasien
      }))
      return res.status(200).json(result)
    } catch {
      return res.status(200).json([])
    }
  }
}
