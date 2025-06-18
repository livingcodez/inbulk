import { useEffect, useState } from 'react'
import { type Group } from '@/types/database.types'
import * as groupApi from '@/lib/supabase/groups'

export function useUserGroups(userId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadGroups() {
      if (!userId) return
      
      try {
        const data = await groupApi.getGroupsByUser(userId)
        setGroups(data.map(membership => membership.groups))
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load groups'))
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [userId])

  return { groups, loading, error }
}

export function useGroup(groupId: string | undefined) {
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadGroup() {
      if (!groupId) return
      
      try {
        const data = await groupApi.getGroupById(groupId)
        setGroup(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load group'))
      } finally {
        setLoading(false)
      }
    }

    loadGroup()
  }, [groupId])

  return { group, loading, error }
}
