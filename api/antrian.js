export default async function handler(req,res){
  res.setHeader('Content-Type','application/json');
  try{
    const { sql } = await import('@vercel/postgres');
    
    // Coba bikin tabel, kalo gagal biarin
    try{
      await sql`CREATE TABLE IF NOT EXISTS pasien (id SERIAL PRIMARY KEY, no_rm TEXT, nama TEXT, alamat TEXT, no_hp TEXT, umur TEXT, created_at TIMESTAMP DEFAULT NOW())`;
      await sql`CREATE TABLE IF NOT EXISTS antrian (id SERIAL PRIMARY KEY, pasien_id INTEGER, nama TEXT, nama_pasien TEXT, no_antrian INTEGER, nomor INTEGER, alamat TEXT, keluhan TEXT, status TEXT DEFAULT 'menunggu', created_at TIMESTAMP DEFAULT NOW())`;
    }catch(e){ console.log('create table error', e.message); }

    if(req.method==='GET'){
      try{
        const r = await sql`SELECT * FROM antrian WHERE DATE(created_at)=CURRENT_DATE ORDER BY no_antrian ASC`;
        return res.status(200).json(r.rows);
      }catch(e){
        console.log('select error', e.message);
        return res.status(200).json([]); // BALIKIN KOSONG BIAR GAK ERROR JSON!
      }
    }
    if(req.method==='POST'){
      try{
        const {pasien_id,nama,nama_pasien,alamat} = req.body;
        const namaFinal = nama || nama_pasien || 'Pasien';
        let no_antrian = 1;
        try{
          const c = await sql`SELECT COALESCE(MAX(no_antrian),0)+1 as next FROM antrian WHERE DATE(created_at)=CURRENT_DATE`;
          no_antrian = c.rows[0].next || 1;
        }catch{}
        const ins = await sql`INSERT INTO antrian (pasien_id,nama,nama_pasien,no_antrian,nomor,alamat,status,created_at) VALUES (${pasien_id||null},${namaFinal},${namaFinal},${no_antrian},${no_antrian},${alamat||''},'menunggu',NOW()) RETURNING *`;
        return res.status(200).json(ins.rows[0]);
      }catch(e){
        return res.status(500).json({message: e.message});
      }
    }
    if(req.method==='DELETE'){
      try{
        const id = req.query.id;
        if(id) await sql`DELETE FROM antrian WHERE id::text=${id} OR no_antrian::text=${id}`;
        return res.status(200).json({ok:true});
      }catch(e){ return res.status(200).json({ok:true}); }
    }
    return res.status(200).json([]);
  }catch(err){
    console.error('FATAL ANTRIAN', err);
    // INI KUNCI BIAR GAK FUNCTION_INVOCATION_FAILED LAGI!
    return res.status(200).json([]); 
  }
}
