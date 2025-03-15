export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          location: string
          experience: string
          description: string
          application_link: string
          source: string
          posted_date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          location: string
          experience: string
          description: string
          application_link: string
          source: string
          posted_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string
          experience?: string
          description?: string
          application_link?: string
          source?: string
          posted_date?: string
          created_at?: string
        }
      }
    }
  }
}