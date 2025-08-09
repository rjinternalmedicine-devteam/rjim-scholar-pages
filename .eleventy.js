module.exports = function(eleventyConfig) {
    eleventyConfig.addCollection("articles", (collectionApi) => {
      return collectionApi.getFilteredByGlob("articles/*.md");
    });
  
    eleventyConfig.addPassthroughCopy("CNAME");
  
    return {
      dir: { input: ".", includes: "_includes", output: "_site" }
    };
  };
  