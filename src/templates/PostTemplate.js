import React from "react";
import { graphql } from "gatsby";
import PropTypes from "prop-types";

const _ = require("lodash");

import { connect } from "react-redux";
import { setNavigatorPosition, setNavigatorShape } from "../state/store";
import { moveNavigatorAside } from "../utils/shared";
import { mergeTagsWithEqualKebabCaseName } from "../utils/helpers";

import Main from "../components/Main/";
import Post from "../components/Post/";
import Footer from "../components/Footer/";
import Seo from "../components/Seo";
import Layout from "../components/layout";

require("core-js/fn/array/find");
require("prismjs/themes/prism-okaidia.css");

class PostTemplate extends React.Component {
  moveNavigatorAside = moveNavigatorAside.bind(this);

  componentDidMount() {
    if (this.props.navigatorPosition === "is-featured") {
      this.moveNavigatorAside();
    }
  }

  filterTagsBySlug(group) {
    let containsSlug = false;
    _.forEach(group.edges, edge => {
      if (edge.node.fields.slug === this.props.data.post.fields.slug) {
        containsSlug = true;
        return false;
      }
    });

    return containsSlug;
  }

  render() {
    const {
      data: {
        site: {
          siteMetadata: { facebook }
        },
        post,
        footnote,
        author,
        tags
      },
      pageContext
    } = this.props;

    const postTags = _.filter(
      mergeTagsWithEqualKebabCaseName(_.orderBy(tags.group), "totalCount", "desc"),
      group => this.filterTagsBySlug(group)
    );

    return (
      <Layout type="post">
        <Main>
          <Post post={post} tags={postTags} slug={pageContext.slug} author={author} />
          <Footer footnote={footnote} />
          <Seo data={post} facebook={facebook} />
        </Main>
      </Layout>
    );
  }
}

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  navigatorPosition: PropTypes.string.isRequired,
  setNavigatorPosition: PropTypes.func.isRequired,
  isWideScreen: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    navigatorPosition: state.navigatorPosition,
    isWideScreen: state.isWideScreen
  };
};

const mapDispatchToProps = {
  setNavigatorPosition,
  setNavigatorShape
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostTemplate);

// TODO - whenever possible, filter tag groups by slug here: https://github.com/gatsbyjs/gatsby/issues/5046
export const postQuery = graphql`
  query($slug: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      fields {
        slug
        date
      }
      html
      frontmatter {
        title
        subTitle
        postAuthor
        cover
      }
    }
    tags: allMarkdownRemark {
      group(field: frontmatter___tags) {
        name: fieldValue
        totalCount
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
    author: file(relativePath: { eq: "parts/author.md" }) {
      id
      childMarkdownRemark {
        html
      }
    }
    footnote: file(relativePath: { eq: "parts/footnote.md" }) {
      id
      childMarkdownRemark {
        html
      }
    }
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;
