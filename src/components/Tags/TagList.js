import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";

const _ = require("lodash");

import { navigate } from "gatsby";
import Chip from "material-ui/Chip";

const styles = theme => ({
  tagList: {
    margin: theme.tagList.margin
  },
  tag: {
    position: theme.tagList.tag.position,
    margin: theme.tagList.tag.margin,
    paddingLeft: theme.tagList.tag.paddingLeft,
    paddingRight: theme.tagList.tag.paddingRight,
    borderRadius: theme.tagList.tag.borderRadius,
    backgroundColor: theme.tagList.tag.background,
    "&:hover": {
      backgroundColor: theme.tagList.tag.backgroundHover
    },
    "&::after": {
      content: theme.base.emptyContent,
      position: theme.tagList.tagArrow.position,
      top: theme.tagList.tagArrow.top,
      right: theme.tagList.tagArrow.right,
      borderTop: theme.tagList.tagArrow.borderTop,
      borderBottom: theme.tagList.tagArrow.borderBottom,
      borderLeft: theme.tagList.tagArrow.borderLeft,
      backgroundColor: theme.tagList.tagArrow.background
    },
    "&:hover::after": {
      borderLeftColor: theme.tagList.tagArrow.backgroundHover
    },
    "&::before": {
      content: theme.base.emptyContent,
      position: theme.tagList.tagCircle.position,
      top: theme.tagList.tagCircle.top,
      left: theme.tagList.tagCircle.left,
      height: theme.tagList.tagCircle.height,
      width: theme.tagList.tagCircle.width,
      borderRadius: theme.tagList.tagCircle.borderRadius,
      backgroundColor: theme.tagList.tagCircle.background,
      boxShadow: theme.tagList.tagCircle.boxShadow
    }
  },
  tagCount: {
    fontSize: theme.tagList.tagCount.font,
    lineHeight: theme.tagList.tagCount.lineHeight,
    margin: theme.tagList.tagCount.margin,
    padding: theme.tagList.tagCount.padding,
    height: theme.tagList.tagCount.height,
    width: theme.tagList.tagCount.width,
    borderRadius: theme.tagList.tagCount.borderRadius,
    backgroundColor: theme.tagList.tagCount.background
  }
});

const TagList = props => {
  const { classes, tags } = props;

  function handleTagClick(tagName) {
    navigate(`/tags/${_.kebabCase(tagName)}/`);
  }

  return (
    <div className={classes.tagList}>
      {tags.map(tag => (
        <Chip
          className={classes.tag}
          key={tag.name}
          label={tag.name}
          avatar={<div className={classes.tagCount}>{tag.totalCount}</div>}
          onClick={() => handleTagClick(tag.name)}
        />
      ))}
    </div>
  );
};

TagList.propTypes = {
  classes: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalCount: PropTypes.number.isRequired
    }).isRequired
  ).isRequired
};

export default injectSheet(styles)(TagList);
