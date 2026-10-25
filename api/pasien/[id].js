import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { id } = req.query
  const pid = parseInt(id)

  if (req.method === 'PUT') {
    const { nama, no_hp, alamat } = req.body
    const updated = await prisma.pasien.update({
      where: { id: pid },
      data: { nama, no_hp, alamat }
    })
    return res.json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.pasien.delete({ where: { id: pid } })
    return res.json({ message: 'deleted' })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
