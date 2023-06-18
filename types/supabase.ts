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
      template_attributes: {
        Row: {
          id: string
          name: string
          template_id: string | null
        }
        Insert: {
          id?: string
          name: string
          template_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_attributes_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "templates"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          auth: Json | null
          confirmation_code: string | null
          confirmed: boolean | null
          org_email: string
          org_name: string
          user_id: string | null
        }
        Insert: {
          address: string
          auth?: Json | null
          confirmation_code?: string | null
          confirmed?: boolean | null
          org_email: string
          org_name: string
          user_id?: string | null
        }
        Update: {
          address?: string
          auth?: Json | null
          confirmation_code?: string | null
          confirmed?: boolean | null
          org_email?: string
          org_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
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
