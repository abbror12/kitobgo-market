# Deploy qo'llanmasi

Sayt: `kitobgo.com` / `www.kitobgo.com` · API: `api.kitobgo.com`

## Ish oqimi (CI/CD)

`main` branchga push bo'lganda GitHub Actions avtomatik:

1. **check** — `npm run lint` + `tsc --noEmit`
2. **build** — Docker image quriladi va `ghcr.io/abbror12/kitobgo-market` ga yuklanadi
3. **deploy** — serverga SSH orqali ulanib, yangi image tortiladi va konteyner qayta ishga tushiriladi

## Bir martalik sozlash

### 1. GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Qiymat |
|--------|--------|
| `SERVER_HOST` | Server IP manzili (masalan `123.45.67.89`) |
| `SERVER_USER` | SSH foydalanuvchi (masalan `root` yoki `deploy`) |
| `SERVER_SSH_KEY` | SSH **private** kalit (pastga qarang) |
| `SERVER_PORT` | SSH port (22 bo'lsa qo'shmasa ham bo'ladi) |

SSH kalit yaratish (lokal kompyuterda):

```bash
ssh-keygen -t ed25519 -f kitobgo_deploy -N "" -C "github-actions"
# ochiq kalitni serverga qo'shish:
ssh-copy-id -i kitobgo_deploy.pub <user>@<server-ip>
# kitobgo_deploy (private) fayl mazmunini SERVER_SSH_KEY secret'iga joylang
```

### 2. Serverda DNS va Nginx

DNS'da `kitobgo.com` va `www.kitobgo.com` uchun **A yozuv** server IP'siga ko'rsatsin.

Nginx config — `/etc/nginx/sites-available/kitobgo.com`:

```nginx
server {
    listen 80;
    server_name kitobgo.com www.kitobgo.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kitobgo.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS (Let's Encrypt):
sudo certbot --nginx -d kitobgo.com -d www.kitobgo.com
```

### 3. Birinchi deploy

Sozlash tugagach `main` ga push qiling (yoki GitHub → Actions → Deploy → **Run workflow**).
Konteyner `127.0.0.1:3000` da ishlaydi, nginx tashqariga chiqaradi.

## Tekshirish

```bash
docker ps                                # kitobgo-market ishlayaptimi
docker logs -f kitobgo-market            # loglar
curl -I http://127.0.0.1:3000            # konteyner javob beryaptimi
```

## Eslatmalar

- API manzili konteynerga `KITOBGO_API_URL` env orqali beriladi (`deploy.yml` ichida).
- Rasm hosti o'zgarsa (masalan CDN) — `next.config.ts` dagi `images.remotePatterns` ga qo'shing.
- Rollback: `docker run` ni eski SHA tegi bilan qaytarish mumkin — `ghcr.io/abbror12/kitobgo-market:<eski-commit-sha>`.
