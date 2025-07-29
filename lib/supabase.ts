import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          name: string
          description: string
          location: string
          profile_image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          name: string
          description: string
          location: string
          profile_image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          description?: string
          location?: string
          profile_image?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          price: number
          description: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          price: number
          description: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          price?: number
          description?: string
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
