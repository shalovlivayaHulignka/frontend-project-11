import onChange from 'on-change';

export default (state, i18nextInstance) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const form = document.querySelector('.rss-form');

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.processState') {
      switch (value) {
        case 'failed':
          console.log('failed');
          feedback.textContent = state.form.error;
          input.classList.add('is-invalid');
          feedback.classList.add('text-danger');
          break;
        case 'success':
          console.log('success');
          form.reset();
          input.focus();
          feedback.textContent = '';
          input.classList.remove('is-invalid');
          feedback.classList.remove('text-danger');
          break;
        default:
          throw new Error(`Unexpected process state: ${value}`);
      }
    }
  });

  return watchedState;
};
