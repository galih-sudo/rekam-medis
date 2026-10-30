// SATPAM PRAKTEK DR GALIH - CEK LOGIN
(function(){
  let token = localStorage.getItem('token') || localStorage.getItem('user') || sessionStorage.getItem('login');
  let path = location.pathname;
  // kalo di login.html - jangan cek
  if(path.includes('login.html')) return;
  // kalo gak ada token - tendang ke login!
  if(!token){
    // simpen dulu mau kemana
    localStorage.setItem('redirect_after_login', path);
    location.href = '/login.html';
  }
})();
