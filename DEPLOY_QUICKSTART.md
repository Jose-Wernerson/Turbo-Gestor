# 🚀 Deploy Rápido - Hostinger VPS

## Preparação Local

1. **Criar `.env.production`:**
```bash
cp .env.production.example .env.production
nano .env.production  # Editar com dados reais
```

2. **Obter chaves de produção do Stripe:**
   - Acesse: https://dashboard.stripe.com/apikeys
   - Copie as chaves que começam com `pk_live_` e `sk_live_`
   - Configure webhook em: https://dashboard.stripe.com/webhooks
   - URL do webhook: `https://seudominio.com/api/stripe/webhook`

3. **Fazer upload para GitHub (ou outro Git):**
```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

---

## No Servidor VPS (via SSH)

### 1. Conectar ao VPS
```bash
ssh root@SEU_IP_HOSTINGER
```

### 2. Instalar dependências (primeira vez)
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PM2
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar Git
apt install -y git
```

### 3. Clonar projeto
```bash
cd /var/www
git clone SEU_REPOSITORIO_GIT turbo-gestor
cd turbo-gestor
```

### 4. Executar deploy
```bash
./deploy.sh
```

### 5. Configurar Nginx
```bash
# Copiar configuração
cp nginx.conf /etc/nginx/sites-available/turbo-gestor

# Editar com seu domínio
nano /etc/nginx/sites-available/turbo-gestor
# Substituir "seudominio.com" pelo seu domínio real

# Ativar site
ln -s /etc/nginx/sites-available/turbo-gestor /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. Instalar SSL (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 7. Configurar Cron Job
```bash
crontab -e
```
Adicionar linha:
```
0 10 * * * curl -X POST https://seudominio.com/api/cron/trial-emails -H "Authorization: Bearer turbo_cron_secret_2025"
```

---

## Configurações Pós-Deploy

### Stripe Webhook
1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint: `https://seudominio.com/api/stripe/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o webhook secret e atualize `.env.production`

### Google OAuth
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Edite seu OAuth Client ID
3. Adicione em "Authorized JavaScript origins":
   - `https://seudominio.com`

---

## Atualizações Futuras

```bash
cd /var/www/turbo-gestor
git pull
npm install
npm run build
pm2 restart turbo-gestor
```

---

## Monitoramento

```bash
pm2 status                  # Ver status
pm2 logs turbo-gestor       # Ver logs em tempo real
pm2 monit                   # Monitor interativo
```

---

## Troubleshooting

### Aplicação não inicia
```bash
pm2 logs turbo-gestor --lines 50
```

### Porta 3000 ocupada
```bash
lsof -ti:3000 | xargs kill -9
pm2 restart turbo-gestor
```

### Erro de build
```bash
rm -rf .next node_modules
npm install
npm run build
pm2 restart turbo-gestor
```

---

## ✅ Checklist Final

- [ ] Node.js 18+ instalado
- [ ] Projeto clonado e build feito
- [ ] PM2 rodando aplicação
- [ ] Nginx configurado como proxy
- [ ] SSL/HTTPS ativo
- [ ] Cron job configurado
- [ ] Stripe webhook atualizado
- [ ] Google OAuth atualizado
- [ ] Teste de pagamento em produção
- [ ] Teste de envio de emails
- [ ] Teste de login com Google

🎉 **Pronto! Seu SaaS está no ar!**
