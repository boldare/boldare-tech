const path = require("path");
const _ = require("lodash");
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });
    const separtorIndex = ~slug.indexOf("--") ? slug.indexOf("--") : 0;
    const shortSlugStart = separtorIndex ? separtorIndex + 2 : 0;

    createNodeField({
      node,
      name: `slug`,
      value: `${separtorIndex ? "/" : ""}${slug.substring(shortSlugStart)}`
    });
    createNodeField({
      node,
      name: `prefix`,
      value: separtorIndex ? slug.substring(1, separtorIndex) : ""
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const templates = {
    post: path.resolve("./src/templates/PostTemplate.js"),
    page: path.resolve("./src/templates/PageTemplate.js"),
    tag: path.resolve("./src/templates/TagTemplate.js")
  };

  const result = await graphql(`
    {
      allFile(filter: { relativeDirectory: { in: ["posts", "pages"] } }) {
        edges {
          node {
            id
            relativePath
            childMarkdownRemark {
              fields {
                slug
              }
              frontmatter {
                tags
              }
            }
          }
        }
      }
    }
  `);

  let tags = [];
  const pages = result.data.allFile.edges;

  pages.forEach(({ node: page }) => {
    const type = /posts/.test(page.relativePath) ? "post" : "page";

    if (page.childMarkdownRemark.frontmatter.tags) {
      tags = [...tags, ...page.childMarkdownRemark.frontmatter.tags];
    }

    createPage({
      path: page.childMarkdownRemark.fields.slug,
      component: templates[type],
      context: {
        slug: page.childMarkdownRemark.fields.slug
      }
    });
  });

  tags = _.uniq(tags);

  tags.forEach(tag => {
    createPage({
      path: `/tags/${_.kebabCase(tag)}/`,
      component: templates.tag,
      context: {
        tag
      }
    });
  });
};
