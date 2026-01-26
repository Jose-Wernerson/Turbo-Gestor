import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Sem assinatura" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Erro ao verificar webhook:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Processar eventos do Stripe
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Atualizar plano da oficina no banco
        const userId = session.metadata?.userId;
        const plano = session.metadata?.plano;

        if (userId && plano) {
          await supabaseAdmin
            .from("oficinas")
            .update({ 
              plano: plano,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq("id", userId);

          console.log(`Plano atualizado para ${plano} - Usuário: ${userId}`);

          // Buscar dados do usuário para enviar email
          const { data: oficina } = await supabaseAdmin
            .from("oficinas")
            .select("*")
            .eq("id", userId)
            .single();

          // Enviar email de confirmação de pagamento
          if (oficina) {
            const valor = plano === "profissional" ? "R$ 97,00" : "R$ 197,00";
            const dataPagamento = new Date().toLocaleDateString('pt-BR');
            const proximaCobranca = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

            try {
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/payment-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: oficina.email,
                  nome: oficina.nome || 'Cliente',
                  plano: plano === "profissional" ? "Profissional" : "Business",
                  valor,
                  dataPagamento,
                  proximaCobranca,
                }),
              });
            } catch (emailError) {
              console.error('Erro ao enviar email de confirmação:', emailError);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Atualizar status da assinatura
        const userId = subscription.metadata?.userId;

        if (userId) {
          const status = subscription.status;
          
          // Se a assinatura foi cancelada ou expirou, voltar para plano básico
          if (status === "canceled" || status === "unpaid") {
            await supabaseAdmin
              .from("oficinas")
              .update({ plano: "basico" })
              .eq("id", userId);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Assinatura cancelada - voltar para plano básico
          await supabaseAdmin
            .from("oficinas")
            .update({ 
              plano: "basico",
              stripe_subscription_id: null,
            })
            .eq("id", userId);

          console.log(`Assinatura cancelada - Usuário: ${userId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.error("Pagamento falhou:", invoice.id);
        // Aqui você pode enviar email notificando o usuário
        break;
      }

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar evento" },
      { status: 500 }
    );
  }
}
