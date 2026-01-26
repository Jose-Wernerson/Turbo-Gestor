import { NextRequest, NextResponse } from "next/server";
import { sendTrialExpiredEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, nome } = await req.json();

    if (!email || !nome) {
      return NextResponse.json(
        { error: "Email e nome são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await sendTrialExpiredEmail(email, nome);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na rota de email de trial expirado:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    );
  }
}
