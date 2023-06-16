export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          form: Json
          id: string
          name: string
        }
        Insert: {
          form: Json
          id: string
          name: string
        }
        Update: {
          form?: Json
          id?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth: Json | null
          org_email: string
          org_name: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          auth?: Json | null
          org_email: string
          org_name: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          auth?: Json | null
          org_email?: string
          org_name?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
