export default async function fetchPost(url_slug: string) {
  const url = "https://v2cdn.velog.io/graphql";

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    Origin: "https://velog.io",
    Referer: "https://velog.io/",
  };

  const body = JSON.stringify({
    operationName: "Series",
    variables: {
      username: "bluecoolgod80",
      url_slug,
    },
    query: `
      query Series($username: String, $url_slug: String) {
        series(username: $username, url_slug: $url_slug) {
          id
          name
          series_posts {
            id
            index
            post {
              id
              title
              released_at
              updated_at
              tags
              body
              short_description
              is_markdown
              is_private
              thumbnail
              url_slug
              likes
              series {
                id
                name
                url_slug
              }
            }
            __typename
          }
          __typename
        }
      }
    `,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}
