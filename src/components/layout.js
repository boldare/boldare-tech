import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { graphql, useStaticQuery } from "gatsby";

import theme from "../styles/theme";
import globals from "../styles/globals";

import { setFontSizeIncrease, setIsWideScreen } from "../state/store";

import asyncComponent from "../components/common/AsyncComponent/";
import Loading from "../components/common/Loading/";
import Navigator from "../components/Navigator/";
import ActionsBar from "../components/ActionsBar/";
import InfoBar from "../components/InfoBar/";

import { isWideScreen, timeoutThrottlerHandler } from "../utils/helpers";

const query = graphql`
  query {
    posts: allFile(filter: { relativeDirectory: { eq: "posts" } }, sort: { relativePath: DESC }) {
      edges {
        node {
          childMarkdownRemark {
            fields {
              slug
            }
            frontmatter {
              title
              cover
              tags
              postAuthor
              subTitle
            }
          }
        }
      }
    }
    pages: allFile(
      filter: { relativeDirectory: { regex: "/pages/" } }
      sort: { relativePath: ASC }
    ) {
      edges {
        node {
          childMarkdownRemark {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
    parts: allFile(filter: { relativeDirectory: { eq: "parts" } }) {
      edges {
        node {
          childMarkdownRemark {
            html
            frontmatter {
              title
            }
          }
        }
      }
    }
  }
`;

const InfoBox = asyncComponent(
  () =>
    import("../components/InfoBox/")
      .then(module => {
        return module;
      })
      .catch(error => {}),
  <Loading
    overrides={{ width: `${theme.info.sizes.width}px`, height: "100vh", right: "auto" }}
    afterRight={true}
  />
);

class Layout extends React.Component {
  timeouts = {};
  categories = [];

  componentDidMount() {
    this.props.setIsWideScreen(isWideScreen());
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.resizeThrottler, false);
    }

    // Deliberately after mount, not before render: this reads client-only state,
    // and applying it during the first render would not match the server HTML.
    if (typeof localStorage !== "undefined") {
      const inLocal = +localStorage.getItem("font-size-increase");
      const inStore = this.props.fontSizeIncrease;

      if (inLocal && inLocal !== inStore && inLocal >= 1 && inLocal <= 1.5) {
        this.props.setFontSizeIncrease(inLocal);
      }
    }
  }

  getCategories = posts =>
    posts.reduce((list, edge, i) => {
      const category = edge.node.childMarkdownRemark.frontmatter.category;
      if (category && !~list.indexOf(category)) {
        return list.concat(edge.node.childMarkdownRemark.frontmatter.category);
      } else {
        return list;
      }
    }, []);

  resizeThrottler = () => {
    return timeoutThrottlerHandler(this.timeouts, "resize", 500, this.resizeHandler);
  };

  resizeHandler = () => {
    this.props.setIsWideScreen(isWideScreen());
  };

  render() {
    const { children, type, data } = this.props;

    // TODO: dynamic management of tabindexes for keybord navigation
    const posts = data.posts.edges.map(
      ({
        node: {
          childMarkdownRemark: { fields, frontmatter }
        }
      }) => {
        return {
          ...fields,
          ...frontmatter
        };
      }
    );

    return (
      <div
        style={{
          padding: "1px",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          overflow: "hidden"
        }}
      >
        {children}
        <Navigator posts={posts} />
        <ActionsBar categories={this.getCategories(data.posts.edges)} type={type} />
        <InfoBar pages={data.pages.edges} parts={data.parts.edges} />
        {this.props.isWideScreen && <InfoBox pages={data.pages.edges} parts={data.parts.edges} />}
      </div>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node,
  data: PropTypes.object.isRequired,
  setIsWideScreen: PropTypes.func.isRequired,
  isWideScreen: PropTypes.bool.isRequired,
  fontSizeIncrease: PropTypes.number.isRequired,
  setFontSizeIncrease: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    pages: state.pages,
    isWideScreen: state.isWideScreen,
    fontSizeIncrease: state.fontSizeIncrease
  };
};

const mapDispatchToProps = {
  setIsWideScreen,
  setFontSizeIncrease
};

// useStaticQuery is a hook, and Layout is a class component, so the query lives
// in this wrapper and is handed down as a prop.
const LayoutWithData = props => {
  const data = useStaticQuery(query);
  return <Layout {...props} data={data} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(injectSheet(globals)(LayoutWithData));
