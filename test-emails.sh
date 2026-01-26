#!/bin/bash

# Script para testar os emails do Turbo Gestor
# Uso: ./test-emails.sh [tipo] [email]

API_URL="http://localhost:3000"
EMAIL=${2:-"teste@exemplo.com"}
NOME="Teste Usuario"

case $1 in
  "welcome")
    echo "📧 Enviando email de boas-vindas para $EMAIL..."
    curl -X POST $API_URL/api/emails/welcome \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"nome\":\"$NOME\"}"
    ;;
  
  "expiring3")
    echo "⏰ Enviando email de trial expirando em 3 dias para $EMAIL..."
    curl -X POST $API_URL/api/emails/trial-expiring \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"nome\":\"$NOME\",\"diasRestantes\":3}"
    ;;
  
  "expiring1")
    echo "⏰ Enviando email de trial expirando em 1 dia para $EMAIL..."
    curl -X POST $API_URL/api/emails/trial-expiring \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"nome\":\"$NOME\",\"diasRestantes\":1}"
    ;;
  
  "expired")
    echo "🚀 Enviando email de trial expirado para $EMAIL..."
    curl -X POST $API_URL/api/emails/trial-expired \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"nome\":\"$NOME\"}"
    ;;
  
  "payment")
    echo "💳 Enviando email de confirmação de pagamento para $EMAIL..."
    curl -X POST $API_URL/api/emails/payment-confirmation \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"nome\":\"$NOME\",\"plano\":\"Profissional\",\"valor\":\"R$ 97,00\",\"dataPagamento\":\"25/01/2026\",\"proximaCobranca\":\"25/02/2026\"}"
    ;;
  
  "cron")
    echo "🔄 Executando cron job de trial emails..."
    curl -X POST $API_URL/api/cron/trial-emails \
      -H "Authorization: Bearer turbo_cron_secret_2025"
    ;;
  
  *)
    echo "❌ Uso: ./test-emails.sh [tipo] [email]"
    echo ""
    echo "Tipos disponíveis:"
    echo "  welcome      - Email de boas-vindas"
    echo "  expiring3    - Trial expirando em 3 dias"
    echo "  expiring1    - Trial expirando em 1 dia"
    echo "  expired      - Trial expirado"
    echo "  payment      - Confirmação de pagamento"
    echo "  cron         - Executar cron job manualmente"
    echo ""
    echo "Exemplo: ./test-emails.sh welcome seu@email.com"
    exit 1
    ;;
esac

echo ""
echo "✅ Email enviado!"
