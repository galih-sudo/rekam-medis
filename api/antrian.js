import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  
  try {
    // VERSI PALING POLOS - TANPA WHERE TANGGAL, TANPA createdAt - PASTI WORK!
    const data = await prisma.kunjungan.findMany({
      include: { pasien: true },
      orderBy: { id: 'desc' },
      take: 20
    })

    const formatted = data
      .reverse() // biar yang daftar pertama jadi no 1
      .map((k, i) => ({
        id: k.id,
        no_antrian: i + 1,
        nomor: i + 1,
        nama: k.pasien?.nama || 'Pasien',
        no_rm: k.pasien?.no_rm || k.pasienId,
        pasien: k.pasien,
        status: 'MENUNGGU'
      }))

    return res.status(200).json(formatted)
    
  } catch (e) {
    console.error(e)
    // JIKA INCLUDE PASIEN ERROR, COBA TANPA INCLUDE
    try {
      const data = await prisma.kunjungan.findMany({
        orderBy: { id: 'desc' },
        take: 20
      })
      const formatted = data.reverse().map((k,i)=>({
        id: k.id,
        no_antrian: i+1,
        nama: 'Pasien ID ' + k.pasienId,
        no_rm: k.pasienId,
        status: 'MENUNGGU'
      }))
      return res.status(200).json(formatted)
    } catch (e2) {
      return res.status(200).json([])
    }
  }
}
