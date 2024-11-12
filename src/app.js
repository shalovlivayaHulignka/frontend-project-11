import * as yup from 'yup';
import view from './view.js';

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

const app = () => {
  const state = {
    form: {
      valid: true,
      processState: 'filling',
      processError: null,
      errors: {},
      field: '',
    },
    feeds: [],
  };

  const watchedState = view(state);
  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url');
    watchedState.field = link;
    const errors = validateLink(watchedState.field, watchedState.feeds);
    watchedState.form.errors = errors;

    if (!errors) {
      watchedState.feeds.push(link);
      watchedState.form.proccessState = 'success';
    } else {
      watchedState.form.proccessState = 'failed';
    }
  });
};

export default app;
