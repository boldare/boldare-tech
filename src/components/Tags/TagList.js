const _ = require("lodash");
import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";
import { navigate } from "gatsby";
import { Chip, Avatar } from "@mui/material";

const styles = theme => ({
  tagList: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  tag: {
    // MUI v5+ replaced the `theme.spacing.unit` property (8 in v3) with the
    // `theme.spacing()` function. The old form silently evaluates to undefined,
    // which drops the margin and shifts every tagged page up by 16px.
    margin: theme.spacing(1),
    // MUI 9 shrinks the Chip's avatar to 24px and gives it its own margins;
    // v3 filled the full 32px chip height. Restored so the count bubbles keep
    // their size and the chips keep their width.
    // MUI 9 sets the Chip label's line-height to 1.5; v3 used 1.6. The chip box
    // is the same size either way, but the label text sits ~1.5px higher.
    "& .MuiChip-label": {
      lineHeight: 1.6
    },
    "& .MuiChip-avatar": {
      width: 32,
      height: 32,
      marginLeft: 0,
      marginRight: -4,
      fontSize: "1.142857rem"
    }
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
