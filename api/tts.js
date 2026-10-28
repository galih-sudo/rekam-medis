export default async function handler(req,res){
  const text = req.query.text || 'Nomor antrian satu'
  try{
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(text)}&ttsspeed=1`
    const r = await fetch(googleUrl, { headers: { 'User-Agent':'Mozilla/5.0' } })
    const buf = await r.arrayBuffer()
    res.setHeader('Content-Type','audio/mpeg')
    res.setHeader('Access-Control-Allow-Origin','*')
    res.send(Buffer.from(buf))
  }catch(e){ res.status(500).json({error:e.message}) }
}
