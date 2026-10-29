import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const no_hp_full = req.query.no_hp || req.query.hp || ""
    const nama_q = req.query.nama || "Endang Utami R"

    // 1. BERSIHKAN KEMBAR - BUKA ?bersih=1 SEKALI AJA!
    if (req.query.bersih === '1') {
      const all = await prisma.pasien.findMany({ where: { nama: { contains: 'Endang' } }, orderBy: { id: 'asc' } })
      if (all.length > 1) {
        const keep = all[0].id
        const del = all.slice(1).map(p=>p.id)
        await prisma.kunjungan.deleteMany({ where: { pasienId: { in: del } } })
        await prisma.pasien.deleteMany({ where: { id: { in: del } } })
        return res.json({ success: true, message: `HAPUS ${del.length} KEMBAR! SISA ID ${keep}`, deleted: del })
      }
      return res.json({ message: 'Udah bersih, tinggal 1', data: all })
    }

    // 2. FIX HP - BUKA ?fix=ID&no_hp=0821....
    if (req.query.fix) {
      const id = parseInt(req.query.fix)
      if (!no_hp_full) return res.json({ error: 'Kasih no_hp dong bro! ?fix=10&no_hp=0821....' })
      const p = await prisma.pasien.update({ where: { id }, data: { no_hp: no_hp_full } })
      return res.json({ success: true, message: `HP ${p.nama} JADI ${p.no_hp} - UDAH GAK DIMAKAN SETAN LAGI!`, pasien: p })
    }

    // 3. DAFTAR BARU DENGAN NO HP FULL
    if (req.query.daftar) {
      const count = await prisma.pasien.count()
      const no_rm = `26-${String(count + 1 + Date.now()%100).padStart(5,'0')}`
      const pasien = await prisma.pasien.create({
        data: { no_rm, nama: nama_q, no_hp: no_hp_full || '081', alamat: req.query.alamat || 'Mataram' }
      })
      const kunjungan = await prisma.kunjungan.create({
        data: { pasienId: pasien.id, tanggal: new Date(), keluhan: 'Daftar', diagnosa: '-', terapi: '-' }
      })
      return res.json({ success: true, pasien, kunjungan })
    }

    return res.json({ 
      cara_pakai: '1. ?bersih=1 buat hapus kembar | 2. ?fix=10&no_hp=0821... buat benerin HP | 3. ?daftar=1&nama=...&no_hp=... buat daftar baru'
    })

  } catch(e){ return res.status(500).json({ error: e.message }) }
}
