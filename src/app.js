import * as yup from 'yup';
import i18next from 'i18next';
import view from './view.js';
import languages from './locales/index.js';

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
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    languages,
  })
    .then(yup.setLocale({
      mixed: {
        notOneOf: () => i18nextInstance.t('errors.existedUrl'),
      },
      string: {
        url: () => i18nextInstance.t('errors.invalidUrl'),
      },
    }));

  const state = {
    lng: defaultLanguage,
    form: {
      valid: true,
      processState: 'filling',
      processError: null,
      error: null,
      field: '',
    },
    feeds: [],
  };

  const watchedState = view(state, i18nextInstance);
  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url').trim();
    const error = validateLink(link, watchedState.feeds);
    watchedState.form.error = error;

    if (!error) {
      watchedState.feeds.push(link);
      watchedState.form.proccessState = 'success';
    } else {
      watchedState.form.proccessState = 'failed';
    }
  });
};

export default app;
