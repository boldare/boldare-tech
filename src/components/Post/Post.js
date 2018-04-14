import React from "react";
import PropTypes from "prop-types";

import Article from "../Main/Article";
import PostHeader from "./PostHeader";
import Content from "../Main/Content";
import PostFooter from "./PostFooter";

const Post = props => {
  const { post, author, slug } = props;
  const frontmatter = (post || {}).frontmatter;
  const title = ((post || {}).frontmatter || {}).title;
  const subTitle = ((post || {}).frontmatter || {}).subTitle;
  const postauthor = ((post || {}).frontmatter || {}).postAuthor;
  const date = ((post || {}).fields || {}).prefix;
  const html = (post || {}).html;

  return (
    <Article>
      <PostHeader title={title} subTitle={subTitle} date={date} postauthor={postauthor} />
      <Content html={html} />
      <PostFooter author={author} post={post} slug={slug} />
    </Article>
  );
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  author2: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired
};

export default Post;
