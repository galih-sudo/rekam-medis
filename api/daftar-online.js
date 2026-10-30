import { sql } from '@vercel/postgres';
export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({message:'POST only'});
 try{
  await sql`CREATE TABLE IF NOT EXISTS pasien (id SERIAL PRIMARY KEY, no_rm TEXT, nama TEXT, alamat TEXT, no_hp TEXT, umur TEXT, created_at TIMESTAMP DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS antrian (id SERIAL PRIMARY KEY, pasien_id INTEGER, nama TEXT, nama_pasien TEXT, no_antrian INTEGER, nomor INTEGER, alamat TEXT, keluhan TEXT, status TEXT DEFAULT 'menunggu', created_at TIMESTAMP DEFAULT NOW())`;
  
  const {nama,no_hp,alamat,keluhan} = req.body;
  if(!nama) return res.status(400).json({message:'Nama wajib'});
  
  const rm='26-'+String(Date.now()).slice(-4);
  const p = await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,created_at) VALUES (${rm},${nama},${alamat||''},${no_hp||''},NOW()) RETURNING *`;
  const pasienId = p.rows[0].id;
  
  const c = await sql`SELECT COALESCE(MAX(no_antrian),0)+1 as next FROM antrian WHERE DATE(created_at)=CURRENT_DATE`;
  const no_antrian = c.rows[0].next || 1;
  
  await sql`INSERT INTO antrian (pasien_id,nama,nama_pasien,no_antrian,nomor,alamat,keluhan,status,created_at) VALUES (${pasienId},${nama},${nama},${no_antrian},${no_antrian},${alamat||''},${keluhan||''},'menunggu',NOW())`;
  
  return res.status(200).json({message:'Berhasil',no_antrian,pasien:p.rows[0]});
 }catch(err){ return res.status(500).json({message:err.message}); }
}
