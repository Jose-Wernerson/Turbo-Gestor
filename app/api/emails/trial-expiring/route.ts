import { NextRequest, NextResponse } from "next/server";
import { sendTrialExpiringEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, nome, diasRestantes } = await req.json();

    if (!email || !nome || diasRestantes === undefined) {
      return NextResponse.json(
        { error: "Email, nome e diasRestantes são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await sendTrialExpiringEmail(email, nome, diasRestantes);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na rota de email de trial expirando:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    );
  }
}
