import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";

const _ = require("lodash");

import Main from "../components/Main";
import PageHeader from "../components/Page/PageHeader";
import Seo from "../components/Seo";
import Navigator from "../components/Navigator/";
import Link from "gatsby-link";

const styles = theme => ({
  header: {
    padding: "3.5rem"
  }
});

class TagTemplate extends React.Component {
  render() {
    const { classes, data, pathContext } = this.props;
    const { tag } = pathContext;

    const tagHeader = `${data.posts.totalCount} post${data.posts.totalCount === 1 ? "" : "s"} tagged with "${tag}"`;

    return (
      <Main>
        <div className={classes.header}>
          <PageHeader title={tagHeader} />
          <Link to="/tags">Most popular tags</Link>
        </div>
        <Navigator posts={data.posts.edges} navigatorPosition={"is-list"} />
        <Seo
          data={{ title: `Posts with tag ${tag}`, slug: `tags/${_.kebabCase(tag)}` }}
          facebook={data.site.siteMetadata.facebook}
        />
      </Main>
    );
  }
}

TagTemplate.propTypes = {
  classes: PropTypes.object.isRequired,
  pathContext: PropTypes.shape({
    tag: PropTypes.string.isRequired
  }),
  data: PropTypes.shape({
    posts: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              title: PropTypes.string.isRequired,
              postAuthor: PropTypes.string
            })
          })
        }).isRequired
      )
    }),
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        facebook: PropTypes.shape({
          appId: PropTypes.string.isRequired
        }).isRequired
      })
    })
  })
};

export default injectSheet(styles)(TagTemplate);

//eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query PostsByTag($tag: String!) {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
    posts: allMarkdownRemark(
      limit: 100
      filter: { frontmatter: { tags: { in: [$tag] } } }
      sort: { fields: [fields___prefix], order: DESC }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            subTitle
            postAuthor
            cover {
              children {
                ... on ImageSharp {
                  resolutions(width: 90, height: 90) {
                    ...GatsbyImageSharpResolutions_withWebp_noBase64
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
