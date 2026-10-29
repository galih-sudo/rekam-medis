import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const id = parseInt(req.query.id || req.query.fix || '3')
    const no_hp = req.query.no_hp || req.query.hp

    if (!no_hp) {
      return res.status(200).json({ error: 'Mana no HP nya bro? Contoh: /api/fix-final?id=3&no_hp=082123456789' })
    }

    const pasien = await prisma.pasien.update({
      where: { id },
      data: { no_hp: String(no_hp) }
    })

    return res.status(200).json({
      success: true,
      message: `BERHASIL BRO! HP ${pasien.nama} (ID ${id}) JADI ${pasien.no_hp} - GAK DIMAKAN SETAN LAGI!`,
      pasien
    })
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message, hint: 'Cek ID nya bener ga? Liat di /api/antrian' })
  }
}
