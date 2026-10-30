export default async function handler(req,res){
  res.setHeader('Content-Type','application/json');
  try{
    const { sql } = await import('@vercel/postgres');
    try{ await sql`CREATE TABLE IF NOT EXISTS pasien (id SERIAL PRIMARY KEY, no_rm TEXT, nama TEXT, alamat TEXT, no_hp TEXT, umur TEXT, created_at TIMESTAMP DEFAULT NOW())`; }catch{}
    
    if(req.method==='GET'){
      try{
        const r = await sql`SELECT * FROM pasien ORDER BY created_at DESC LIMIT 100`;
        return res.status(200).json(r.rows);
      }catch(e){ return res.status(200).json([]); }
    }
    if(req.method==='POST'){
      try{
        const {nama,alamat,no_hp,umur,no_rm} = req.body;
        if(!nama) return res.status(400).json({message:'Nama wajib'});
        const rm = no_rm || '26-'+String(Date.now()).slice(-4);
        const ins = await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,umur,created_at) VALUES (${rm},${nama},${alamat||''},${no_hp||''},${umur||''},NOW()) RETURNING *`;
        return res.status(200).json(ins.rows[0]);
      }catch(e){ return res.status(500).json({message:e.message}); }
    }
    return res.status(200).json([]);
  }catch(err){
    return res.status(200).json([]);
  }
}
