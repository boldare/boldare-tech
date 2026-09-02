const { test, expect } = require("@playwright/test");
const path = require("node:path");

// The Algolia indexing step only runs when credentials are present in the build
// environment, so neither a local build nor CI ever exercises it -- the plugin
// is not even registered. That blind spot cost a Netlify deploy: gatsby-plugin
// -algolia 1.x drives partial updates off internal.contentDigest and calls
// panicOnBuild without it, while the transformer replaced `internal` wholesale
// and the query never selected it. 0.2 never looked at the field.
//
// This exercises the query and transformer directly, with no network and no
// credentials, so the contract is checked on every run.

function loadAlgoliaQuery() {
  process.env.ALGOLIA_APP_ID = "test-app";
  process.env.ALGOLIA_ADMIN_API_KEY = "test-key";
  process.env.ALGOLIA_INDEX_NAME = "test-index";

  const configPath = path.resolve(__dirname, "../../gatsby-config.js");
  delete require.cache[require.resolve(configPath)];
  delete require.cache[require.resolve(path.resolve(__dirname, "../../content/meta/config.js"))];

  const plugin = require(configPath).plugins.find(
    p => p && p.resolve === "gatsby-plugin-algolia"
  );
  expect(plugin, "gatsby-plugin-algolia is not registered even with credentials set").toBeTruthy();
  return plugin.options.queries[0];
}

test.describe("algolia indexing contract", () => {
  test("the query selects internal.contentDigest", () => {
    const { query } = loadAlgoliaQuery();
    expect(query, "query must select internal.contentDigest").toMatch(/contentDigest/);
  });

  test("the transformer keeps contentDigest on every chunk", () => {
    const { transformer } = loadAlgoliaQuery();

    const node = {
      objectID: "/repo/content/posts/example.md",
      fields: { slug: "/example/" },
      // Long enough to split into several chunks.
      internal: { content: "lorem ipsum ".repeat(300), contentDigest: "digest-abc" },
      frontmatter: { title: "Example", subTitle: null, postAuthor: null, tags: null },
    };

    const objects = transformer({ data: { allMarkdownRemark: { edges: [{ node }] } } });

    expect(objects.length, "content should be split into chunks").toBeGreaterThan(1);
    for (const obj of objects) {
      expect(obj.internal?.contentDigest, `chunk lost contentDigest: ${JSON.stringify(obj)}`).toBe(
        "digest-abc"
      );
      expect(obj.objectID).toBeTruthy();
    }
    // Chunking must actually chunk, not just copy the whole body each time.
    expect(objects[0].internal.content.length).toBeLessThan(node.internal.content.length);
  });
});
