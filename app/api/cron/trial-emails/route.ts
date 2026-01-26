import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    // Verificar se a requisição tem a chave de autorização correta
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const agora = new Date();
    const em3Dias = new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000);
    const em1Dia = new Date(agora.getTime() + 1 * 24 * 60 * 60 * 1000);

    // Buscar contas que expiram em 3 dias (e ainda não tem assinatura)
    const { data: trialsEm3Dias } = await supabaseAdmin
      .from("oficinas")
      .select("*")
      .is("stripe_subscription_id", null)
      .gte("trial_ends_at", agora.toISOString())
      .lte("trial_ends_at", em3Dias.toISOString());

    // Buscar contas que expiram em 1 dia (e ainda não tem assinatura)
    const { data: trialsEm1Dia } = await supabaseAdmin
      .from("oficinas")
      .select("*")
      .is("stripe_subscription_id", null)
      .gte("trial_ends_at", agora.toISOString())
      .lte("trial_ends_at", em1Dia.toISOString());

    // Buscar contas que já expiraram (e ainda não tem assinatura)
    const { data: trialsExpirados } = await supabaseAdmin
      .from("oficinas")
      .select("*")
      .is("stripe_subscription_id", null)
      .lt("trial_ends_at", agora.toISOString());

    let emailsEnviados = 0;

    // Enviar emails para trials que expiram em 3 dias
    if (trialsEm3Dias) {
      for (const oficina of trialsEm3Dias) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/trial-expiring`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: oficina.email,
              nome: oficina.nome || "Cliente",
              diasRestantes: 3,
            }),
          });
          emailsEnviados++;
        } catch (error) {
          console.error(`Erro ao enviar email para ${oficina.email}:`, error);
        }
      }
    }

    // Enviar emails para trials que expiram em 1 dia
    if (trialsEm1Dia) {
      for (const oficina of trialsEm1Dia) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/trial-expiring`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: oficina.email,
              nome: oficina.nome || "Cliente",
              diasRestantes: 1,
            }),
          });
          emailsEnviados++;
        } catch (error) {
          console.error(`Erro ao enviar email para ${oficina.email}:`, error);
        }
      }
    }

    // Enviar emails para trials já expirados
    if (trialsExpirados) {
      for (const oficina of trialsExpirados) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/trial-expired`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: oficina.email,
              nome: oficina.nome || "Cliente",
            }),
          });
          emailsEnviados++;
        } catch (error) {
          console.error(`Erro ao enviar email para ${oficina.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsEnviados,
      trialsEm3Dias: trialsEm3Dias?.length || 0,
      trialsEm1Dia: trialsEm1Dia?.length || 0,
      trialsExpirados: trialsExpirados?.length || 0,
    });
  } catch (error) {
    console.error("Erro no cron job de trial:", error);
    return NextResponse.json(
      { error: "Erro ao processar cron job" },
      { status: 500 }
    );
  }
}
