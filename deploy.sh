#!/bin/bash

# Script de Deploy Automático - Turbo Gestor
# Uso: ./deploy.sh

echo "🚀 Iniciando deploy do Turbo Gestor..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Passo 1: Verificar Node.js
echo -e "\n${YELLOW}📦 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+${NC}"
    exit 1
fi
node --version

# Passo 2: Instalar dependências
echo -e "\n${YELLOW}📦 Instalando dependências...${NC}"
npm install

# Passo 3: Verificar .env.production
echo -e "\n${YELLOW}🔍 Verificando variáveis de ambiente...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}⚠️  Arquivo .env.production não encontrado!${NC}"
    echo -e "${YELLOW}Criando template...${NC}"
    cat > .env.production << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tymmlyyisqtnddxpbkoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_coMIJ6-i5x1Rd4So3ABYow_Y8txGzzL
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AXoeiARgHnDd1KVODNr9mg_Nhq5QnlR

# Stripe (ALTERAR PARA CHAVES DE PRODUÇÃO!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_SEU_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_SUA_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET

# App URL (ALTERAR PARA SEU DOMÍNIO!)
NEXT_PUBLIC_APP_URL=https://seudominio.com

# Resend
RESEND_API_KEY=re_ijLbMHZE_Q3QK3NEgdnjn3ZhddxLxMFms

# Cron Secret
CRON_SECRET=turbo_cron_secret_2025
EOF
    echo -e "${YELLOW}⚠️  Edite o arquivo .env.production antes de continuar!${NC}"
    exit 1
fi

# Passo 4: Build
echo -e "\n${YELLOW}🔨 Construindo aplicação...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

# Passo 5: Verificar PM2
echo -e "\n${YELLOW}🔍 Verificando PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando PM2...${NC}"
    npm install -g pm2
fi

# Passo 6: Parar instância anterior (se existir)
echo -e "\n${YELLOW}🔄 Parando instância anterior...${NC}"
pm2 stop turbo-gestor 2>/dev/null || true
pm2 delete turbo-gestor 2>/dev/null || true

# Passo 7: Iniciar aplicação
echo -e "\n${YELLOW}🚀 Iniciando aplicação com PM2...${NC}"
pm2 start npm --name "turbo-gestor" -- start
pm2 save

# Passo 8: Verificar status
echo -e "\n${YELLOW}📊 Status da aplicação:${NC}"
pm2 status

# Passo 9: Instruções finais
echo -e "\n${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "\n${YELLOW}📝 Próximos passos:${NC}"
echo "1. Configure o Nginx como proxy reverso"
echo "2. Instale SSL com Certbot"
echo "3. Configure o cron job para emails"
echo "4. Atualize o webhook do Stripe"
echo "5. Teste o aplicativo em produção"
echo -e "\n${YELLOW}📊 Comandos úteis:${NC}"
echo "  pm2 logs turbo-gestor  # Ver logs"
echo "  pm2 restart turbo-gestor  # Reiniciar"
echo "  pm2 stop turbo-gestor  # Parar"
echo -e "\n${GREEN}🌐 Aplicação rodando em: http://localhost:3000${NC}"
