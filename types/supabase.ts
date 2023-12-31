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
      attributes: {
        Row: {
          id: string
          name: string
          svg_id: string
          template_id: string
          type_id: string
        }
        Insert: {
          id?: string
          name: string
          svg_id: string
          template_id: string
          type_id: string
        }
        Update: {
          id?: string
          name?: string
          svg_id?: string
          template_id?: string
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attributes_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attributes_type_id_fkey"
            columns: ["type_id"]
            referencedRelation: "types"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          description: string | null
          id: string
          is_public: boolean
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      types: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
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
          confirmation_code: string | null
          confirmed: boolean | null
          org_email: string
          org_name: string
          user_id: string | null
        }
        Insert: {
          address: string
          confirmation_code?: string | null
          confirmed?: boolean | null
          org_email: string
          org_name: string
          user_id?: string | null
        }
        Update: {
          address?: string
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
