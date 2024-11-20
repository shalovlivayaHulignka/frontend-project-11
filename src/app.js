import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import { setLocale } from 'yup';
import view from './view.js';
import languages from './locales/index.js';
import parser from "./parser.js";

const app = () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: languages,
  })
    .then(setLocale({
      mixed: { notOneOf: 'errors.existedUrl' },
      string: { url: 'errors.invalidUrl' },
    }));

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

  const getURL = (url) => {
    const result = new URL('/get', 'https://allorigins.hexlet.app');
    result.searchParams.set('disableCache', true);
    result.searchParams.set('url', url);
    return result.toString();
  };

  const addPost = (data) => {
    const feedId = _.uniqueId();
    const { name, description } = data.feed;
    const feed = { feedId, name, description };
    const posts = data.posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
    return { feed, posts };
  };

  const loadUrl = (url) => axios.get(getURL(url))
    .catch(() => {
      throw new Error('errors.requestErr');
    })
    .then((response) => {
      const parse = parser(response.data.contents);
      return addPost(parse);
    })
    .catch((e) => {
      throw new Error(e.message);
    });

  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (!id) return;
    status.id.add(id);
    const { title, description, link } = status.posts.filter((item) => item.id === id)[0];
    status.modal = { title, description, link };
  });

  const updateRSS = () => {
    const promises = status.links
      .map((link, index) => loadUrl(link)
        .then((response) => {
          const { feedId } = status.feeds[index];
          const filterPosts = status.posts.filter((post) => post.feedId === feedId);
          const currentNewPosts = _.differenceBy(response.posts, filterPosts, 'title')
            .map((post) => ({ feedId, id: _.uniqueId, ...post }));
          if (currentNewPosts.length > 0) {
            status.posts.push(...currentNewPosts);
            status.processState = 'processed';
          }
        })
        .catch((err) => {
          status.error = err.message;
          status.processState = 'failed';
          throw new Error(err.message);
        }));
    Promise.all(promises).finally(() => setTimeout(updateRSS, 5000));
  };
  setTimeout(updateRSS, 5000);

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
        status.feeds.push(data.feed);
        status.posts.push(...data.posts);
        status.links.push(link);
        status.processState = 'processed';
      })
      .catch((error) => {
        status.error = error.message;
        status.processState = 'failed';
      });
  });
};

export default app;
