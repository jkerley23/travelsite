// Captured at start-up in case global data changes as a result of something such as another plugin.
var blogId = window._blog_id; // Global Athena value

module.exports = {
  isParachute: isParachute,
  getPostData: getPostData
};

function isParachute() {
  return blogId === '979'; // We also own blog 1032 - this is not to reflect that at this time.
}

function getPostData() {
  return window.blogsmith.getPostDetails(window._post_id); // Global Athena value
}
