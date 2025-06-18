import supabaseClient from './supabaseClient'
import { type TransactionType } from '@/types/database.types'

export async function getWalletBalance(userId: string) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('wallet_balance, holds')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getTransactionHistory(userId: string) {
  const { data, error } = await supabaseClient
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createTransaction(transaction: {
  user_id: string
  amount: number
  type: TransactionType
  group_id?: string | null
  paystack_ref?: string | null
  description?: string | null
}) {
  const { data, error } = await supabaseClient
    .from('transactions')
    .insert({
      ...transaction,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// This function would typically be called from a secure server context
export async function updateWalletBalance(userId: string, amount: number) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .update({
      wallet_balance: amount,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTransactionStatus(
  transactionId: string,
  status: 'completed' | 'failed' | 'refunded'
) {
  const { data, error } = await supabaseClient
    .from('transactions')
    .update({ status })
    .eq('id', transactionId)
    .select()
    .single()

  if (error) throw error
  return data
}
