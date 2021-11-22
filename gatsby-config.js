require("dotenv").config();
const _ = require("lodash");
const chunk = require("chunk-text");
const config = require("./content/meta/config");

module.exports = {
  siteMetadata: {
    title: config.siteTitle,
    description: config.siteDescription,
    siteUrl: config.siteUrl,
    siteImageUrl: config.siteUrl + config.pathPrefix + config.siteImage,
    assetPrefix: config.assetPrefix,
    pathPrefix: config.pathPrefix,
    language: config.siteLanguage,
    algolia: {
      appId: config.algolia.appId,
      searchOnlyApiKey: config.algolia.searchOnlyApiKey,
      indexName: config.algolia.indexName
    },
    facebook: {
      appId: config.facebook.appId
    }
  },
  plugins: [
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
                  chunk(node.internal.content, 1000).map(contentChunk =>
                    Object.assign({}, node, { internal: { content: contentChunk } })
                  )
                )
              )
          }
        ]
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content`,
        name: "content"
      }
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
              backgroundColor: "transparent"
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 2em`
            }
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`
        ]
      }
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-react-helmet`,
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
            type: "image/png"
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        navigateFallbackBlacklist: [/\?(.+&)?no-cache=1/],
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: config.google.analyticsId
      }
    },
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
          }
        }) => {
          return {
            ...siteMetadata,
            ...rest,
            custom_namespaces: { media: "http://video.search.yahoo.com/mrss" }
          };
        },
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              const siteUrl = site.siteMetadata.site_url + site.siteMetadata.pathPrefix;

              return allMarkdownRemark.edges.map(edge => {
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
                      "content:encoded": edge.node.html
                    },
                    {
                      "media:thumbnail": [
                        {
                          _attr: {
                            url: siteUrl + edge.node.frontmatter.cover
                          }
                        }
                      ]
                    }
                  ]
                };
              });
            },
            query: `
              {
                allMarkdownRemark(
                  limit: 30,
                  filter: { fileAbsolutePath: { regex: "//posts//" } }
                  sort: { fields: [fields___date], order: DESC }
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
            output: "/rss.xml"
          }
        ]
      }
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        exclude: ["/contact"]
      }
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        include: /svg-icons/
      }
    },
    `gatsby-plugin-netlify-cms`,
    `gatsby-plugin-netlify`
  ]
};
