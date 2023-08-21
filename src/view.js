import onChange from 'on-change';

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

const renderFeeds = ({ feedsCard }, { feeds }, i18n) => {
  // eslint-disable-next-line no-param-reassign
  feedsCard.innerHTML = '';
  const feedsContainer = document.createElement('div');
  feedsContainer.classList.add('card', 'border-0');

  const divCard = document.createElement('div');
  divCard.classList.add('card-body');
  const h2Title = document.createElement('h2');
  h2Title.classList.add('card-title', 'h4');
  h2Title.textContent = i18n.t('cards.feeds');
  divCard.appendChild(h2Title);

  const ulList = document.createElement('ul');
  ulList.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const liListGroup = document.createElement('li');
    liListGroup.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    feedsContainer.replaceChildren(divCard, ulList, liListGroup, title, description);
  });
  feedsCard.appendChild(feedsContainer);
};

const renderPosts = ({ postsCard }, { posts, seenPosts }, i18n) => {
  // eslint-disable-next-line no-param-reassign
  postsCard.innerHTML = '';
  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('cards.posts');

  const ulListGroup = document.createElement('ul');
  ulListGroup.classList.add('list-group', 'border-0', 'rounded-0');

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

    const liGroupItem = document.createElement('li');
    liGroupItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const aPostTitle = document.createElement('a');
    aPostTitle.setAttribute('href', `${post.link}`);
    aPostTitle.setAttribute('data-id', `${post.id}`);
    aPostTitle.setAttribute('target', '_blank');
    aPostTitle.setAttribute('rel', 'noopener noreferrer');
    aPostTitle.textContent = post.title;

    if (seenPosts.has(post.id)) {
      aPostTitle.classList.add('fw-normal', 'link-secondary');
    } else {
      aPostTitle.classList.add('fw-bold');
    }

    liGroupItem.append(aPostTitle, button);
    ulListGroup.append(liGroupItem);
  });
  cardContainer.replaceChildren(ulListGroup);
  postsCard.appendChild(cardContainer);
};

const render = ({
  form, input, feedback, submit,
}, { status, error }, i18n) => {
  switch (status) {
    case 'loading':
      submit.setAttribute('disabled', 'disabled');
      // eslint-disable-next-line no-param-reassign
      input.readOnly = false;
      break;
    case 'success':
      submit.removeAttribute('disabled');
      feedback.classList.add('text-success');
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

const renderModal = (elements, { posts, ui }) => {
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

const watcher = (elements, initState, i18n) => onChange(initState, (path, value) => {
  switch (path) {
    case 'form': renderForm(elements, value, i18n);
      break;
    case 'loadingProcess': render(elements, value, i18n);
      break;
    case 'posts': renderPosts(elements, initState, i18n);
      break;
    case 'feeds': renderFeeds(elements, initState, i18n);
      break;
    case 'seenPosts': renderPosts(elements, initState, i18n);
      break;
    case 'ui.modalId': renderModal(elements, initState);
      break;
    default:
      break;
  }
});

export default watcher;
