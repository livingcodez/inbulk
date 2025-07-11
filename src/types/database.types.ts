export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'buyer' | 'vendor' | 'admin'
export type ProductStatus = 'draft' | 'live' | 'sold' | 'in_review' | 'rejected' | 'audit'
export type GroupStatus = 'open' | 'waiting_votes' | 'captured' | 'delivered' | 'failed' | 'cancelled' | 'completed'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type TransactionType = 'deposit' | 'withdrawal' | 'escrow' | 'refund'
export type NotificationType = 'group_update' | 'payment' | 'system' | 'alert'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: UserRole
          wallet_balance: number
          holds: number
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          currency: string | null
          shipping_address: string | null
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          wallet_balance?: number
          holds?: number
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          currency?: string | null
          shipping_address?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          wallet_balance?: number
          holds?: number
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          currency?: string | null
          shipping_address?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          title: string
          description: string | null
          price: number
          image_url: string | null
          status: ProductStatus
          min_participants: number
          max_participants: number | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          title: string
          description?: string | null
          price: number
          image_url?: string | null
          status?: ProductStatus
          min_participants?: number
          max_participants?: number | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          title?: string
          description?: string | null
          price?: number
          image_url?: string | null
          status?: ProductStatus
          min_participants?: number
          max_participants?: number | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          product_id: string
          status: GroupStatus
          current_participants: number
          total_amount: number
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          status?: GroupStatus
          current_participants?: number
          total_amount: number
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          status?: GroupStatus
          current_participants?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          amount: number
          joined_at: string
          vote_status: 'pending' | 'approved' | 'rejected' | null
          is_admin: boolean
          first_name: string | null
          last_name: string | null
          shipping_address: string | null
          phone_number: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          amount: number
          joined_at?: string
          vote_status?: 'pending' | 'approved' | 'rejected' | null
          is_admin?: boolean
          first_name?: string | null
          last_name?: string | null
          shipping_address?: string | null
          phone_number?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          amount?: number
          joined_at?: string
          vote_status?: 'pending' | 'approved' | 'rejected' | null
          is_admin?: boolean
          first_name?: string | null
          last_name?: string | null
          shipping_address?: string | null
          phone_number?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: TransactionType
          amount: number
          status: TransactionStatus
          reference_id: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: TransactionType
          amount: number
          status?: TransactionStatus
          reference_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: TransactionType
          amount?: number
          status?: TransactionStatus
          reference_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          read: boolean
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          read?: boolean
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          read?: boolean
          reference_id?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      UserRole: UserRole
      ProductStatus: ProductStatus
      GroupStatus: GroupStatus
      TransactionType: TransactionType
      TransactionStatus: TransactionStatus
      NotificationType: NotificationType
    }
  }
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']

