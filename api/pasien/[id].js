import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { id } = req.query
  const pid = parseInt(id)

  try {
    if (req.method === 'PUT') {
      const { nama, no_hp, alamat } = req.body
      const updated = await prisma.pasien.update({
        where: { id: pid },
        data: { nama, no_hp, alamat }
      })
      return res.status(200).json(updated)
    }
    if (req.method === 'DELETE') {
      await prisma.pasien.delete({ where: { id: pid } })
      return res.status(200).json({ message: 'deleted' })
    }
    return res.status(405).json({ message: 'Method not allowed' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
