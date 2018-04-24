import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import config from "../../../content/meta/config";

const Seo = props => {
  const { data, facebook } = props;
  const postTitle = ((data || {}).frontmatter || (data || {})).title;
  const postDescription = ((data || {}).frontmatter || (data || {})).subTitle;
  const postCover = ((data || {}).frontmatter || (data || {})).cover;
  const postSlug = ((data || {}).frontmatter || (data || {})).slug;

  const siteUrl = config.siteUrl + config.pathPrefix;
  const title = postTitle ? `${postTitle} - ${config.shortSiteTitle}` : config.siteTitle;
  const description = postDescription ? postDescription : config.siteDescription;
  const imageSrc = siteUrl + (postCover ? postCover.childImageSharp.resize.src : config.siteImage);
  const url = siteUrl + (postSlug ? postSlug : "");
  const twitterAccount = config.authorTwitterAccount ? config.authorTwitterAccount : "";

  return (
    <Helmet
      htmlAttributes={{
        lang: config.siteLanguage,
        prefix: "og: http://ogp.me/ns#"
      }}
    >
      {/* General tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* OpenGraph tags */}
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageSrc} />
      <meta property="og:type" content="website" />
      <meta property="fb:app_id" content={facebook.appId} />
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary" />
      {/* Tag for entire blog */}
      <meta name="twitter:site" content={twitterAccount} />
      {/* Tag for a specific author - we should modify it if we ever allow Twitter in frontmatter */}
      <meta name="twitter:creator" content={twitterAccount} />
    </Helmet>
  );
};

Seo.propTypes = {
  data: PropTypes.object.isRequired,
  facebook: PropTypes.object.isRequired
};

export default Seo;
