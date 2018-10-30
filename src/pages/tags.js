import React from "react";
import { graphql } from "gatsby";
import PropTypes from "prop-types";

const _ = require("lodash");
const path = require("path");

import { mergeTagsWithEqualKebabCaseName } from "../utils/helpers";

import Main from "../components/Main";
import Article from "../components/Main/Article";
import Content from "../components/Main/Content";
import PageHeader from "../components/Page/PageHeader";
import Seo from "../components/Seo";
import TagList from "../components/Tags/TagList";
import Layout from "../components/layout";

const TagsPage = props => {
  const { data } = props;

  return (
    <Layout>
      <Main>
        <Article>
          <PageHeader title="Most popular tags" />
          <Content>
            <TagList
              tags={mergeTagsWithEqualKebabCaseName(_.orderBy(data.tags.group, "totalCount", "desc"))}
            />
          </Content>
        </Article>
        <Seo
          data={{ title: "Most popular tags", slug: `/${path.basename(__filename, ".js")}` }}
          facebook={data.site.siteMetadata.facebook}
        />
      </Main>
    </Layout>
  );
};

TagsPage.propTypes = {
  data: PropTypes.shape({
    tags: PropTypes.shape({
      group: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          totalCount: PropTypes.number.isRequired
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

export default TagsPage;

// TODO - whenever possible, sort by totalCount here: https://github.com/gatsbyjs/gatsby/issues/5046
// TODO - also, whenever possible, make the grouping case insensitive https://github.com/gatsbyjs/gatsby/issues/1789
// For now JS workarounds are used.
export const pagesQuery = graphql`
  query Tags {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
    tags: allMarkdownRemark(limit: 100) {
      group(field: frontmatter___tags) {
        name: fieldValue
        totalCount
      }
    }
  }
`;
