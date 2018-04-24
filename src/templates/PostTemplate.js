import React from "react";
import PropTypes from "prop-types";

const _ = require("lodash");
import { connect } from "react-redux";
import { setNavigatorPosition, setNavigatorShape } from "../state/store";
import { moveNavigatorAside } from "../utils/shared";

import Main from "../components/Main/";
import Post from "../components/Post/";
import Footer from "../components/Footer/";
import Seo from "../components/Seo";


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
    const { data, pathContext } = this.props;
    const facebook = (((data || {}).site || {}).siteMetadata || {}).facebook;

    const postTags = _.filter(data.tags.group, (group) => {
      return this.filterTagsBySlug(group)
    });

    return (
      <Main>
        <Post post={data.post} tags={postTags} slug={pathContext.slug} author={data.author} />
        <Footer footnote={data.footnote} />
        <Seo data={data.post} facebook={facebook} />
      </Main>
    );
  }
}

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pathContext: PropTypes.object.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(PostTemplate);

// TODO - whenever possible, filter tag groups by slug here: https://github.com/gatsbyjs/gatsby/issues/5046
//eslint-disable-next-line no-undef
export const postQuery = graphql`
  query PostBySlug($slug: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        slug
        prefix
      }
      frontmatter {
        title
        subTitle
        postAuthor
        cover {
          childImageSharp {
            resize(width: 300) {
              src
            }
          }
        }
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
    author: markdownRemark(id: { regex: "/author/" }) {
      id
      html
    }
    footnote: markdownRemark(id: { regex: "/footnote/" }) {
      id
      html
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
