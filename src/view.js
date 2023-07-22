const renderForm = ({ input, feedback }, { isValid, error }, i18n) => {
  if (isValid) {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    // eslint-disable-next-line no-param-reassign
    feedback.textContent = '';
  } else {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    // eslint-disable-next-line no-param-reassign
    feedback.textContent = i18n.t(`message.${error}`);
  }
};

const makeContainerFeeds = ({ feedsCard }, { feeds }, i18n) => {
  const feedsContainer = document.createElement('div');
  feedsContainer.classList.add('card', 'border-0');

  const div = document.createElement('div');
  div.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('cards.feeds');
  div.appendChild(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    feedsContainer.replaceChildren(div, ul, li, title, description);
  });
  feedsCard.appendChild(feedsContainer);
};

const makeContainerPosts = ({ postsCard }, { posts, seenPosts }, i18n) => {
  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('cards.posts');
  console.log(cardTitle.textContent);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  cardBody.append(cardTitle);
  cardContainer.appendChild(cardBody);

  posts.forEach((post) => {
    const button = document.createElement('button');
    button.textContent = i18n.t('cards.button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', `${post.id}`);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('cards.button');

    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const a = document.createElement('a');
    a.setAttribute('href', `${post.link}`);
    a.setAttribute('data-id', `${post.id}`);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;

    if (seenPosts.has(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }

    li.append(a, button);
    ul.append(li);
  });
  cardContainer.replaceChildren(ul);
  postsCard.appendChild(cardContainer);
};

const hendler = ({
  form, input, feedback, submit,
}, { status, error }, i18n) => {
  switch (status) {
    case 'loading':
      submit.setAttribute('disabled', 'disabled');
      // eslint-disable-next-line no-param-reassign
      input.readOnly = true;
      break;
    case 'success':
      // eslint-disable-next-line no-param-reassign
      submit.removeAttribute('disabled');
      feedback.classList.add('text-success');
      submit.removeAttribute('disabled');
      // eslint-disable-next-line no-param-reassign
      input.readOnly = false;
      // eslint-disable-next-line no-param-reassign
      feedback.textContent = i18n.t('message.rssLoaded');
      form.reset();
      input.focus();
      break;
    case 'failed':
      submit.removeAttribute('disabled');
      feedback.classList.add('text-danger');
      submit.removeAttribute('disabled');
      // eslint-disable-next-line no-param-reassign
      feedback.textContent = i18n.t(`message.${error}`);
      break;
    default:
      break;
  }
};

const makeModal = (elements, { posts, ui }) => {
  const {
    modal,
    modalTitle,
    modalBody,
    modalLink,
  } = elements;
  const { modalId } = ui;
  const post = posts.find(({ id }) => id === modalId);
  const {
    id, title, description, link,
  } = post;
  modal.setAttribute('data-id', id);
  modalTitle.textContent = title;
  modalBody.textContent = description;
  modalLink.setAttribute('href', link);
};

const render = (elements, state, i18n) => (path, value) => {
  switch (path) {
    case 'form': renderForm(elements, value, i18n);
      break;
    case 'loadingProcess': hendler(elements, value, i18n);
      break;
    case 'posts': makeContainerPosts(elements, state, i18n);
      break;
    case 'feeds': makeContainerFeeds(elements, state, i18n);
      break;
    case 'seenPosts': makeContainerPosts(elements, state, i18n);
      break;
    case 'ui.modalId': makeModal(elements, state);
      break;
    default:
      break;
  }
};

export default render;
