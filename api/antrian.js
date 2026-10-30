import { sql } from '@vercel/postgres';
export default async function handler(req,res){
 try{
  // BIKIN TABEL KALO BELUM ADA - INI KUNCINYA!
  await sql`
    CREATE TABLE IF NOT EXISTS antrian (
      id SERIAL PRIMARY KEY,
      pasien_id INTEGER,
      nama TEXT,
      nama_pasien TEXT,
      no_antrian INTEGER,
      nomor INTEGER,
      alamat TEXT,
      keluhan TEXT,
      status TEXT DEFAULT 'menunggu',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS pasien (
      id SERIAL PRIMARY KEY,
      no_rm TEXT,
      nama TEXT,
      alamat TEXT,
      no_hp TEXT,
      umur TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  if(req.method==='GET'){
    const r = await sql`SELECT * FROM antrian WHERE DATE(created_at)=CURRENT_DATE ORDER BY no_antrian ASC, created_at ASC`;
    return res.status(200).json(r.rows);
  }
  if(req.method==='POST'){
    const {pasien_id,nama,nama_pasien,alamat,keluhan} = req.body;
    const namaFinal = nama || nama_pasien || 'Pasien';
    const c = await sql`SELECT COALESCE(MAX(no_antrian),0)+1 as next FROM antrian WHERE DATE(created_at)=CURRENT_DATE`;
    const no_antrian = c.rows[0].next || 1;
    
    const ins = await sql`
      INSERT INTO antrian (pasien_id,nama,nama_pasien,no_antrian,nomor,alamat,keluhan,status,created_at)
      VALUES (${pasien_id||null},${namaFinal},${namaFinal},${no_antrian},${no_antrian},${alamat||''},${keluhan||''},'menunggu',NOW())
      RETURNING *
    `;
    return res.status(200).json(ins.rows[0]);
  }
  if(req.method==='DELETE'){
    const id = req.query.id;
    if(id){ await sql`DELETE FROM antrian WHERE id::text=${id} OR no_antrian::text=${id}`; }
    return res.status(200).json({ok:true});
  }
  return res.status(405).json({message:'method not allowed'});
 }catch(err){
  console.error('ANTRIAN ERROR', err);
  return res.status(500).json({message: err.message, stack: err.stack});
 }
}
