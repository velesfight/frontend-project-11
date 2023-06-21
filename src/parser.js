export default (string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('no valid Rss');
  } else {
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
  }
};
