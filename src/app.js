import * as yup from 'yup';
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

const loadUrl = (url) => axios.get(getURL(url))
  .then((response) => {
    console.log(response.data);
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
      .then(() => {
        status.links.push(link);
        status.processState = 'processed';
      })
      .catch((e) => {
        status.error = e.message;
        status.processState = 'failed';
      })

  });
};

export default app;
