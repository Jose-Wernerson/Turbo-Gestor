import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    // Verificar se é um novo usuário do Google
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Verificar se a oficina já existe
      const { data: oficina } = await supabase
        .from('oficinas')
        .select('*')
        .eq('id', user.id)
        .single();

      // Se for novo usuário (login com Google pela primeira vez), criar oficina com trial
      if (!oficina) {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 dias de teste grátis

        await supabase
          .from('oficinas')
          .insert({
            id: user.id,
            nome: user.user_metadata.full_name || user.email?.split('@')[0] || 'Minha Oficina',
            email: user.email,
            trial_ends_at: trialEndsAt.toISOString(),
            plano: 'basico',
          });

        // Enviar email de boas-vindas
        try {
          await fetch(`${requestUrl.origin}/api/emails/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              nome: user.user_metadata.full_name || user.email?.split('@')[0],
            }),
          });
        } catch (emailError) {
          console.error('Erro ao enviar email de boas-vindas:', emailError);
          // Não bloqueia o login se o email falhar
        }
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}

