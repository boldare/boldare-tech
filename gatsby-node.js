const path = require("path");
const _ = require("lodash");
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });
    const separatorIndex = ~slug.indexOf("_") ? slug.indexOf("_") : 0;
    const shortSlugStart = separatorIndex ? separatorIndex + 1 : 0;

    const shortSlug = `${separatorIndex ? "/" : ""}${slug.substring(shortSlugStart)}`;
    const date = separatorIndex ? slug.substring(separatorIndex, separatorIndex - 10) : "";

    createNodeField({
      node,
      name: `slug`,
      value: shortSlug
    });
    createNodeField({
      node,
      name: `date`,
      value: date
    });

    if (node.frontmatter.tags) {
      createNodeField({
        node,
        name: `kebabCaseTags`,
        value: node.frontmatter.tags.map(tag => _.kebabCase(tag))
      });
    }
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  createRedirect({
    fromPath: "https://tech.xsolve.software/*",
    toPath: "https://tech.boldare.com/:splat",
    isPermanent: true,
    redirectInBrowser: true,
    force: true
  });

  createRedirect({
    fromPath: "https://tech.xsolve.software",
    toPath: "https://tech.boldare.com",
    isPermanent: true,
    redirectInBrowser: true,
    force: true
  });

  createRedirect({
    fromPath: "/a",
    toPath: "/admin/",
    isPermanent: true,
    redirectInBrowser: true,
    force: true
  });

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
                date
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

    createRedirect({
      fromPath: `${page.childMarkdownRemark.fields.slug}edit`,
      toPath: `/admin/#/collections/blog/entries/${
        page.childMarkdownRemark.fields.date
      }_${page.childMarkdownRemark.fields.slug.substr(1)}`,
      isPermanent: true,
      redirectInBrowser: true,
      force: true
    });

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
    const kebabCaseTag = _.kebabCase(tag);

    createPage({
      path: `/tags/${kebabCaseTag}/`,
      component: templates.tag,
      context: {
        kebabCaseTag,
        tag
      }
    });
  });
};
