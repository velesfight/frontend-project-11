export default (elements, initState, i18n) => {
  const { input, feedback, form } = elements;
  if (initState.form.isValid === 'true') {
    input.classList.remove('is-invalid');
    feedback.textContent = i18n.t('message.rssLoaded'); // ?
    form.reset();
    input.focus();
  } else {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = initState.errors;
  }
};
const makeContainerFeeds = (feeds, i18n) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');

  const div = document.createElement('div');
  div.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = `${i18n.t('cards.feed')}`; // "Фиды"
  div.appendChild(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title; // ?  новые уроки на хекслете

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;// практические уроки

    container.replaceChildren(div, ul, li, title, description);
  });
};

const makeContainerPosts = (initState, i18n) => {
  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('cards.posts'); // "Посты"

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  cardBody.append(cardTitle);
  cardContainer.append(cardBody);

  initState.posts.forEach((post) => {
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

    if (initState.readPost.has(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }

    li.append(a, button);
    ul.append(li);
  });
  cardContainer.replaceChildren(ul);

  const makeModal = (modalId) => {
    const readPost = initState.posts.find(({ id }) => id === modalId);
    const {
      id, title, description, link,
    } = readPost;

    const modal = document.querySelector('.modal');

    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalLink = document.querySelector('.modal-link');

    modal.setAttribute('data-id', id);
    modalTitle.textContent = title;
    modalBody.textContent = description;
    modalLink.setAttribute('href', link);
  };
};
