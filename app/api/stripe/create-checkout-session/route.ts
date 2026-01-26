import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { plano } = await req.json();

    // Validar plano
    if (!plano || !["profissional", "business"].includes(plano)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // Buscar dados da oficina
    const { data: oficina } = await supabase
      .from("oficinas")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!oficina) {
      return NextResponse.json({ error: "Oficina não encontrada" }, { status: 404 });
    }

    // Definir preços por plano
    const precos: Record<string, number> = {
      profissional: 19700, // R$ 197,00 em centavos
      business: 0, // Business é personalizado, não tem checkout automático
    };

    // Se for Business, retornar erro pois precisa de contato comercial
    if (plano === "business") {
      return NextResponse.json(
        { error: "Plano Business requer contato comercial" },
        { status: 400 }
      );
    }

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Turbo Gestor - Plano ${plano.charAt(0).toUpperCase() + plano.slice(1)}`,
              description: `Assinatura mensal do plano ${plano}`,
              images: [`${process.env.NEXT_PUBLIC_APP_URL}/logo.webp`],
            },
            unit_amount: precos[plano],
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/planos?success=true&plano=${plano}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/planos/upgrade?plano=${plano}&canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plano: plano,
        oficinaId: oficina.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plano: plano,
          oficinaId: oficina.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}
