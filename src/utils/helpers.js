const _ = require("lodash");

import theme from "../styles/theme";

export function isWideScreen() {
  if (typeof window !== `undefined`) {
    const windowWidth = window.innerWidth;
    const mediaQueryL = theme.mediaQueryTresholds.L;

    return windowWidth >= mediaQueryL;
  }
}

export function timeoutThrottlerHandler(timeouts, name, delay, handler) {
  if (!timeouts[name]) {
    timeouts[name] = setTimeout(() => {
      timeouts[name] = null;
      handler();
    }, delay);
  }
}

export function mergeTagsWithEqualKebabCaseName(tags) {
  let mergedTags = [];

  tags.forEach(tag => {
    const existingTag = _.find(
      mergedTags,
      mergedTag => _.kebabCase(mergedTag.name) === _.kebabCase(tag.name)
    );

    if (existingTag) {
      existingTag.totalCount += tag.totalCount;

      if (tag.edges) {
        existingTag.edges.push(...tag.edges);
      }
    } else {
      mergedTags.push(tag);
    }
  });

  return mergedTags;
}
