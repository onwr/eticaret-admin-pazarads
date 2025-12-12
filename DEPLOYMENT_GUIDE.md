# Ubuntu VPS Deployment Rehberi - E-Commerce Admin Dashboard

Bu rehber, projenizi Ubuntu VPS sunucusuna canlıya almak için gereken tüm adımları içerir.

## 📋 ÖN HAZIRLIK

### Gereksinimler:
- Ubuntu 20.04 veya üzeri VPS
- Root veya sudo yetkisi
- Domain adı (opsiyonel ama önerilir)
- Putty veya başka bir SSH istemcisi

---

## 🔐 ADIM 1: VPS'E BAĞLANMA

### Putty ile Bağlanma:
1. Putty'yi açın
2. Host Name (or IP address): `VPS_IP_ADRESINIZ`
3. Port: `22`
4. Connection type: `SSH`
5. Open'a tıklayın
6. İlk bağlantıda "Yes" diyerek sunucu anahtarını kabul edin
7. Kullanıcı adı: `root` (veya size verilen kullanıcı adı)
8. Şifre: `ŞİFRENİZ`

---

## 🛠️ ADIM 2: SİSTEM GÜNCELLEMELERİ

Sunucuya bağlandıktan sonra ilk olarak sistemi güncelleyin:

```bash
# Sistem paketlerini güncelle
sudo apt update

# Mevcut paketleri yükselt
sudo apt upgrade -y

# Gerekli temel paketleri yükle
sudo apt install -y curl wget git build-essential
```

---

## 📦 ADIM 3: NODE.JS KURULUMU

Proje Node.js gerektiriyor. Node.js 18.x veya 20.x LTS sürümünü kuralım:

```bash
# NodeSource repository ekle (Node.js 20.x için)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js ve npm'i yükle
sudo apt install -y nodejs

# Kurulumu doğrula
node --version
npm --version
```

**Beklenen çıktı:** Node.js v20.x.x ve npm 10.x.x

---

## 🌐 ADIM 4: NGINX KURULUMU

Nginx web sunucusunu kuralım:

```bash
# Nginx'i yükle
sudo apt install -y nginx

# Nginx'i başlat ve otomatik başlatmayı etkinleştir
sudo systemctl start nginx
sudo systemctl enable nginx

# Nginx durumunu kontrol et
sudo systemctl status nginx
```

**Kontrol:** Tarayıcıda `http://VPS_IP_ADRESINIZ` adresine gidin, "Welcome to nginx!" sayfası görünmeli.

---

## 📁 ADIM 5: PROJE KLASÖRÜ OLUŞTURMA

Projeyi yüklemek için bir dizin oluşturalım:

```bash
# Web dizini oluştur
sudo mkdir -p /var/www/ecommerce-admin

# Klasör sahipliğini ayarla (kendi kullanıcı adınızı yazın)
sudo chown -R $USER:$USER /var/www/ecommerce-admin

# Klasöre geç
cd /var/www/ecommerce-admin
```

---

## 📤 ADIM 6: PROJEYİ VPS'E YÜKLEME

### Yöntem 1: Git ile (Önerilen - Eğer Git repository'niz varsa)

```bash
# Git repository'nizi klonlayın
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git .

# Veya mevcut klasöre
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git /var/www/ecommerce-admin
```

### Yöntem 2: SCP ile Dosya Transferi (Windows'tan)

Windows bilgisayarınızda PowerShell veya CMD açın:

```powershell
# Proje klasörünü VPS'e yükle
scp -r "C:\Users\Kürkaya Yazılım\Desktop\e-commerce-admin-dashboard - Kopya\*" root@VPS_IP_ADRESINIZ:/var/www/ecommerce-admin/
```

**Not:** Putty ile birlikte gelen `pscp.exe` de kullanılabilir:
```cmd
pscp -r "C:\Users\Kürkaya Yazılım\Desktop\e-commerce-admin-dashboard - Kopya\*" root@VPS_IP_ADRESINIZ:/var/www/ecommerce-admin/
```

### Yöntem 3: WinSCP veya FileZilla ile

1. WinSCP veya FileZilla'yı açın
2. Yeni bağlantı oluşturun:
   - Host: `VPS_IP_ADRESINIZ`
   - Port: `22`
   - Kullanıcı: `root`
   - Şifre: `ŞİFRENİZ`
3. Sol tarafta yerel proje klasörünüzü, sağ tarafta `/var/www/ecommerce-admin` klasörünü açın
4. Tüm dosyaları sürükle-bırak ile kopyalayın

---

## 🔨 ADIM 7: PROJE BAĞIMLILIKLARINI KURMA

VPS'te proje klasörüne gidin ve bağımlılıkları kurun:

```bash
# Proje klasörüne geç
cd /var/www/ecommerce-admin

# Node modüllerini yükle
npm install

# Eğer package.json yoksa, dist klasörünü kullanabilirsiniz
# (Zaten build edilmiş dosyalar varsa)
```

**Not:** Eğer proje zaten build edilmişse (`dist` klasörü varsa), sadece `dist` klasörünü kullanabilirsiniz.

---

## 🏗️ ADIM 8: PROJEYİ BUILD ETME (Gerekirse)

Eğer projeyi build etmeniz gerekiyorsa:

```bash
# Build komutu (package.json'daki build script'ine göre)
npm run build

# Veya Vite kullanıyorsanız
npx vite build
```

Build edilmiş dosyalar `dist` klasöründe olacaktır.

---

## ⚙️ ADIM 9: NGINX YAPILANDIRMASI

Nginx'i projeniz için yapılandıralım:

```bash
# Nginx yapılandırma dosyası oluştur
sudo nano /etc/nginx/sites-available/ecommerce-admin
```

Aşağıdaki yapılandırmayı yapıştırın (DOMAIN_ADRESINIZ kısmını kendi domain'inizle değiştirin):

```nginx
server {
    listen 80;
    server_name DOMAIN_ADRESINIZ www.DOMAIN_ADRESINIZ;
    
    # Eğer domain yoksa, IP adresini kullanın
    # server_name _;

    root /var/www/ecommerce-admin/dist;
    index index.html;

    # Gzip sıkıştırma
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Static dosyalar için cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router için - tüm route'ları index.html'e yönlendir
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Güvenlik başlıkları
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Log dosyaları
    access_log /var/log/nginx/ecommerce-admin-access.log;
    error_log /var/log/nginx/ecommerce-admin-error.log;
}
```

**Dosyayı kaydedin:** `Ctrl + O`, `Enter`, `Ctrl + X`

### Symbolic link oluştur:

```bash
# Site'ı etkinleştir
sudo ln -s /etc/nginx/sites-available/ecommerce-admin /etc/nginx/sites-enabled/

# Varsayılan site'ı devre dışı bırak (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx yapılandırmasını test et
sudo nginx -t

# Hata yoksa Nginx'i yeniden yükle
sudo systemctl reload nginx
```

---

## 🔒 ADIM 10: SSL SERTİFİKASI KURULUMU (Let's Encrypt)

HTTPS için ücretsiz SSL sertifikası kuralım:

```bash
# Certbot'u yükle
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al (DOMAIN_ADRESINIZ kısmını değiştirin)
sudo certbot --nginx -d DOMAIN_ADRESINIZ -d www.DOMAIN_ADRESINIZ

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

**Not:** Domain'iniz yoksa bu adımı atlayabilirsiniz, ancak HTTPS önerilir.

---

## 🔥 ADIM 11: FIREWALL YAPILANDIRMASI

UFW firewall'u yapılandıralım:

```bash
# UFW'yi yükle (yoksa)
sudo apt install -y ufw

# Varsayılan kuralları ayarla
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH bağlantısını izin ver (ÖNEMLİ: Bu olmadan bağlantınız kesilir!)
sudo ufw allow 22/tcp

# HTTP ve HTTPS izin ver
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall'u etkinleştir
sudo ufw enable

# Durumu kontrol et
sudo ufw status
```

---

## 🧪 ADIM 12: TEST ETME

Projenizin çalışıp çalışmadığını kontrol edin:

```bash
# Nginx durumunu kontrol et
sudo systemctl status nginx

# Nginx loglarını kontrol et
sudo tail -f /var/log/nginx/ecommerce-admin-error.log

# Port dinleme durumunu kontrol et
sudo netstat -tulpn | grep :80
```

**Tarayıcıda test:**
- Domain varsa: `https://DOMAIN_ADRESINIZ`
- Domain yoksa: `http://VPS_IP_ADRESINIZ`

---

## 🔄 ADIM 13: OTOMATİK YENİDEN BAŞLATMA (Opsiyonel)

Sunucu yeniden başladığında servislerin otomatik başlaması için:

```bash
# Nginx'in otomatik başlamasını kontrol et
sudo systemctl is-enabled nginx

# Eğer disabled ise:
sudo systemctl enable nginx
```

---

## 📝 ADIM 14: GÜNCELLEME İŞLEMLERİ

Projeyi güncellediğinizde:

```bash
# Proje klasörüne geç
cd /var/www/ecommerce-admin

# Git ile güncelleme (eğer Git kullanıyorsanız)
git pull origin main

# Yeni bağımlılıklar varsa
npm install

# Yeniden build et
npm run build

# Nginx'i yeniden yükle (genellikle gerekmez ama güvenli)
sudo systemctl reload nginx
```

---

## 🐛 SORUN GİDERME

### Nginx çalışmıyor:
```bash
sudo systemctl status nginx
sudo nginx -t
sudo journalctl -u nginx -n 50
```

### Sayfa açılmıyor:
```bash
# Nginx loglarını kontrol et
sudo tail -50 /var/log/nginx/ecommerce-admin-error.log

# Dosya izinlerini kontrol et
ls -la /var/www/ecommerce-admin/dist

# İzinleri düzelt
sudo chown -R www-data:www-data /var/www/ecommerce-admin
sudo chmod -R 755 /var/www/ecommerce-admin
```

### Port 80 kullanımda:
```bash
# Hangi process 80 portunu kullanıyor?
sudo lsof -i :80
# veya
sudo netstat -tulpn | grep :80
```

### Node.js versiyonu yanlış:
```bash
# Node.js versiyonunu kontrol et
node --version

# NVM ile farklı versiyon yükle (gerekirse)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

---

## 📊 PERFORMANS İYİLEŞTİRMELERİ

### Nginx cache ayarları:
```nginx
# /etc/nginx/nginx.conf dosyasına ekleyin
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;
```

### Gzip sıkıştırma (zaten yapılandırmada var):
- Otomatik olarak etkin

---

## 🔐 GÜVENLİK İPUÇLARI

1. **SSH Key Authentication kullanın:**
```bash
# Yerel bilgisayarınızda (Windows PowerShell):
ssh-keygen -t rsa -b 4096

# Public key'i VPS'e kopyalayın:
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@VPS_IP "cat >> ~/.ssh/authorized_keys"
```

2. **SSH portunu değiştirin:**
```bash
sudo nano /etc/ssh/sshd_config
# Port 22 satırını bulun ve değiştirin (örn: Port 2222)
sudo systemctl restart sshd
```

3. **Fail2ban kurun:**
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## ✅ KONTROL LİSTESİ

- [ ] VPS'e bağlandım
- [ ] Sistem güncellemelerini yaptım
- [ ] Node.js kuruldu
- [ ] Nginx kuruldu ve çalışıyor
- [ ] Proje dosyaları yüklendi
- [ ] Bağımlılıklar kuruldu
- [ ] Proje build edildi
- [ ] Nginx yapılandırıldı
- [ ] SSL sertifikası kuruldu (domain varsa)
- [ ] Firewall yapılandırıldı
- [ ] Site tarayıcıda açılıyor
- [ ] Loglar kontrol edildi

---

## 📞 DESTEK

Sorun yaşarsanız:
1. Nginx error loglarını kontrol edin: `sudo tail -50 /var/log/nginx/ecommerce-admin-error.log`
2. System loglarını kontrol edin: `sudo journalctl -xe`
3. Nginx yapılandırmasını test edin: `sudo nginx -t`

---

**Başarılar! 🚀**

