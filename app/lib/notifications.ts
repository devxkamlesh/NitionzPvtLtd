import { addDoc, collection } from 'firebase/firestore'
import { db } from './firebase'

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date()
    })
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

export const notifyKYCStatusChange = async (
  userId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
) => {
  const title = status === 'approved' ? 'KYC Approved!' : 'KYC Needs Attention'
  const message = status === 'approved'
    ? 'Your KYC verification has been approved. You can now start investing!'
    : `Your KYC verification was rejected. Reason: ${rejectionReason}`

  await createNotification(userId, title, message, status === 'approved' ? 'success' : 'warning')
}

export const notifyInvestmentConfirmation = async (
  userId: string,
  planName: string,
  amount: number
) => {
  await createNotification(
    userId,
    'Investment Confirmed!',
    `Your investment in ${planName} for ₹${amount.toLocaleString()} has been confirmed.`,
    'success'
  )
}

export const notifyPaymentReceived = async (
  userId: string,
  planName: string,
  amount: number
) => {
  await createNotification(
    userId,
    'Payment Received!',
    `We have received your payment of ₹${amount.toLocaleString()} for ${planName}. Your investment is now active.`,
    'success'
  )
}

export const notifySupportResponse = async (
  userId: string,
  querySubject: string
) => {
  await createNotification(
    userId,
    'Query Response',
    `You have a new response for your query: "${querySubject}"`,
    'info'
  )
}

export const notifyQueryResponse = async (
  userId: string,
  querySubject: string,
  queryType: 'general' | 'priority' = 'general'
) => {
  const message = queryType === 'priority' 
    ? `You have a new response for your priority query: "${querySubject}". You can reply to continue the conversation.`
    : `You have a new response for your query: "${querySubject}". Check your queries to view the response.`
    
  await createNotification(
    userId,
    'Query Response',
    message,
    queryType === 'priority' ? 'success' : 'info'
  )
}