import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import config from "../../../content/meta/config";

const Seo = props => {
  const { data, facebook } = props;
  const providedTitle = ((data || {}).frontmatter || (data || {})).title;
  const providedDescription = ((data || {}).frontmatter || (data || {})).subTitle;
  const providedCover = ((data || {}).frontmatter || (data || {})).cover;
  const providedSlug = ((data || {}).fields || (data || {})).slug;

  const siteUrl = config.siteUrl + config.pathPrefix;
  const title = providedTitle ? `${providedTitle} - ${config.shortSiteTitle}` : config.siteTitle;
  const description = providedDescription ? providedDescription : `${providedTitle} - ${config.siteDescription}`;
  const imageSrc = siteUrl + (providedCover ? providedCover.childImageSharp.resize.src : config.siteImage);
  const url = siteUrl + (providedSlug ? providedSlug : "");
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
  data: PropTypes.object,
  facebook: PropTypes.object.isRequired
};

export default Seo;
