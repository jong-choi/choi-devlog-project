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
      ai_summaries: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          post_id: string | null
          summary: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          post_id?: string | null
          summary: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          post_id?: string | null
          summary?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_summary_vectors: {
        Row: {
          summary_id: string
          vector: string | null
        }
        Insert: {
          summary_id: string
          vector?: string | null
        }
        Update: {
          summary_id?: string
          vector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_summary_vectors_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: true
            referencedRelation: "ai_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summary_vectors_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: true
            referencedRelation: "ai_summaries_with_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          order: number | null
          url_slug: string
          user_id: string | null
          velog_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          order?: number | null
          url_slug: string
          user_id?: string | null
          velog_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          order?: number | null
          url_slug?: string
          user_id?: string | null
          velog_id?: string | null
        }
        Relationships: []
      }
      cluster_similarities: {
        Row: {
          created_at: string | null
          id: string
          similarity: number
          source_id: string | null
          target_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          similarity: number
          source_id?: string | null
          target_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          similarity?: number
          source_id?: string | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clustered_posts_groups_similarities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clustered_posts_groups_similarities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "clusters_with_published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clustered_posts_groups_similarities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "clusters_with_vectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clustered_posts_groups_similarities_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clustered_posts_groups_similarities_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "clusters_with_published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clustered_posts_groups_similarities_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "clusters_with_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
      cluster_vectors: {
        Row: {
          cluster_id: string
          vector: string | null
        }
        Insert: {
          cluster_id: string
          vector?: string | null
        }
        Update: {
          cluster_id?: string
          vector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cluster_vectors_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: true
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_vectors_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: true
            referencedRelation: "clusters_with_published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_vectors_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: true
            referencedRelation: "clusters_with_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
      clusters: {
        Row: {
          created_at: string | null
          id: string
          keywords: string[] | null
          post_ids: string[] | null
          quality: number | null
          summary: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          post_ids?: string[] | null
          quality?: number | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          post_ids?: string[] | null
          quality?: number | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      post_similarities: {
        Row: {
          created_at: string | null
          id: string
          similarity: number
          source_post_id: string
          target_post_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          similarity: number
          source_post_id: string
          target_post_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          similarity?: number
          source_post_id?: string
          target_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_similarities_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tsvectors: {
        Row: {
          post_id: string
          tsv: unknown | null
        }
        Insert: {
          post_id: string
          tsv?: unknown | null
        }
        Update: {
          post_id?: string
          tsv?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "post_tsvectors_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tsvectors_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tsvectors_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tsvectors_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_private: boolean | null
          order: number | null
          released_at: string | null
          short_description: string | null
          subcategory_id: string
          thumbnail: string | null
          title: string
          updated_at: string | null
          url_slug: string
          user_id: string
          velog_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_private?: boolean | null
          order?: number | null
          released_at?: string | null
          short_description?: string | null
          subcategory_id: string
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          url_slug: string
          user_id?: string
          velog_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_private?: boolean | null
          order?: number | null
          released_at?: string | null
          short_description?: string | null
          subcategory_id?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          url_slug?: string
          user_id?: string
          velog_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_with_published_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          order: number | null
          recommended: boolean | null
          thumbnail: string | null
          url_slug: string
          user_id: string | null
          velog_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          order?: number | null
          recommended?: boolean | null
          thumbnail?: string | null
          url_slug: string
          user_id?: string | null
          velog_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order?: number | null
          recommended?: boolean | null
          thumbnail?: string | null
          url_slug?: string
          user_id?: string | null
          velog_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      todos_with_rls: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ai_summaries_with_vectors: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          post_id: string | null
          summary: string | null
          updated_at: string | null
          user_id: string | null
          vector: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
        ]
      }
      clusters_with_published_posts: {
        Row: {
          created_at: string | null
          id: string | null
          keywords: string[] | null
          post_count: number | null
          post_ids: string[] | null
          posts: Json | null
          quality: number | null
          summary: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      clusters_with_vectors: {
        Row: {
          created_at: string | null
          id: string | null
          keywords: string[] | null
          post_ids: string[] | null
          quality: number | null
          summary: string | null
          title: string | null
          updated_at: string | null
          vector: string | null
        }
        Relationships: []
      }
      post_similarities_with_target_info: {
        Row: {
          similarity: number | null
          source_post_id: string | null
          target_post_id: string | null
          target_thumbnail: string | null
          target_title: string | null
          target_url_slug: string | null
        }
        Relationships: []
      }
      published_posts: {
        Row: {
          body: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          is_private: boolean | null
          order: number | null
          released_at: string | null
          short_description: string | null
          subcategory_id: string | null
          thumbnail: string | null
          title: string | null
          updated_at: string | null
          url_slug: string | null
          user_id: string | null
          velog_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          is_private?: boolean | null
          order?: number | null
          released_at?: string | null
          short_description?: string | null
          subcategory_id?: string | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string | null
          url_slug?: string | null
          user_id?: string | null
          velog_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          is_private?: boolean | null
          order?: number | null
          released_at?: string | null
          short_description?: string | null
          subcategory_id?: string | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string | null
          url_slug?: string | null
          user_id?: string | null
          velog_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_with_published_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      published_posts_with_tags_summaries: {
        Row: {
          body: string | null
          id: string | null
          is_private: boolean | null
          order: number | null
          released_at: string | null
          short_description: string | null
          subcategory_id: string | null
          tags: Json[] | null
          thumbnail: string | null
          title: string | null
          url_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_with_published_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      published_posts_with_tags_summaries_tsv: {
        Row: {
          body: string | null
          id: string | null
          is_private: boolean | null
          order: number | null
          released_at: string | null
          short_description: string | null
          subcategory_id: string | null
          tags: Json[] | null
          thumbnail: string | null
          title: string | null
          tsv: unknown | null
          url_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_with_published_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories_with_published_meta: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string | null
          latest_post_date: string | null
          name: string | null
          order: number | null
          post_count: number | null
          recommended: boolean | null
          thumbnail: string | null
          url_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      batch_update_orders_for_categories: {
        Args: { data: Json }
        Returns: Json
      }
      batch_update_orders_for_posts: {
        Args: { data: Json }
        Returns: Json
      }
      batch_update_orders_for_subcategories: {
        Args: { data: Json }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      create_cluster_with_vector: {
        Args: {
          p_title: string
          p_summary: string
          p_keywords: string[]
          p_quality: number
          p_post_ids: string[]
          p_vector: string
        }
        Returns: {
          id: string
          vector: string
        }[]
      }
      create_clusters_with_vectors: {
        Args: { clusters: Json }
        Returns: {
          id: string
          vector: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      search_posts_with_snippet: {
        Args: { search_text: string; page: number; page_size: number }
        Returns: {
          id: string
          title: string
          short_description: string
          thumbnail: string
          released_at: string
          url_slug: string
          tags: Json[]
          snippet: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
