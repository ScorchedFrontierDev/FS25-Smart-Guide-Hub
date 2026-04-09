// Auto-generated types matching the Supabase schema.
// To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      maps: {
        Row: {
          id: string
          slug: string
          name: string
          economy_type: string
          unique_mechanic: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['maps']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['maps']['Insert']>
      }
      dlcs: {
        Row: {
          id: string
          slug: string
          name: string
          tier: 'major' | 'machine_pack' | 'season_pass' | 'cosmetic'
          price: number
          free_default: boolean
          site_summary: string | null
          giants_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dlcs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['dlcs']['Insert']>
      }
      user_dlc_profile: {
        Row: {
          id: string
          user_id: string
          dlc_id: string
          is_owned: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_dlc_profile']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_dlc_profile']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      farmlands: {
        Row: {
          id: string
          map_id: string
          game_id: number
          price: number
          size_ha: number
          coord_x: number | null
          coord_y: number | null
          patch_version: string
          imported_at: string
        }
        Insert: Omit<Database['public']['Tables']['farmlands']['Row'], 'id' | 'imported_at'>
        Update: Partial<Database['public']['Tables']['farmlands']['Insert']>
      }
      sell_points: {
        Row: {
          id: string
          map_id: string
          game_name: string
          accepted_products: string[] | null
          coord_x: number | null
          coord_y: number | null
          patch_version: string
          imported_at: string
        }
        Insert: Omit<Database['public']['Tables']['sell_points']['Row'], 'id' | 'imported_at'>
        Update: Partial<Database['public']['Tables']['sell_points']['Insert']>
      }
      production_chains: {
        Row: {
          id: string
          map_id: string | null
          required_dlc_id: string | null
          name: string
          inputs: string[] | null
          outputs: string[] | null
          base_rate_per_hr: number | null
          sell_point_ids: string[] | null
          patch_version: string
          imported_at: string
        }
        Insert: Omit<Database['public']['Tables']['production_chains']['Row'], 'id' | 'imported_at'>
        Update: Partial<Database['public']['Tables']['production_chains']['Insert']>
      }
      guides: {
        Row: {
          id: string
          map_id: string | null
          required_dlc_id: string | null
          guide_type: 'survival' | 'standard' | 'advanced'
          playstyle: 'fishing' | 'farming' | 'mixed' | 'any' | null
          difficulty: 'easy' | 'standard' | 'hard' | 'survival' | null
          title: string
          content_blocks: Json
          total_steps: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['guides']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['guides']['Insert']>
      }
      user_saves: {
        Row: {
          id: string
          user_id: string
          map_id: string
          guide_id: string | null
          save_label: string | null
          challenge_name: string | null
          current_step: number
          total_steps: number
          phase: string | null
          completed_steps: Json
          last_played: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_saves']['Row'], 'id' | 'last_played' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_saves']['Insert']>
      }
      challenges: {
        Row: {
          id: string
          author_id: string
          map_id: string
          title: string
          category: 'financial' | 'roleplay' | 'equipment' | 'competitive'
          playstyle: 'fishing' | 'farming' | 'mixed' | null
          difficulty: number | null
          starting_budget: number | null
          scenario_rules: string | null
          hook: string | null
          phase_1: string | null
          phase_2: string | null
          phase_3: string | null
          win_condition: string | null
          mods_required: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          reviewed_by: string | null
          created_at: string
          reviewed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['challenges']['Row'], 'id' | 'status' | 'created_at'>
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>
      }
      challenge_dlc_requirements: {
        Row: {
          id: string
          challenge_id: string
          dlc_id: string
        }
        Insert: Omit<Database['public']['Tables']['challenge_dlc_requirements']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['challenge_dlc_requirements']['Insert']>
      }
      user_challenge_progress: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          status: 'active' | 'completed' | 'abandoned'
          notes: Json
          started_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_challenge_progress']['Row'], 'id' | 'started_at'>
        Update: Partial<Database['public']['Tables']['user_challenge_progress']['Insert']>
      }
      patch_import_log: {
        Row: {
          id: string
          patch_version: string
          table_affected: string
          record_game_id: string | null
          field_name: string
          old_value: string | null
          new_value: string | null
          status: 'pending' | 'approved' | 'rejected'
          flagged_at: string
          approved_at: string | null
          approved_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['patch_import_log']['Row'], 'id' | 'flagged_at'>
        Update: Partial<Database['public']['Tables']['patch_import_log']['Insert']>
      }
    }
    Functions: {
      get_user_dlc_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
    }
  }
}

// Convenience type aliases
export type Map        = Database['public']['Tables']['maps']['Row']
export type DLC        = Database['public']['Tables']['dlcs']['Row']
export type Guide      = Database['public']['Tables']['guides']['Row']
export type Challenge  = Database['public']['Tables']['challenges']['Row']
export type UserSave   = Database['public']['Tables']['user_saves']['Row']
export type Farmland   = Database['public']['Tables']['farmlands']['Row']
export type SellPoint  = Database['public']['Tables']['sell_points']['Row']
export type ProductionChain = Database['public']['Tables']['production_chains']['Row']
