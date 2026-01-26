# 🚀 Setup do Sistema de Emails

## ✅ Checklist de Configuração

### 1. Criar Conta no Resend
- [ ] Acessar [resend.com](https://resend.com)
- [ ] Criar conta gratuita
- [ ] Verificar email

### 2. Obter API Key
- [ ] Fazer login no Resend
- [ ] Ir em **API Keys**
- [ ] Criar nova API Key
- [ ] Copiar a chave (começa com `re_`)

### 3. Configurar Variáveis de Ambiente
- [ ] Abrir `.env.local`
- [ ] Adicionar: `RESEND_API_KEY=re_sua_chave_aqui`
- [ ] Salvar arquivo
- [ ] Reiniciar servidor de desenvolvimento

### 4. Testar Emails
- [ ] Executar: `./test-emails.sh welcome seu@email.com`
- [ ] Verificar inbox
- [ ] Confirmar recebimento

### 5. Configurar Domínio (Opcional - Produção)
- [ ] No Resend, adicionar seu domínio
- [ ] Configurar registros DNS (SPF, DKIM, etc.)
- [ ] Aguardar verificação
- [ ] Atualizar templates com novo domínio

### 6. Configurar Cron Job (Produção)
- [ ] Deploy no Vercel (vercel.json já configurado)
- [ ] OU configurar em cron-job.org
- [ ] Testar manualmente: `./test-emails.sh cron`

## 🎯 Comandos Rápidos

### Testar todos os emails
```bash
./test-emails.sh welcome seu@email.com
./test-emails.sh expiring3 seu@email.com
./test-emails.sh expiring1 seu@email.com
./test-emails.sh expired seu@email.com
./test-emails.sh payment seu@email.com
```

### Preview dos templates (desenvolvimento)
```bash
npx react-email dev
```
Acesse: http://localhost:3001

### Executar cron job manualmente
```bash
./test-emails.sh cron
```

## 📊 Monitoramento

Acesse o painel do Resend para ver:
- Emails enviados hoje
- Taxa de entrega
- Erros e bounces
- Logs detalhados

## 🔥 Troubleshooting

### Email não chega
1. Verifique a chave API no `.env.local`
2. Confira spam/lixeira
3. Veja logs no console do servidor
4. Verifique painel do Resend

### Erro "Invalid API Key"
- A chave foi copiada corretamente?
- O servidor foi reiniciado após adicionar a chave?
- A chave está ativa no Resend?

### Cron job não executa
- Verificar `CRON_SECRET` no `.env.local`
- Confirmar que está em produção (Vercel)
- Testar manualmente primeiro

## 📝 Notas Importantes

- **Desenvolvimento:** Use email de teste
- **Produção:** Configure domínio próprio
- **Limite gratuito:** 3000 emails/mês
- **Cron job:** Executa diariamente às 10h (horário UTC)

---

✅ **Sistema de emails pronto para uso!**
