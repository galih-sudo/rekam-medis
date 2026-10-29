import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const id = parseInt(req.query.id || '3')
    const no_hp = req.query.no_hp || '081234567890'
    const alamat = req.query.alamat || 'Mataram'
    
    const pasien = await prisma.pasien.update({
      where: { id },
      data: { no_hp, alamat }
    })
    
    return res.status(200).json({ 
      success: true, 
      message: `HP ${pasien.nama} udah dibenerin jadi ${no_hp}`,
      pasien 
    })
  } catch(e){
    return res.status(500).json({ error: e.message })
  }
}
