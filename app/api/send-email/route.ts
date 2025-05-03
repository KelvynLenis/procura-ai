import { NextResponse } from 'next/server';
import { sendEmail } from '@/functions/messages/messaging-sdk';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, content, users } = body;

    const result = await sendEmail({
      subject,
      content,
      users,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao enviar email' },
      { status: 500 }
    );
  }
} 