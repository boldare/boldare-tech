require("dotenv").config();
const _ = require("lodash");
const chunk = require("chunk-text");
const config = require("./content/meta/config");

module.exports = {
  pathPrefix: config.pathPrefix,
  siteMetadata: {
    title: config.siteTitle,
    description: config.siteDescription,
    siteUrl: config.siteUrl,
    siteImageUrl: config.siteUrl + config.pathPrefix + config.siteImage,
    pathPrefix: config.pathPrefix,
    language: config.siteLanguage,
    algolia: {
      appId: config.algolia.appId,
      searchOnlyApiKey: config.algolia.searchOnlyApiKey,
      indexName: config.algolia.indexName,
    },
    facebook: {
      appId: config.facebook.appId,
    },
  },
  plugins: [
    ...(config.algolia.appId && config.algolia.adminApiKey
      ? [
          {
            resolve: `gatsby-plugin-algolia`,
            options: {
              appId: config.algolia.appId,
              apiKey: config.algolia.adminApiKey,
              indexName: config.algolia.indexName,
              queries: [
                {
                  query: `{
              allMarkdownRemark(filter: { fileAbsolutePath: { regex: "//posts|pages//" } }) {
                edges {
                  node {
                    objectID: fileAbsolutePath
                    fields {
                      slug
                    }
                    internal {
                      content
                      contentDigest
                    }
                    frontmatter {   
                      title
                      subTitle
                      postAuthor
                      tags
                    }
                  }
                }
              }
            }`,
                  transformer: ({ data }) =>
                    _.flatten(
                      data.allMarkdownRemark.edges.map(({ node }) =>
                        chunk(node.internal.content, 1000).map((contentChunk) =>
                          Object.assign({}, node, {
                            // Spread node.internal rather than replacing it.
                            // gatsby-plugin-algolia 1.x drives partial updates
                            // off internal.contentDigest and calls
                            // panicOnBuild without it; 0.2 never looked.
                            internal: { ...node.internal, content: contentChunk }
                          })
                        )
                      )
                    ),
                },
              ],
            },
          },
        ]
      : []),
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content`,
        name: "content",
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-plugin-sharp`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
              backgroundColor: "transparent",
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 2em`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: config.manifestName,
        short_name: config.manifestShortName,
        start_url: config.manifestStartUrl,
        background_color: config.manifestBackgroundColor,
        theme_color: config.manifestThemeColor,
        display: config.manifestDisplay,
        icons: [
          {
            src: "/icons/icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    },
    // gatsby-plugin-offline 6 dropped the navigateFallback options entirely, so
    // the old `navigateFallbackBlacklist: [/\?(.+&)?no-cache=1/]` has no
    // equivalent and is gone. Default runtime caching only.
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                pathPrefix
                language
                site_url: siteUrl
                image_url: siteImageUrl
              }
            }
          }
        `,
        setup: ({
          query: {
            site: { siteMetadata },
            ...rest
          },
        }) => {
          return {
            ...siteMetadata,
            ...rest,
            custom_namespaces: { media: "http://video.search.yahoo.com/mrss" },
          };
        },
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              const siteUrl = site.siteMetadata.site_url + site.siteMetadata.pathPrefix;

              return allMarkdownRemark.edges.map((edge) => {
                return {
                  title: edge.node.frontmatter.title,
                  description: edge.node.frontmatter.subTitle,
                  author: edge.node.frontmatter.postAuthor,
                  categories: edge.node.frontmatter.tags,
                  date: edge.node.fields.date,
                  url: siteUrl + edge.node.fields.slug,
                  guid: siteUrl + edge.node.fields.slug,
                  custom_elements: [
                    {
                      "content:encoded": edge.node.html,
                    },
                    {
                      "media:thumbnail": [
                        {
                          _attr: {
                            url: siteUrl + edge.node.frontmatter.cover,
                          },
                        },
                      ],
                    },
                  ],
                };
              });
            },
            query: `
              {
                allMarkdownRemark(
                  limit: 30,
                  filter: { fileAbsolutePath: { regex: "//posts//" } }
                  sort: { fields: { date: DESC } }
                ) {
                  edges {
                    node {
                      html
                      fields {
                        slug
                        date
                      }
                      frontmatter {
                        title
                        subTitle
                        postAuthor
                        tags
                        cover
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: config.siteTitle,
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        excludes: ["/contact"],
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        // v3 reads options.rule.{include,exclude}; a top-level `include` is
        // silently ignored and svg-react-loader ends up applied to every .svg.
        rule: {
          include: /svg-icons/,
        },
      },
    },
    // Registered only when GTM_ID is set, so a build without it still succeeds.
    ...(config.google.tagManagerId
      ? [
          {
            resolve: `gatsby-plugin-google-tagmanager`,
            options: {
              id: config.google.tagManagerId,
              includeInDevelopment: false,
            },
          },
        ]
      : []),
    `gatsby-plugin-decap-cms`,
    `gatsby-plugin-netlify`,
  ],
};
