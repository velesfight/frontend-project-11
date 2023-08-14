import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watcher from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';
import yapLocale from './locales/yapSetLocale.js';

const updateTime = 5000;
const weitingTime = 10000;

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

const addProxy = (url) => {
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
    .get(addProxy(url), { timeout: weitingTime })
    .then((response) => {
      const { feed, posts } = parser(response.data.contents);
      feed.url = url;
      feed.id = _.uniqueId();
      const relatedPosts = addId(posts, feed.id);
      // eslint-disable-next-line no-param-reassign
      watchedState.loadingProcess = { status: 'success', error: null };
      watchedState.posts.unshift(...relatedPosts);
      watchedState.feeds.unshift(feed);
    })
    .catch((error) => {
      // eslint-disable-next-line no-param-reassign
      watchedState.loadingProcess = { status: 'failed', error: getError(error) };
    });
};

const update = (watchedState) => {
  const feedUrl = watchedState.feeds.map(({ id, url }) => {
    const request = axios.get(addProxy(url));

    return request
      .then((response) => {
        const { posts } = parser(response.data.contents);
        const postsLinks = watchedState.posts.map((post) => post.feedId === id);
        const newPosts = posts.filter((post) => !postsLinks.includes(post.link));
        const relatedPosts = addId(newPosts, id);
        watchedState.posts.unshift(...relatedPosts);
      })
      .catch((error) => {
        console.error(error);
      });
  });
  Promise.all(feedUrl).then(setTimeout(() => update(watchedState), updateTime));
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
        const formUrl = formData.get('url').trim();
        const urls = watchedState.feeds.map(({ url }) => url);
        validate(formUrl, urls)
          .then((error) => {
            if (error) {
              watchedState.form = { isValid: false, error };
              return;
            }
            watchedState.form = { isValid: true, error: null };
            loadUrl(formUrl, watchedState);
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
      update(watchedState);
    });
};
