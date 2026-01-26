import { NextRequest, NextResponse } from "next/server";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, nome, plano, valor, dataPagamento, proximaCobranca } = await req.json();

    if (!email || !nome || !plano || !valor || !dataPagamento || !proximaCobranca) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await sendPaymentConfirmationEmail(
      email,
      nome,
      plano,
      valor,
      dataPagamento,
      proximaCobranca
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na rota de email de confirmação de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    );
  }
}
