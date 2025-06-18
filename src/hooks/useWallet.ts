import { useEffect, useState } from 'react'
import * as walletApi from '@/lib/supabase/wallet'
import { type Transaction } from '@/types/database.types'

export function useWallet(userId: string | undefined) {
  const [balance, setBalance] = useState<number>(0)
  const [holds, setHolds] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadWallet() {
      if (!userId) return
      
      try {
        const data = await walletApi.getWalletBalance(userId)
        setBalance(data.wallet_balance)
        setHolds(data.holds)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load wallet'))
      } finally {
        setLoading(false)
      }
    }

    loadWallet()
  }, [userId])

  return { balance, holds, availableBalance: balance - holds, loading, error }
}

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadTransactions() {
      if (!userId) return
      
      try {
        const data = await walletApi.getTransactionHistory(userId)
        setTransactions(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load transactions'))
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [userId])

  return { transactions, loading, error }
}
