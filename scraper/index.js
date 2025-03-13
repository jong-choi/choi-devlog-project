import fs from "fs";
const url_slug = "0.-자바스크립트-치트시트";

async function fetchPost(url_slug) {
  const url = "https://v2cdn.velog.io/graphql";

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    Origin: "https://velog.io",
    Referer: "https://velog.io/",
  };

  const body = JSON.stringify({
    operationName: "ReadPost",
    query: `query ReadPost($username: String, $url_slug: String) {
      post(username: $username, url_slug: $url_slug) {
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
          series_posts {
            id
            post {
              id
              title
              url_slug
              user {
                id
                username
              }
            }
          }
        }
      }
    }`,
    variables: {
      username: "bluecoolgod80",
      url_slug,
    },
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    const data = await response.json();
    fs.writeFileSync(
      "data/" + url_slug + ".json",
      JSON.stringify(data, null, 2)
    );
    // console.log(data);
  } catch (error) {
    console.error("Error fetching post:", error);
  }
}

fetchPost(url_slug);
