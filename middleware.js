export function middleware(req) {
  const url = new URL(req.url);
  const protectedPaths = ['/dashboard', '/antrian', '/riwayat', '/rm', '/admin', '/obat', '/rekam-medis'];
  const isProtected = protectedPaths.some(p => url.pathname.startsWith(p));
  const isLoginPage = url.pathname.includes('login.html') || url.pathname.includes('daftar-online');
  
  if (isProtected && !isLoginPage) {
    const cookie = req.headers.get('cookie') || '';
    if (!cookie.includes('login_drg=ok')) {
      return Response.redirect(new URL('/login.html', req.url), 302);
    }
  }
  return undefined;
}
export const config = {
  matcher: ['/dashboard.html', '/antrian.html', '/riwayat.html', '/rm.html', '/admin.html', '/obat.html', '/rekam-medis.html']
}
