export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const error = new Error(errorNode.textContent);
    error.isParseError = true;
    throw error;
  }
  const titleFeed = doc.querySelector('title').textContent;
  const descriptionFeed = doc.querySelector('description').textContent;
  const feed = {
    title: titleFeed,
    description: descriptionFeed,
  };

  const items = Array.from(doc.querySelectorAll('item'));
  const post = items.map((item) => {
    const titlePost = item.querySelector('title').textContent;
    const urlPost = item.querySelector('link').textContent;
    const descriptionPost = item.querySelector('description').textContent;
    return {
      title: titlePost,
      description: descriptionPost,
      link: urlPost,
    };
  });
  return { feed, post };
};
