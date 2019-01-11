import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailShareButton,
  FacebookShareCount,
  LinkedinShareCount,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon
} from "react-share";

import config from "../../../content/meta/config";

const styles = theme => ({
  share: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "1em 0 0",
    [`@media (min-width: ${theme.mediaQueryTresholds.M}px)`]: {
      flexDirection: "row"
    }
  },
  links: {
    display: "flex",
    flexDirection: "row",
    "& .SocialMediaShareButton": {
      margin: "0 .8em",
      cursor: "pointer"
    }
  },
  label: {
    fontSize: "1.2em",
    margin: "0 1em 1em",
    [`@media (min-width: ${theme.mediaQueryTresholds.M}px)`]: {
      margin: "0 1em"
    }
  }
});

class PostShare extends React.Component {
  render() {
    const { classes, post, tags, slug } = this.props;
    const { frontmatter } = post;
    const { title, subTitle } = frontmatter;
    const url = config.siteUrl + config.pathPrefix + slug;
    const mergedTitle = `${title} - ${subTitle}`;

    const iconSize = 36;
    const filter = count => (count > 0 ? count : "");

    return (
      <div className={classes.share}>
        <span className={classes.label}>SHARE</span>
        <div className={classes.links}>
          <TwitterShareButton
            url={url}
            via={config.authorTwitterAccount}
            title={mergedTitle}
            hashtags={tags.map(tag => tag.name)}
          >
            <TwitterIcon round size={iconSize} />
          </TwitterShareButton>
          <FacebookShareButton
            url={url}
            quote={mergedTitle}
            aria-label="Facebook share"
          >
            <FacebookIcon round size={iconSize} />
            <FacebookShareCount url={url}>
              {count => <div className="share-count">{filter(count)}</div>}
            </FacebookShareCount>
          </FacebookShareButton>
          <LinkedinShareButton url={url} title={title} description={subTitle}>
            <LinkedinIcon round size={iconSize} />
            <LinkedinShareCount url={url}>
              {count => <div className="share-count">{filter(count)}</div>}
            </LinkedinShareCount>
          </LinkedinShareButton>
          <EmailShareButton subject={mergedTitle} body={url}>
            <EmailIcon round size={iconSize} />
          </EmailShareButton>
        </div>
      </div>
    );
  }
}

PostShare.propTypes = {
  classes: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalCount: PropTypes.number
    }).isRequired
  ).isRequired,
  slug: PropTypes.string.isRequired
};

export default injectSheet(styles)(PostShare);
