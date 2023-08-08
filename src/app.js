import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watcher from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';
import yapLocale from './locales/yapSetLocale.js';

const validate = (url, urls) => {
  const schema = yup.string().required().url().notOneOf(urls);
  return schema.validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const addId = (posts, feedId) => posts.map((post) => ({
  ...post,
  feedId,
  id: _.uniqueId(),
}));

const getProxi = (url) => {
  const proxiUrl = new URL('https://allorigins.hexlet.app/get');
  proxiUrl.searchParams.set('url', url);
  proxiUrl.searchParams.set('disableCache', true);
  return proxiUrl.toString();
};

const getError = (error) => {
  if (error.isParserError) {
    return 'notContainRss';
  }
  if (error.isAxiosError) {
    return 'netWorkError';
  }
  return 'unknownError';
};

const loadUrl = (url, watchedState) => {
  // eslint-disable-next-line no-param-reassign
  watchedState.loadingProcess = { status: 'loading', error: null };

  return axios
    .get(getProxi(url))
    .then((response) => response.data.contents)
    .then((contents) => {
      const { feed, posts } = parser(contents);
      feed.url = url;
      feed.id = _.uniqueId();
      const postWithId = addId(posts, feed.id);
      // eslint-disable-next-line no-param-reassign
      watchedState.loadingProcess = { status: 'success', error: null };
      watchedState.posts.unshift(...postWithId);
      watchedState.feeds.unshift(feed);
    })
    .catch((error) => {
      console.log(error);
      // eslint-disable-next-line no-param-reassign
      watchedState.loadingProcess = { status: 'failed', error: getError(error) };
    });
};

const getUpdates = (watchedState) => {
  const feedUrl = watchedState.feeds.map(({ id, url }) => {
    const request = axios.get(getProxi(url));

    return request
      .then((response) => {
        const { posts } = parser(response.data.contents);
        const postsLinks = watchedState.posts.map((post) => post.link);
        const newPosts = posts.filter((p) => !postsLinks.includes(p.link));
        const newPost = addId(newPosts, id);
        watchedState.posts.unshift(...newPost);
      })
      .catch((error) => {
        console.error(error);
      });
  });
  return Promise.all(feedUrl).then(setTimeout(() => getUpdates(watchedState), 5000));
};

export default () => {
  const initState = {
    form: {
      isValid: false,
      error: null,
    },
    loadingProcess: {
      status: 'filling',
      error: null,
    },
    posts: [],
    feeds: [],
    seenPosts: new Set(),
    ui: {
      modalId: null,
    },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    postsCard: document.querySelector('.posts'),
    feedsCard: document.querySelector('.feeds'),
    submit: document.querySelector('[type="submit"]'),
    modal: document.querySelector('.modal'),

    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal-footer a'),
  };

  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  })
    .then(() => {
      yup.setLocale(yapLocale);

      const watchedState = watcher(elements, initState, i18n);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const urlForm = formData.get('url').trim();
        const urls = watchedState.feeds.map(({ url }) => url);
        validate(urlForm, urls)
          .then((error) => {
            if (error) {
              watchedState.form = { isValid: false, error };
            } else {
              watchedState.form = { isValid: true, error: null };
              loadUrl(urlForm, watchedState);
            }
          });
      });

      elements.postsCard.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) {
          return;
        }
        watchedState.ui.modalId = id;
        watchedState.seenPosts.add(id);
      });
      getUpdates(watchedState);
    });
};
