import onChange from 'on-change';

export default (state, i18nextInstance) => {
  const form = document.querySelector('.rss-form'),
    input = document.querySelector('#url-input'),
    feedback = document.querySelector('.feedback'),
    button = document.querySelector('[type="submit"]'),
    posts = document.querySelector('.posts'),
    feeds = document.querySelector('.feeds'),
    modalTitle = document.querySelector('.modal-title'),
    modalBody = document.querySelector('.modal-body'),
    modalLink = document.querySelector('.modal a');

  const renderFeeds = () => {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');

    cardTitle.textContent = i18nextInstance.t('feeds');
    cardBody.append(cardTitle);
    card.append(cardBody);

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    const feedsElements = state.feeds.map((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.name;
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = feed.description;
      li.append(h3, p);

      return li;
    });
    ul.append(...feedsElements);
    card.append(ul);
    feeds.append(card);
  };

  const renderPosts = () => {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18nextInstance.t('posts');

    cardBody.append(cardTitle);
    card.append(cardBody);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    const postsElements = state.posts[0].map((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'aling-items-start', 'border-0', 'border-end-0');
      const postTitle = document.createElement('a');
      postTitle.setAttribute('href', post.link);
      postTitle.setAttribute('target', '_blank');
      postTitle.dataset.id = post.id;
      postTitle.textContent = post.title;
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'h-100');
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.dataset.id = post.id;
      button.textContent = i18nextInstance.t('buttons');
      li.append(postTitle, button);
      return li;
    });
    ul.append(...postsElements);
    card.append(ul);
    posts.append(card);
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'viewModal') {
      const { title, description, link } = state.viewModal;
      modalTitle.textContent = title;
      modalBody.textContent = description;
      modalLink.setAttribute('href', link);
      watchedState.processState = 'processed';
    }

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
        posts.innerHTML = '';
        feeds.innerHTML = '';
        renderPosts(watchedState);
        renderFeeds(watchedState);
        watchedState.processState = 'finished';
      }
    }
  });

  return watchedState;
};
