import React from "react";
import PropTypes from "prop-types";

import Article from "../Main/Article";
import PostHeader from "./PostHeader";
import Content from "../Main/Content";
import PostFooter from "./PostFooter";

const Post = props => {
  const { post, tags, author } = props;

  const {
    fields: { slug, date },
    frontmatter: { title, subTitle, postAuthor },
    html
  } = post;

  return (
    <Article>
      <PostHeader
        title={title}
        subTitle={subTitle}
        date={date}
        postAuthor={postAuthor}
        tags={tags}
      />
      <Content html={html} />
      <PostFooter author={author} post={post} slug={slug} />
    </Article>
  );
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalCount: PropTypes.number.isRequired,
    }).isRequired
  ).isRequired,
  author: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired
};

export default Post;
