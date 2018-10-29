import React from "react";
import { graphql } from "gatsby";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { setNavigatorPosition, setNavigatorShape } from "../state/store";
import { moveNavigatorAside } from "../utils/shared";
import Main from "../components/Main/";
import Page from "../components/Page/";
import Footer from "../components/Footer/";
import Seo from "../components/Seo";
import Layout from "../components/layout";

class PageTemplate extends React.Component {
  moveNavigatorAside = moveNavigatorAside.bind(this);

  componentDidMount() {
    if (this.props.navigatorPosition === "is-featured") {
      this.moveNavigatorAside();
    }
  }

  render() {
    const { data } = this.props;
    const {
      site: {
        siteMetadata: { facebook }
      }
    } = data;

    return (
      <Layout type="page">
        <Main>
          <Page page={data.page} />
          <Footer footnote={data.footnote} />
          <Seo
            data={{ title: data.page.frontmatter.title, slug: data.page.fields.slug }}
            facebook={facebook}
          />
        </Main>
      </Layout>
    );
  }
}

PageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
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
)(PageTemplate);

export const pageQuery = graphql`
  query PageByPath($slug: String!) {
    page: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        slug
      }
      frontmatter {
        title
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
