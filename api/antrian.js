import { sql } from '@vercel/postgres';
export default async function handler(req,res){
  try{
    if(req.method==='GET'){
      try{
        const r = await sql`SELECT * FROM antrian WHERE DATE(created_at)=CURRENT_DATE ORDER BY no_antrian ASC`;
        return res.status(200).json(r.rows);
      }catch(e){
        try{
          await sql`CREATE TABLE antrian (id SERIAL PRIMARY KEY, pasien_id INTEGER, nama TEXT, nama_pasien TEXT, no_antrian INTEGER, nomor INTEGER, alamat TEXT, keluhan TEXT, status TEXT DEFAULT 'menunggu', created_at TIMESTAMP DEFAULT NOW())`;
          const r = await sql`SELECT * FROM antrian WHERE DATE(created_at)=CURRENT_DATE ORDER BY no_antrian ASC`;
          return res.status(200).json(r.rows);
        }catch(e2){ return res.status(200).json([]); }
      }
    }
    if(req.method==='POST'){
      const {pasien_id,nama,nama_pasien,alamat,keluhan} = req.body;
      const namaFinal = nama || nama_pasien || 'Pasien';
      let next=1;
      try{ const c=await sql`SELECT COALESCE(MAX(no_antrian),0)+1 as next FROM antrian WHERE DATE(created_at)=CURRENT_DATE`; next=c.rows[0].next||1; }catch{}
      const ins = await sql`INSERT INTO antrian (pasien_id,nama,nama_pasien,no_antrian,nomor,alamat,keluhan,status,created_at) VALUES (${pasien_id||null},${namaFinal},${namaFinal},${next},${next},${alamat||''},${keluhan||''},'menunggu',NOW()) RETURNING *`;
      return res.status(200).json(ins.rows[0]);
    }
    if(req.method==='DELETE'){
      const id=req.query.id;
      if(id) await sql`DELETE FROM antrian WHERE id::text=${id} OR no_antrian::text=${id}`;
      return res.status(200).json({ok:true});
    }
    return res.status(405).json({message:'not allowed'});
  }catch(err){ return res.status(500).json({message:err.message}); }
}
