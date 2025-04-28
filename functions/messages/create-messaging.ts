import { v4 as uuidv4 } from 'uuid'
interface Messaging {
    subject: string
    content: string
    users: string[]
}

export async function createMessaging(data: Messaging) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/messaging/messages/email`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
                    'X-Appwrite-Key': `${process.env.NEXT_PUBLIC_APP_WRITE_KEY}`,
                },
                body: JSON.stringify({
                    messageId: uuidv4(),
                    subject: data.subject,
                    content: data.content,
                    topics: [],
                    users: data.users,
                    targets: [],
                    cc: [],
                    bcc: [],
                    attachments: [],
                    draft: false,
                    html: true,
                    scheduledAt: '',
                }),
            }
        )

        if (!response.ok) {
            throw new Error(`Falha ao enviar mensagem: ${await response.text()}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error)
        throw error
    }
}
