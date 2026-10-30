import { sql } from '@vercel/postgres';
export default async function handler(req,res){
  try{
    if(req.method==='GET'){
      try{
        const r = await sql`SELECT * FROM pasien ORDER BY created_at DESC LIMIT 100`;
        if(r.rows.length===0){
          // auto seed kalo kosong
          await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,umur) VALUES ('01-01','Afwan Hafizi','Sengkol','081234567890','30'),('01-02','Budi','Pejeruk','081234567891','25') ON CONFLICT DO NOTHING`;
          const r2 = await sql`SELECT * FROM pasien ORDER BY created_at DESC LIMIT 100`;
          return res.status(200).json(r2.rows);
        }
        return res.status(200).json(r.rows);
      }catch(e){
        // kalo tabel belum ada
        try{
          await sql`CREATE TABLE pasien (id SERIAL PRIMARY KEY, no_rm TEXT, nama TEXT, alamat TEXT, no_hp TEXT, umur TEXT, created_at TIMESTAMP DEFAULT NOW())`;
          await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,umur) VALUES ('01-01','Afwan Hafizi','Sengkol','081234567890','30')`;
          const r = await sql`SELECT * FROM pasien ORDER BY created_at DESC`;
          return res.status(200).json(r.rows);
        }catch(e2){ return res.status(500).json({message:e2.message}); }
      }
    }
    if(req.method==='POST'){
      const {nama,alamat,no_hp,umur,no_rm} = req.body;
      if(!nama) return res.status(400).json({message:'Nama wajib'});
      const rm = no_rm || '26-'+String(Date.now()).slice(-4);
      const ins = await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,umur,created_at) VALUES (${rm},${nama},${alamat||''},${no_hp||''},${umur||''},NOW()) RETURNING *`;
      return res.status(200).json(ins.rows[0]);
    }
    return res.status(405).json({message:'not allowed'});
  }catch(err){ return res.status(500).json({message:err.message}); }
}
