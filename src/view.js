   //VIEW
 export default (elements, initState, i18n) => {
    if (initState.form.isValid === 'true') {
             elements.input.classList.remove('is-invalid');
             elements.feedback.textContent = i18n.t('message.rssLoaded'); //?
             elements.form.reset();
             elements.input.focus();

    }  else {
             elements.input.classList.add('is-invalid');
             elements.feedback.classList.remove('text-success');
             elements.feedback.classList.add('text-danger');
             elements.feedback.textContent = initState.errors;
    }
 };

 const makeContainerFeeds = (feeds, i18n) => {
   const container = document.createElement('div');
   container.classList.add('card', 'border-0');

   const div = document.createElement('div');
   div.classList.add('card-body');

   const h2 = document.createElement('h2');
   h2.classList.add('card-title', 'h4');
   h2.textContent = `${i18n.t('cards.feed')}`; //"Фиды"
   div.appendChild(h2);

   const ul = document.createElement('ul');
   ul.classList.add('list-group', 'border-0', 'rounded-0');

   feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const head = document.createElement('h3');
    head.classList.add('h6', 'm-0');
    head.textContent = feed.head; //?  новые уроки на хекслете

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;//практические уроки 

   container.replaceChildren(div, ul, li, head, description);
   return container; // li h3 p
 });
}

const makeContainerPosts = (posts, i18n) => {
  const cardContainer = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t('cards.posts'); //"Посты"

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  cardBody.append(cardTitle);
  cardContainer.append(cardBody);
  cardContainer.append(ul);
//
  const button = document.createElement('button');
  button.textContent = i18next.t('renderPosts.button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.setAttribute('type', 'button');
  button.setAttribute('data-id', id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');

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
    a.setAttribute('href', url);
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = '';//?
};

 
 