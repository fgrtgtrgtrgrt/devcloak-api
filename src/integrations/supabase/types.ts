export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      hwid_resets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          id: string
          key_id: string
          new_hwid: string | null
          old_hwid: string | null
          requested_at: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          key_id: string
          new_hwid?: string | null
          old_hwid?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          key_id?: string
          new_hwid?: string | null
          old_hwid?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hwid_resets_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "script_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      script_executions: {
        Row: {
          error_message: string | null
          executed_at: string
          executor_hwid: string | null
          executor_ip: string | null
          id: string
          key_id: string | null
          script_id: string
          success: boolean
          user_agent: string | null
        }
        Insert: {
          error_message?: string | null
          executed_at?: string
          executor_hwid?: string | null
          executor_ip?: string | null
          id?: string
          key_id?: string | null
          script_id: string
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          error_message?: string | null
          executed_at?: string
          executor_hwid?: string | null
          executor_ip?: string | null
          id?: string
          key_id?: string | null
          script_id?: string
          success?: boolean
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "script_executions_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "script_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_executions_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      script_keys: {
        Row: {
          created_at: string
          current_uses: number
          expires_at: string | null
          hwid_lock_enabled: boolean
          hwid_locked: string | null
          id: string
          is_active: boolean
          is_premium: boolean
          key_value: string
          last_used_at: string | null
          max_uses: number | null
          script_id: string
        }
        Insert: {
          created_at?: string
          current_uses?: number
          expires_at?: string | null
          hwid_lock_enabled?: boolean
          hwid_locked?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          key_value: string
          last_used_at?: string | null
          max_uses?: number | null
          script_id: string
        }
        Update: {
          created_at?: string
          current_uses?: number
          expires_at?: string | null
          hwid_lock_enabled?: boolean
          hwid_locked?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          key_value?: string
          last_used_at?: string | null
          max_uses?: number | null
          script_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_keys_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      script_whitelist: {
        Row: {
          created_at: string
          id: string
          identifier: string
          identifier_type: Database["public"]["Enums"]["whitelist_type"]
          is_active: boolean
          note: string | null
          script_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          identifier_type: Database["public"]["Enums"]["whitelist_type"]
          is_active?: boolean
          note?: string | null
          script_id: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          identifier_type?: Database["public"]["Enums"]["whitelist_type"]
          is_active?: boolean
          note?: string | null
          script_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_whitelist_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          anti_dump: boolean
          anti_hook: boolean
          anti_tamper: boolean
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_premium: boolean
          name: string
          obfuscated_code: string | null
          original_code: string
          protection_mode: Database["public"]["Enums"]["protection_mode"]
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          anti_dump?: boolean
          anti_hook?: boolean
          anti_tamper?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          name: string
          obfuscated_code?: string | null
          original_code: string
          protection_mode?: Database["public"]["Enums"]["protection_mode"]
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          anti_dump?: boolean
          anti_hook?: boolean
          anti_tamper?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          name?: string
          obfuscated_code?: string | null
          original_code?: string
          protection_mode?: Database["public"]["Enums"]["protection_mode"]
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      user_blacklist: {
        Row: {
          created_at: string
          created_by: string
          id: string
          identifier: string
          identifier_type: Database["public"]["Enums"]["whitelist_type"]
          is_global: boolean
          reason: string | null
          script_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          identifier: string
          identifier_type: Database["public"]["Enums"]["whitelist_type"]
          is_global?: boolean
          reason?: string | null
          script_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          identifier?: string
          identifier_type?: Database["public"]["Enums"]["whitelist_type"]
          is_global?: boolean
          reason?: string | null
          script_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_blacklist_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      protection_mode: "key" | "whitelist" | "keyless"
      whitelist_type: "roblox_id" | "username" | "hwid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      protection_mode: ["key", "whitelist", "keyless"],
      whitelist_type: ["roblox_id", "username", "hwid"],
    },
  },
} as const
