#!/bin/bash
# DASHBOARD
sed -i 's/<title>.*<\/title>/<title>DASHBOARD<\/title>/g' dashboard.html
sed -i 's/DASHBOARD BOS KLINIK dr. Galih - FIXED/DASHBOARD/g' dashboard.html
sed -i 's/📊.*DASHBOARD.*/DASHBOARD/g' dashboard.html
sed -i 's/.*DASHBOARD BOS.*/      DASHBOARD/g' dashboard.html

# ANTRIAN
sed -i 's/<title>.*<\/title>/<title>ANTRIAN<\/title>/g' antrian.html
sed -i 's/.*Antrian - dr. Galih PRO.*/      ANTRIAN/g' antrian.html
sed -i 's/🩺.*Antrian.*/ANTRIAN/g' antrian.html

# DAFTAR
sed -i 's/<title>.*<\/title>/<title>DAFTAR<\/title>/g' daftar-online.html
sed -i 's/<h2>.*<\/h2>/<h2>DAFTAR<\/h2>/g' daftar-online.html

# RIWAYAT kalo ada
[ -f riwayat.html ] && sed -i 's/<title>.*<\/title>/<title>RIWAYAT<\/title>/g' riwayat.html
[ -f riwayat.html ] && sed -i 's/.*Riwayat.*/      RIWAYAT/g' riwayat.html

echo "=== HASIL ==="
grep "<title>" dashboard.html antrian.html daftar-online.html
