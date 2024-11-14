import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import view from './view.js';
import languages from './locales/index.js';
import axios from 'axios';

const getURL = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('disableCache', true);
  result.searchParams.set('url', url);
  return result.toString();
};

const parseData = (data) => {
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

const loadUrl = (url) => axios.get(getURL(url))
  .then((response) => parseData(response.data.contents))
  .catch((e) => console.log(e.message));

const app = () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: languages,
  });

  const state = {
    lng: defaultLanguage,
    form: {
      processState: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    links: [],
    modal: {},
    id: new Set(),
  };

  const status = view(state, i18nextInstance);
  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    // console.log(status);
    const { id } = e.target.dataset;
    if (!id) return;
    status.id.add(id);
    const { title, description, link } = status.posts[0].filter((item) => item.id === id)[0];
    status.modal = { title, description, link };
  });

  const form = document.querySelector('.rss-form');
  const schema = yup.string().url().required();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url').trim();
    schema.notOneOf(status.links).validate(link)
      .then(() => {
        status.processState = 'processing';
        return loadUrl(link);
      })
      .then((data) => {
        const feedId = _.uniqueId();
        const { name, description } = data.feed;
        const feed = { feedId, name, description };
        const posts = data.posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
        status.feeds.push(feed);
        status.posts.push(posts);
        status.processState = 'processed';
      })
      .catch((error) => {
        status.error = error.message;
        status.processState = 'failed';
      })
  });
};

export default app;
