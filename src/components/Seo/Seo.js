import React from "react";
import PropTypes from "prop-types";
import config from "../../../content/meta/config";

// Rendered from each page's `export const Head`, so this returns bare tags:
// Gatsby's Head API hoists whatever it renders into <head>. Under react-helmet
// this component wrapped everything in <Helmet>, which is what made /admin/-style
// pages and any page missing the component silently ship with no metadata.
const Seo = props => {
  const { data, facebook } = props;
  const providedTitle = ((data || {}).frontmatter || data || {}).title || config.siteTitle;
  const providedDescription = ((data || {}).frontmatter || data || {}).subTitle;
  const providedCover = ((data || {}).frontmatter || data || {}).cover;
  const providedSlug = ((data || {}).fields || data || {}).slug;

  const siteUrl = config.siteUrl + config.pathPrefix;
  const title = providedTitle ? `${providedTitle} - ${config.shortSiteTitle}` : config.siteTitle;
  const description = providedDescription
    ? providedDescription
    : `${providedTitle} - ${config.siteDescription}`;
  const imageSrc = siteUrl + (providedCover ? providedCover : config.siteImage);
  const url = siteUrl + (providedSlug ? providedSlug : "/");
  const twitterAccount = config.authorTwitterAccount ? `@${config.authorTwitterAccount}` : "";

  return (
    <>
      {/* General tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {/* OpenGraph tags */}
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageSrc} />
      <meta property="og:type" content="website" />
      {facebook && facebook.appId && <meta property="fb:app_id" content={facebook.appId} />}
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary" />
      {/* Tag for entire blog */}
      <meta name="twitter:site" content={twitterAccount} />
      {/* Tag for a specific author - we should modify it if we ever allow Twitter in frontmatter */}
      <meta name="twitter:creator" content={twitterAccount} />
    </>
  );
};

Seo.propTypes = {
  data: PropTypes.object,
  facebook: PropTypes.object
};

export default Seo;
