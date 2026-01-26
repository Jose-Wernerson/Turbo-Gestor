# Configuração de Login com Google

## Passo 1: Configurar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure a tela de consentimento (se ainda não configurou):
   - User Type: External
   - App name: Turbo Gestor
   - User support email: seu email
   - Developer contact: seu email
6. Ao criar o OAuth Client ID:
   - Application type: **Web application**
   - Name: Turbo Gestor
   - Authorized JavaScript origins:
     - `http://localhost:3000` (desenvolvimento)
     - Seu domínio de produção (ex: `https://turbogestor.com`)
   - Authorized redirect URIs:
     - `https://tymmlyyisqtnddxpbkoh.supabase.co/auth/v1/callback`

7. Copie o **Client ID** e **Client Secret**

## Passo 2: Configurar Supabase

1. Acesse seu [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication** > **Providers**
3. Encontre **Google** e clique em **Enable**
4. Cole o **Client ID** e **Client Secret** do Google
5. Salve as configurações

## Passo 3: Configurar o Callback

A URL de callback já está configurada no código:
```
https://tymmlyyisqtnddxpbkoh.supabase.co/auth/v1/callback
```

Certifique-se de adicionar esta URL nas **Authorized redirect URIs** no Google Cloud Console.

## Passo 4: Testar

1. Reinicie o servidor de desenvolvimento
2. Acesse a página de login ou cadastro
3. Clique no botão "Continuar com Google"
4. Autorize o aplicativo
5. Você será redirecionado para o dashboard

## Importante

- Usuários que fazem login com Google pela primeira vez terão uma conta criada automaticamente
- O trial de 7 dias é aplicado automaticamente
- O nome e email são obtidos da conta Google
- Nome da oficina será solicitado após o primeiro login (próxima feature)
