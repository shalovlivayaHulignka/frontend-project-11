import onChange from 'on-change';

export default (state, i18nextInstance) => {
  const form = document.querySelector('.rss-form'),
    input = document.querySelector('#url-input'),
    feedback = document.querySelector('.feedback'),
    button = document.querySelector('[type="submit"]');


  const watchedState = onChange(state, (path, value) => {
    if (path === 'processState') {
      if (value === 'failed') {
        input.focus();
        input.classList.add('is-invalid');
        button.classList.remove('disabled');
        feedback.textContent = i18nextInstance.t(watchedState.error);
        feedback.classList.remove('text-success');
        feedback.classList.add('text-danger');
        watchedState.processState = 'finished';
      }
      if (value === 'processing') {
        feedback.textContent = '';
        button.classList.add('disabled');
        watchedState.error = '';
        watchedState.processState = 'finished';
      }
      if (value === 'processed') {
        form.reset();
        input.focus();
        input.classList.remove('is-invalid');
        button.classList.remove('disabled');
        feedback.textContent = i18nextInstance.t('success');
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        watchedState.processState = 'finished';
      }
    }
  });

  return watchedState;
};
