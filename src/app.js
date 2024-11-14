import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import view from './view.js';
import languages from './locales/index.js';
import axios from "axios";

const validateLink = (link, feeds) => {
  const urls = feeds.map((url) => url);
  const schema = yup.string().url().notOneOf(urls);

  try {
    schema.validateSync(link);
    return null;
  } catch (e) {
    return e.message;
  }
};

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
  .then((response) => {
    return parseData(response.data.contents);
  })
  .catch((e) => console.log(e.message));

const app = () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: languages
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
  };

  const status = view(state, i18nextInstance);
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
        const { title, description } = data.feed;
        const feed = { feedId, title, description };
        const posts = data.posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
        state.feeds.push(feed);
        state.posts.push(posts);
        state.links.push(link);
        state.processState = 'processed';
        console.log('state: ', state);

      })
      .catch((e) => {
        status.error = e.message;
        status.processState = 'failed';
      })

  });
};

export default app;
