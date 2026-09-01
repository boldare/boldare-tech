import React from "react";
import { graphql } from "gatsby";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { setNavigatorPosition, setNavigatorShape } from "../state/store";
import { featureNavigator } from "../utils/shared";
import Seo from "../components/Seo";
import Layout from "../components/layout";

class Index extends React.Component {
  featureNavigator = featureNavigator.bind(this);

  constructor(props) {
    super(props);

    if (props.navigatorPosition !== "is-featured") {
      props.setNavigatorPosition("is-featured");
    }
  }

  render() {
    return <Layout />;
  }
}

Index.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Index);

export const Head = ({ data }) => <Seo facebook={data.site.siteMetadata.facebook} />;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;
