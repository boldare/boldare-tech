require("dotenv").config();
const config = require("./content/meta/config");

const query = `{
  allMarkdownRemark(filter: { id: { regex: "//posts|pages//" } }) {
    edges {
      node {
        objectID: id
        fields {
          slug
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
}`;

const queries = [
  {
    query,
    transformer: ({ data }) => data.allMarkdownRemark.edges.map(({ node }) => node)
  }
];

module.exports = {
  siteMetadata: {
    title: config.siteTitle,
    description: config.siteDescription,
    siteUrl: config.siteUrl,
    siteImageUrl: config.siteUrl + config.pathPrefix + config.siteImage,
    pathPrefix: config.pathPrefix,
    language: config.siteLanguage,
    algolia: {
      appId: process.env.ALGOLIA_APP_ID ? process.env.ALGOLIA_APP_ID : "",
      searchOnlyApiKey: process.env.ALGOLIA_SEARCH_ONLY_API_KEY
        ? process.env.ALGOLIA_SEARCH_ONLY_API_KEY
        : "",
      indexName: process.env.ALGOLIA_INDEX_NAME ? process.env.ALGOLIA_INDEX_NAME : ""
    },
    facebook: {
      appId: process.env.FB_APP_ID ? process.env.FB_APP_ID : ""
    }
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/posts/`,
        name: "posts"
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/pages/`,
        name: "pages"
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `parts`,
        path: `${__dirname}/content/parts/`
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
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_ID
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
          },
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
                  date: edge.node.fields.prefix,
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
                            url: siteUrl + edge.node.frontmatter.cover.childImageSharp.resize.src
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
                  filter: { id: { regex: "//posts//" } }
                  sort: { fields: [fields___prefix], order: DESC }
                ) {
                  edges {
                    node {
                      html
                      fields { 
                        slug
                        prefix
                      }
                      frontmatter {
                        title
                        subTitle
                        postAuthor
                        tags
                        cover {
                          childImageSharp {
                            resize(width: 300) {
                              src
                            }
                          }
                        }
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
      resolve: "gatsby-plugin-svgr",
      options: {
        dir: `svg-icons`
      }
    }
  ]
};
