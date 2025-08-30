module.exports = function(eleventyConfig) {
  // collections
  eleventyConfig.addCollection("articles", (collectionApi) => {
    return collectionApi.getFilteredByGlob("articles/*.md");
  });

  // passthrough files that must exist at the site root
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  return {
    dir: { input: ".", includes: "_includes", output: "_site" }
  };
};
