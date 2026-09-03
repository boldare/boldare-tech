import React from "react";
import { graphql } from "gatsby";
import PropTypes from "prop-types";

import Main from "../components/Main";
import Article from "../components/Main/Article";
import PageHeader from "../components/Page/PageHeader";
import Search from "../components/Search";
import Seo from "../components/Seo";
import Layout from "../components/layout";

const SearchPage = props => {
  const { data } = props;

  return (
    <Layout>
      <Main>
        <Article>
          <PageHeader title="Search by" algolia={true} />
          <Search algolia={data.site.siteMetadata.algolia} />
        </Article>
      </Main>
    </Layout>
  );
};

SearchPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default SearchPage;

export const Head = ({ data }) => (
  <Seo data={{ title: "Search", slug: "/search/" }} facebook={data.site.siteMetadata.facebook} />
);

export const query = graphql`
  query AlgoliaQuery {
    site {
      siteMetadata {
        algolia {
          appId
          searchOnlyApiKey
          indexName
        }
        facebook {
          appId
        }
      }
    }
  }
`;
