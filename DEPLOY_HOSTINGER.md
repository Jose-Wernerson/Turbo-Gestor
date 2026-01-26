# 🚀 Deploy na Hostinger - Turbo Gestor

## Opção 1: VPS (Recomendado)

### Passo 1: Preparar o Projeto

1. **Criar arquivo `.env.production`** com as variáveis de produção:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tymmlyyisqtnddxpbkoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_coMIJ6-i5x1Rd4So3ABYow_Y8txGzzL
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AXoeiARgHnDd1KVODNr9mg_Nhq5QnlR

# Stripe (USAR CHAVES DE PRODUÇÃO!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_SEU_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_SUA_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET

# App URL (SEU DOMÍNIO)
NEXT_PUBLIC_APP_URL=https://seudominio.com

# Resend
RESEND_API_KEY=re_ijLbMHZE_Q3QK3NEgdnjn3ZhddxLxMFms

# Cron Secret
CRON_SECRET=turbo_cron_secret_2025
```

2. **Fazer build local para testar:**

```bash
npm run build
npm start
```

### Passo 2: Configurar VPS Hostinger

1. **Acessar VPS via SSH:**

```bash
ssh root@seu-ip-hostinger
```

2. **Instalar Node.js 18+ (se não tiver):**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verificar versão
```

3. **Instalar PM2 (gerenciador de processos):**

```bash
npm install -g pm2
```

4. **Instalar Git (se não tiver):**

```bash
sudo apt-get update
sudo apt-get install git
```

### Passo 3: Fazer Deploy

1. **Criar diretório e clonar projeto:**

```bash
cd /var/www
git clone SEU_REPOSITORIO_GIT turbo-gestor
cd turbo-gestor
```

2. **Instalar dependências:**

```bash
npm install
```

3. **Criar arquivo `.env.production`:**

```bash
nano .env.production
# Cole as variáveis de ambiente
# Ctrl+X, Y, Enter para salvar
```

4. **Fazer build:**

```bash
npm run build
```

5. **Iniciar com PM2:**

```bash
pm2 start npm --name "turbo-gestor" -- start
pm2 save
pm2 startup
```

6. **Verificar status:**

```bash
pm2 status
pm2 logs turbo-gestor
```

### Passo 4: Configurar Nginx (Proxy Reverso)

1. **Instalar Nginx:**

```bash
sudo apt-get install nginx
```

2. **Criar configuração do site:**

```bash
sudo nano /etc/nginx/sites-available/turbo-gestor
```

Cole este conteúdo:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Ativar site:**

```bash
sudo ln -s /etc/nginx/sites-available/turbo-gestor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 5: Configurar SSL (HTTPS)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### Passo 6: Configurar Cron Job

1. **Editar crontab:**

```bash
crontab -e
```

2. **Adicionar linha (executa diariamente às 10h UTC):**

```bash
0 10 * * * curl -X POST https://seudominio.com/api/cron/trial-emails -H "Authorization: Bearer turbo_cron_secret_2025"
```

---

## Opção 2: Hostinger Hospedagem Compartilhada

**⚠️ LIMITAÇÕES:** A hospedagem compartilhada da Hostinger tem limitações para Next.js. É mais adequado para sites estáticos.

### Se você tem Node.js na hospedagem compartilhada:

1. Acesse o painel da Hostinger
2. Vá em "Gerenciador de Arquivos"
3. Faça upload dos arquivos via FTP ou Git
4. Configure o Node.js Application
5. Aponte para o arquivo `.next/standalone/server.js`

---

## ⚙️ Configurações Importantes

### 1. Atualizar Stripe Webhook

Após deploy, configure o webhook do Stripe para apontar para:
```
https://seudominio.com/api/stripe/webhook
```

### 2. Atualizar Google OAuth

No Google Cloud Console, adicione:
- **Authorized JavaScript origins:** `https://seudominio.com`
- **Authorized redirect URIs:** (já está configurado com Supabase)

### 3. Atualizar Resend (opcional)

Configure domínio personalizado no Resend:
- Domain: `seudominio.com`
- Emails serão enviados de: `noreply@seudominio.com`

---

## 🔄 Atualizar Aplicação (Deploy Contínuo)

Para atualizar depois de fazer mudanças:

```bash
cd /var/www/turbo-gestor
git pull
npm install
npm run build
pm2 restart turbo-gestor
```

---

## 📊 Comandos Úteis PM2

```bash
pm2 status              # Ver status
pm2 logs turbo-gestor   # Ver logs
pm2 restart turbo-gestor # Reiniciar
pm2 stop turbo-gestor    # Parar
pm2 delete turbo-gestor  # Remover
```

---

## 🐛 Troubleshooting

### Erro de porta ocupada:
```bash
lsof -ti:3000 | xargs kill -9
pm2 restart turbo-gestor
```

### Erro de build:
```bash
rm -rf .next
npm run build
```

### Ver logs detalhados:
```bash
pm2 logs turbo-gestor --lines 100
```

---

## ✅ Checklist Pré-Deploy

- [ ] Criar chaves de produção no Stripe
- [ ] Configurar webhook do Stripe
- [ ] Atualizar `.env.production` com dados reais
- [ ] Testar build local (`npm run build`)
- [ ] Configurar domínio no DNS
- [ ] Instalar SSL/HTTPS
- [ ] Configurar cron job
- [ ] Testar pagamentos em produção
- [ ] Testar login com Google
- [ ] Testar envio de emails

---

## 📱 Contato Hostinger

Se tiver dúvidas sobre configuração do VPS:
- Suporte: https://www.hostinger.com.br/suporte
- Chat ao vivo disponível 24/7
