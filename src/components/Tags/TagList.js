const _ = require("lodash");
import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";
import { navigate } from "gatsby";
import { Chip, Avatar } from "@material-ui/core";

const styles = theme => ({
  tagList: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  tag: {
    margin: theme.spacing.unit
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
          avatar={<Avatar>{tag.totalCount}</Avatar>}
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
