import { sql } from '@vercel/postgres';
export default async function handler(req,res){
 try{
  await sql`CREATE TABLE IF NOT EXISTS pasien (id SERIAL PRIMARY KEY, no_rm TEXT, nama TEXT, alamat TEXT, no_hp TEXT, umur TEXT, created_at TIMESTAMP DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS antrian (id SERIAL PRIMARY KEY, pasien_id INTEGER, nama TEXT, nama_pasien TEXT, no_antrian INTEGER, nomor INTEGER, alamat TEXT, keluhan TEXT, status TEXT DEFAULT 'menunggu', created_at TIMESTAMP DEFAULT NOW())`;
  
  // Cek ada berapa
  const cek = await sql`SELECT COUNT(*) as c FROM pasien`;
  if(parseInt(cek.rows[0].c)===0){
    await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,umur) VALUES 
    ('01-01','Afwan Hafizi','Jl Raya Sengkol','081234567890','30'),
    ('01-02','Budi Santoso','Pejeruk','081234567891','25'),
    ('01-03','Siti Aminah','Mataram','081234567892','28'),
    ('01-04','Ahmad Faisal','Sengkol','081234567893','35')`;
  }
  
  const all = await sql`SELECT * FROM pasien ORDER BY id`;
  return res.status(200).json({message:'Restore OK', count: all.rows.length, data: all.rows});
 }catch(e){ return res.status(500).json({message:e.message}); }
}
