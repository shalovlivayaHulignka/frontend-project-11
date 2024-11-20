export default (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'text/xml');
  const parsingError = parsedData.querySelector('parsererror');
  if (parsingError) {
    throw new Error('errors.invalidRSS');
  }

  const feed = {
    name: parsedData.querySelector('title').textContent,
    description: parsedData.querySelector('description').textContent,
  };

  const items = [...parsedData.querySelectorAll('item')];
  const posts = items.map((item) => (
    {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }
  ));

  return { feed, posts };
};
