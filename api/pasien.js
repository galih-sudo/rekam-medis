import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const pasien = await prisma.pasien.findMany({ orderBy: { created_at: 'desc' } })
      return res.status(200).json(pasien)
    }
    if (req.method === 'POST') {
      const { nama, no_hp, alamat } = req.body
      
      // FIX: cari MAX number dari 26-xxxxxx, bukan length
      const all = await prisma.pasien.findMany({
        where: { no_rm: { startsWith: '26-' } },
        orderBy: { no_rm: 'desc' }
      })
      let maxNum = 0
      all.forEach(p => {
        const n = parseInt(p.no_rm.split('-')[1])
        if (!isNaN(n) && n > maxNum) maxNum = n
      })
      const newNoRM = `26-${String(maxNum + 1).padStart(5, '0')}`

      const newPasien = await prisma.pasien.create({
        data: { no_rm: newNoRM, nama, no_hp, alamat }
      })
      return res.status(201).json(newPasien)
    }
    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}
