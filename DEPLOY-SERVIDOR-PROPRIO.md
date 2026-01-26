# 🚀 Deploy Turbo Gestor em Servidor Próprio

## ✅ Você já tem:
- Hospedagem própria
- Domínio: turbogestor.com.br

## 📋 Checklist de Deploy

### 1️⃣ Preparar Build de Produção (10 minutos)

#### Criar arquivo .env.production
```bash
# No seu servidor, crie este arquivo
NEXT_PUBLIC_SUPABASE_URL=https://tymmlyyisqtnddxpbkoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_coMIJ6-i5x1Rd4So3ABYow_Y8txGzzL
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AXoeiARgHnDd1KVODNr9mg_Nhq5QnlR

# Trocar para chaves LIVE do Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_SUA_CHAVE_AQUI
STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_PRODUÇÃO

# URL do seu domínio
NEXT_PUBLIC_APP_URL=https://turbogestor.com.br
```

#### Build do Projeto
```bash
# No seu computador ou servidor
cd /caminho/do/projeto
npm run build
```

### 2️⃣ Subir para o Servidor

#### Opção A: Via FTP/SFTP
```bash
# Arquivos necessários:
- .next/ (pasta completa)
- node_modules/ (ou rodar npm install no servidor)
- public/
- package.json
- package-lock.json
- next.config.js
- .env.production
```

#### Opção B: Via Git + SSH (Recomendado)
```bash
# No servidor via SSH:
cd /var/www/turbogestor
git clone [seu-repositorio]
npm install
npm run build
```

### 3️⃣ Configurar Servidor Web

#### Se usar Apache (.htaccess)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^$ http://localhost:3000/ [P,L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

#### Se usar Nginx
```nginx
server {
    listen 80;
    server_name turbogestor.com.br www.turbogestor.com.br;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name turbogestor.com.br www.turbogestor.com.br;

    # SSL - Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/turbogestor.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/turbogestor.com.br/privkey.pem;

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

### 4️⃣ Configurar SSL (HTTPS)

#### Instalar Certbot (Let's Encrypt - Grátis)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d turbogestor.com.br -d www.turbogestor.com.br
```

### 5️⃣ Manter Aplicação Rodando (PM2)

#### Instalar PM2
```bash
sudo npm install -g pm2
```

#### Criar arquivo ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'turbo-gestor',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/turbogestor',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};
```

#### Iniciar com PM2
```bash
cd /var/www/turbogestor
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6️⃣ Configurar Webhook Stripe Produção

#### No Dashboard Stripe
1. Ir em **Developers → Webhooks**
2. Clicar em **Add endpoint**
3. URL: `https://turbogestor.com.br/api/stripe/webhook`
4. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copiar o **Signing secret** (whsec_...)
6. Adicionar no arquivo `.env.production` no servidor

### 7️⃣ Ativar Stripe Live Mode

#### Obter Chaves Live
1. Dashboard Stripe → **Developers → API Keys**
2. Toggle: **View test data** → OFF
3. Copiar:
   - **Publishable key** (pk_live_...)
   - **Secret key** (sk_live_...)
4. Atualizar `.env.production`

### 8️⃣ Comandos Úteis PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs turbo-gestor

# Reiniciar após mudanças
pm2 restart turbo-gestor

# Parar aplicação
pm2 stop turbo-gestor

# Remover do PM2
pm2 delete turbo-gestor
```

### 9️⃣ Checklist Pré-Lançamento

- [ ] Build rodando sem erros
- [ ] HTTPS funcionando (cadeado verde)
- [ ] Variáveis de ambiente corretas
- [ ] Webhook Stripe configurado
- [ ] Testar cadastro de novo usuário
- [ ] Testar login
- [ ] Testar todos os CRUDs
- [ ] Testar pagamento com cartão real (R$ 1,00)
- [ ] Verificar se plano atualiza
- [ ] Testar em mobile
- [ ] Verificar console do navegador (sem erros)

### 🔟 Script de Deploy Automático

Crie um arquivo `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do Turbo Gestor..."

# Ir para diretório
cd /var/www/turbogestor

# Backup do .env
cp .env.production .env.production.backup

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Build
npm run build

# Reiniciar PM2
pm2 restart turbo-gestor

echo "✅ Deploy concluído!"
echo "📊 Verificando status:"
pm2 status turbo-gestor
```

Tornar executável:
```bash
chmod +x deploy.sh
```

Usar:
```bash
./deploy.sh
```

## 🎯 Comandos de Teste Final

```bash
# Testar se está respondendo
curl https://turbogestor.com.br

# Testar webhook
curl -X POST https://turbogestor.com.br/api/stripe/webhook

# Ver logs em tempo real
pm2 logs turbo-gestor --lines 50
```

## 🆘 Troubleshooting

### Erro: "Application Error"
```bash
# Ver logs
pm2 logs turbo-gestor

# Verificar variáveis de ambiente
pm2 env 0
```

### Erro: "Cannot connect to database"
- Verificar se SUPABASE_URL está correto
- Verificar firewall do servidor
- Testar conexão: `curl https://tymmlyyisqtnddxpbkoh.supabase.co`

### Webhook não funciona
- Verificar logs do Stripe Dashboard
- Testar URL: `curl https://turbogestor.com.br/api/stripe/webhook`
- Verificar se STRIPE_WEBHOOK_SECRET está correto

## 📊 Monitoramento

### Instalar Monitoramento PM2 Plus (Opcional)
```bash
pm2 plus
# Seguir instruções para criar conta
```

### Logs Simples
```bash
# Ver últimas 100 linhas
pm2 logs --lines 100

# Seguir logs em tempo real
pm2 logs --follow
```

## 🔐 Segurança

### Firewall Básico (UFW)
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Atualizar Certificado SSL (Automático)
O Certbot renova automaticamente, mas pode testar:
```bash
sudo certbot renew --dry-run
```

## ✅ Sistema Pronto para Produção!

Após seguir todos os passos, seu sistema estará em:
**https://turbogestor.com.br**

Próximo passo: **Conseguir primeira assinatura!** 🎉

Consulte [PRIMEIRAS-ASSINATURAS.md](PRIMEIRAS-ASSINATURAS.md) para estratégias de marketing.

---

**Dúvidas? Entre em contato!** 🚀
