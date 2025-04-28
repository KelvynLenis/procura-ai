import { Client, Messaging } from 'node-appwrite'
import { v4 as uuidv4 } from 'uuid'

interface MessagingProps {
  subject: string
  content: string
  users: string[]
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_API_URL || '')
  .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '')
  .setKey(process.env.NEXT_PUBLIC_APP_WRITE_KEY || '')

const messaging = new Messaging(client)

export async function sendEmail(data: MessagingProps) {
  try {
    const message = await messaging.createEmail(
      uuidv4(), // messageId
      data.subject, // subject
      data.content, // content
      [], // topics
      data.users, // users
      [], // targets
      [], // cc
      [], // bcc
      [], // attachments
      false, // draft
      true, // html
      '' // scheduledAt
    )

    console.log(message)

    return message
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    throw new Error('Falha ao enviar email. Por favor, tente novamente.')
  }
} 