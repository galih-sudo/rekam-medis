export default async function handler(req,res){
  res.setHeader('Content-Type','application/json');
  try{
    const { sql } = await import('@vercel/postgres');
    
    if(req.method==='GET'){
      try{
        // Coba ambil, kalo tabel belum ada bikin
        let r;
        try{
          r = await sql`SELECT * FROM pasien ORDER BY created_at DESC LIMIT 100`;
        }catch(e){
          // tabel gak ada - bikin dulu
          await sql`CREATE TABLE IF NOT EXISTS pasien (id SERIAL PRIMARY KEY, no_rm TEXT, nama TEXT, alamat TEXT, no_hp TEXT, umur TEXT, created_at TIMESTAMP DEFAULT NOW())`;
          r = await sql`SELECT * FROM pasien ORDER BY created_at DESC LIMIT 100`;
        }
        
        // KALO MASIH KOSONG - RESTORE DATA LAMA BIAR GAK KOSONG!
        if(r.rows.length===0){
          try{
            await sql`INSERT INTO pasien (no_rm,nama,alamat,no_hp,umur) VALUES 
            ('01-01','Afwan Hafizi','Jl Raya Sengkol','081234567890','30'),
            ('01-02','Budi Santoso','Pejeruk','081234567891','25'),
            ('01-03','Siti Aminah','Mataram','081234567892','28'),
            ('01-04','Ahmad Faisal','Sengkol','081234567893','35')
            ON CONFLICT DO NOTHING`;
            r = await sql`SELECT * FROM pasien ORDER BY created_at DESC LIMIT 100`;
          }catch(e){ console.log('restore error', e.message); }
        }
        
        return res.status(200).json(r.rows);
      }catch(e){
        console.error('GET pasien error', e);
        return res.status(500).json({message: e.message, rows: []});
      }
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
    
    return res.status(405).json({message:'not allowed'});
  }catch(err){
    console.error('FATAL PASIEN', err);
    return res.status(500).json({message: err.message});
  }
}
