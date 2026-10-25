import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  // CORS biar bisa dipanggil dari html
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      // List semua pasien
      const pasien = await prisma.pasien.findMany({
        orderBy: { created_at: 'desc' }
      })
      return res.status(200).json(pasien)
    }

    if (req.method === 'POST') {
      // Daftar pasien baru
      const { nama, no_hp, alamat } = req.body
      
      // Generate no_rm otomatis: 26-00002, dst
      const lastPasien = await prisma.pasien.findFirst({
        orderBy: { id: 'desc' }
      })
      const lastNumber = lastPasien ? parseInt(lastPasien.no_rm.split('-')[1]) : 0
      const newNoRM = `26-${String(lastNumber + 1).padStart(5, '0')}`

      const newPasien = await prisma.pasien.create({
        data: {
          no_rm: newNoRM,
          nama,
          no_hp,
          alamat
        }
      })
      return res.status(201).json(newPasien)
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}
