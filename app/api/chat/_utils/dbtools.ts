import { tool } from "@langchain/core/tools";
import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Types for API responses
type PostSearchResult = {
  title: string;
  url_slug: string;
  snippet?: string;
  description?: string;
  created_at: string;
  category_name: string;
  subcategory_name: string;
};

type RecommendedPost = {
  title: string;
  url_slug: string;
  similarity: number;
  category_name: string;
  subcategory_name: string;
  created_at: string;
  description?: string;
};

type AISummary = {
  summary: string;
  tags?: string[];
  key_points?: string[];
  created_at: string;
};

export const searchPostsTool = tool(
  async ({ keyword, page = 1, limit = 10 }) => {
    try {
      const params = new URLSearchParams({
        keyword: keyword.trim(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${BASE_URL}/api/posts/search?${params}`);

      if (!response.ok) {
        return `Error: Failed to search posts (${response.status}: ${response.statusText})`;
      }

      const result = await response.json();

      if (result.error) {
        return `Database error: ${result.error.message || "Unknown error"}`;
      }

      if (!result.data || result.data.length === 0) {
        return `No posts found for keyword: "${keyword}"`;
      }

      // Format the results for better readability
      const posts = result.data.map((post: PostSearchResult) => ({
        title: post.title,
        url_slug: post.url_slug,
        snippet: post.snippet || post.description?.substring(0, 150),
        created_at: new Date(post.created_at).toLocaleDateString("ko-KR"),
        category: post.category_name,
        subcategory: post.subcategory_name,
      }));

      return `Found ${posts.length} posts for "${keyword}":\n\n${posts
        .map(
          (post: (typeof posts)[0], index: number) =>
            `${index + 1}. **${post.title}**\n` +
            `   - URL: /${post.url_slug}\n` +
            `   - Category: ${post.category} > ${post.subcategory}\n` +
            `   - Date: ${post.created_at}\n` +
            `   - Preview: ${post.snippet || "No preview available"}\n`
        )
        .join("\n")}`;
    } catch (error) {
      return `Error searching posts: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  },
  {
    name: "search_posts",
    description:
      "Search for blog posts using keywords. Returns post titles, URLs, categories, and snippets.",
    schema: z.object({
      keyword: z
        .string()
        .min(1)
        .describe("Search keyword or phrase to find relevant posts"),
      page: z
        .number()
        .min(1)
        .default(1)
        .optional()
        .describe("Page number for pagination (default: 1)"),
      limit: z
        .number()
        .min(1)
        .max(50)
        .default(10)
        .optional()
        .describe("Number of posts per page (default: 10, max: 50)"),
    }),
  }
);

export const getRecommendedPostsTool = tool(
  async ({ post_id, limit = 5 }) => {
    try {
      const params = new URLSearchParams({
        post_id: post_id,
      });

      const response = await fetch(`${BASE_URL}/api/ai/recommended?${params}`);

      if (!response.ok) {
        return `Error: Failed to get recommended posts (${response.status}: ${response.statusText})`;
      }

      const result = await response.json();

      if (result.error) {
        return `Database error: ${result.error.message || "Unknown error"}`;
      }

      if (!result.data || result.data.length === 0) {
        return `No recommended posts found for post ID: ${post_id}`;
      }

      // Limit results and format for readability
      const recommendedPosts = result.data
        .slice(0, limit)
        .map((item: RecommendedPost) => ({
          title: item.title,
          url_slug: item.url_slug,
          similarity: (item.similarity * 100).toFixed(1),
          category: item.category_name,
          subcategory: item.subcategory_name,
          created_at: new Date(item.created_at).toLocaleDateString("ko-KR"),
          description: item.description?.substring(0, 120),
        }));

      return `Found ${
        recommendedPosts.length
      } recommended posts:\n\n${recommendedPosts
        .map(
          (post: (typeof recommendedPosts)[0], index: number) =>
            `${index + 1}. **${post.title}** (${post.similarity}% similar)\n` +
            `   - URL: /${post.url_slug}\n` +
            `   - Category: ${post.category} > ${post.subcategory}\n` +
            `   - Date: ${post.created_at}\n` +
            `   - Preview: ${post.description || "No preview available"}\n`
        )
        .join("\n")}`;
    } catch (error) {
      return `Error getting recommended posts: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  },
  {
    name: "get_recommended_posts",
    description:
      "Get posts recommended based on similarity to a specific post. Useful for finding related content.",
    schema: z.object({
      post_id: z
        .string()
        .min(1)
        .describe("ID of the post to find similar/recommended posts for"),
      limit: z
        .number()
        .min(1)
        .max(20)
        .default(5)
        .optional()
        .describe(
          "Maximum number of recommended posts to return (default: 5, max: 20)"
        ),
    }),
  }
);

export const getAISummaryTool = tool(
  async ({ post_id }) => {
    try {
      const params = new URLSearchParams({
        post_id: post_id,
      });

      const response = await fetch(`${BASE_URL}/api/ai/summary?${params}`);

      if (!response.ok) {
        return `Error: Failed to get AI summary (${response.status}: ${response.statusText})`;
      }

      const result = await response.json();

      if (result.error) {
        return `Database error: ${result.error.message || "Unknown error"}`;
      }

      if (!result.data) {
        return `No AI summary found for post ID: ${post_id}`;
      }

      const summary = result.data as AISummary;
      const createdAt = new Date(summary.created_at).toLocaleString("ko-KR");

      return (
        `**AI Summary for Post ID: ${post_id}**\n\n` +
        `**Generated:** ${createdAt}\n\n` +
        `**Summary:**\n${summary.summary}\n\n` +
        `**Tags:** ${
          summary.tags ? summary.tags.join(", ") : "No tags available"
        }\n\n` +
        `**Key Points:** ${
          summary.key_points
            ? summary.key_points.join(", ")
            : "No key points available"
        }`
      );
    } catch (error) {
      return `Error getting AI summary: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  },
  {
    name: "get_ai_summary",
    description:
      "Get AI-generated summary, tags, and key points for a specific blog post. Useful for quick content overview.",
    schema: z.object({
      post_id: z
        .string()
        .min(1)
        .describe("ID of the post to get AI summary for"),
    }),
  }
);

export const getDbTools = () => {
  return [searchPostsTool, getRecommendedPostsTool, getAISummaryTool];
};
