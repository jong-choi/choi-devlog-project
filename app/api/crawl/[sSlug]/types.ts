export interface VelogPost {
  id: string;
  title: string;
  released_at: string;
  updated_at: string;
  tags: string[];
  body: string;
  short_description: string;
  is_markdown: boolean;
  is_private: boolean;
  thumbnail: string | null;
  url_slug: string;
  likes: number;
  series?: {
    id: string;
    name: string;
    url_slug: string;
    series_posts: {
      id: string;
      post: {
        id: string;
        title: string;
        url_slug: string;
        user: {
          id: string;
          username: string;
        };
      };
    }[];
  };
}

export interface VelogAPIResponse {
  data?: {
    series: {
      id: string;
      name: string;
      series_posts: {
        id: string;
        index: number;
        post: VelogPost;
        __typename: string;
      }[];
      __typename: string;
    } | null;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
}
