import { sql } from '@vercel/postgres';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({message:'POST only'});
  try{
    const {nama,no_hp,alamat,keluhan} = req.body;
    if(!nama) return res.status(400).json({message:'Nama wajib'});
    const rm='26-'+String(Date.now()).slice(-4);
    let pasienId=null;
    try{
      const p = await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,created_at) VALUES (${rm},${nama},${alamat||''},${no_hp||''},NOW()) RETURNING *`;
      pasienId=p.rows[0].id;
    }catch{}
    let next=1;
    try{ const c=await sql`SELECT COALESCE(MAX(no_antrian),0)+1 as next FROM antrian WHERE DATE(created_at)=CURRENT_DATE`; next=c.rows[0].next||1; }catch{}
    await sql`INSERT INTO antrian (pasien_id,nama,nama_pasien,no_antrian,nomor,alamat,keluhan,status,created_at) VALUES (${pasienId},${nama},${nama},${next},${next},${alamat||''},${keluhan||''},'menunggu',NOW())`;
    return res.status(200).json({message:'Berhasil',no_antrian:next});
  }catch(err){ return res.status(500).json({message:err.message}); }
}
