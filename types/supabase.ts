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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
            isOneToOne: true
            referencedRelation: "admin_posts_with_similarity_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "v_post_with_chunk_counts"
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
      post_chunk_metadata: {
        Row: {
          char_end: number | null
          char_start: number | null
          chunk_id: string
          created_at: string
          end_token: number
          overlap_tokens: number
          start_token: number
          token_count: number
          updated_at: string
        }
        Insert: {
          char_end?: number | null
          char_start?: number | null
          chunk_id: string
          created_at?: string
          end_token: number
          overlap_tokens?: number
          start_token: number
          token_count: number
          updated_at?: string
        }
        Update: {
          char_end?: number | null
          char_start?: number | null
          chunk_id?: string
          created_at?: string
          end_token?: number
          overlap_tokens?: number
          start_token?: number
          token_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_chunk_metadata_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: true
            referencedRelation: "post_chunks"
            referencedColumns: ["id"]
          },
        ]
      }
      post_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          deleted_at: string | null
          embedding: string
          id: string
          post_id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          deleted_at?: string | null
          embedding: string
          id?: string
          post_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          deleted_at?: string | null
          embedding?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_chunks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "admin_posts_with_similarity_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_chunks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_chunks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_chunks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_chunks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_chunks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_post_with_chunk_counts"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "admin_posts_with_similarity_counts"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "post_similarities_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "v_post_with_chunk_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_similarities_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "admin_posts_with_similarity_counts"
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
          {
            foreignKeyName: "post_similarities_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "v_post_with_chunk_counts"
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
            referencedRelation: "admin_posts_with_similarity_counts"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_post_with_chunk_counts"
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
            referencedRelation: "admin_posts_with_similarity_counts"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "post_tsvectors_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "v_post_with_chunk_counts"
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
      admin_posts_with_similarity_counts: {
        Row: {
          ai_summaries: Json | null
          created_at: string | null
          id: string | null
          post_similarities: Json | null
          title: string | null
          url_slug: string | null
        }
        Relationships: []
      }
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
            isOneToOne: true
            referencedRelation: "admin_posts_with_similarity_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts_with_tags_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "published_posts_with_tags_summaries_tsv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_summaries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "v_post_with_chunk_counts"
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
      v_post_with_chunk_counts: {
        Row: {
          active_count: number | null
          created_at: string | null
          id: string | null
          title: string | null
          total_count: number | null
        }
        Relationships: []
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
          p_keywords: string[]
          p_post_ids: string[]
          p_quality: number
          p_summary: string
          p_title: string
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
        Returns: unknown
      }
      search_post_chunks_cosine: {
        Args: {
          p_match_count?: number
          p_min_similarity?: number
          p_query: number[]
        }
        Returns: {
          chunk_id: string
          chunk_index: number
          content: string
          post_id: string
          similarity: number
        }[]
      }
      search_posts_hybrid: {
        Args: {
          p_fts_weight?: number
          p_oversample_count?: number
          p_query_vector: number[]
          p_rrf_k?: number
          p_search_text: string
          p_vector_weight?: number
        }
        Returns: {
          body: string
          chunk_content: string
          chunk_index: number
          cosine_similarity: number
          final_score: number
          fts_rank: number
          post_id: string
          released_at: string
          rrf_score: number
          short_description: string
          tags: Json
          thumbnail: string
          title: string
          url_slug: string
        }[]
      }
      search_posts_with_snippet: {
        Args: { page: number; page_size: number; search_text: string }
        Returns: {
          id: string
          released_at: string
          short_description: string
          snippet: string
          tags: Json[]
          thumbnail: string
          title: string
          url_slug: string
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
    Enums: {},
  },
} as const
