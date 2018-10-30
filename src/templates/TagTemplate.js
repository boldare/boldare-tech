import React from "react";
import { graphql } from "gatsby";
import PropTypes from "prop-types";
import injectSheet from "react-jss";

const _ = require("lodash");

import Main from "../components/Main";
import PageHeader from "../components/Page/PageHeader";
import Seo from "../components/Seo";
import Navigator from "../components/Navigator/";
import { Link } from "gatsby";
import Layout from "../components/layout";

const styles = () => ({
  header: {
    padding: "3.5rem"
  }
});

class TagTemplate extends React.Component {
  render() {
    const { classes, data, pageContext } = this.props;
    const { tag, kebabCaseTag } = pageContext;

    const tagHeader = `${data.posts.totalCount} post${
      data.posts.totalCount === 1 ? "" : "s"
    } tagged with "${tag}"`;

    const posts = data.posts.edges.map(({ node: { fields, frontmatter } }) => {
      return {
        ...fields,
        ...frontmatter
      };
    });

    return (
      <Layout type="tag">
        <Main>
          <div className={classes.header}>
            <PageHeader title={tagHeader} />
            <Link to="/tags">Most popular tags</Link>
          </div>
          <Navigator posts={posts} navigatorPosition={"is-list"} />
          <Seo
            data={{ title: `Posts with tag ${tag}`, slug: `tags/${kebabCaseTag}` }}
            facebook={data.site.siteMetadata.facebook}
          />
        </Main>
      </Layout>
    );
  }
}

TagTemplate.propTypes = {
  classes: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    kebabCaseTag: PropTypes.string.isRequired,
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

export const pageQuery = graphql`
  query($kebabCaseTag: String!) {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
    posts: allMarkdownRemark(
      limit: 100
      filter: { fields: { kebabCaseTags: { in: [$kebabCaseTag] } } }
      sort: { fields: [fields___date], order: DESC }
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
            cover
          }
        }
      }
    }
  }
`;
