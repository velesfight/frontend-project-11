import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

const validate = (url, urls) => {
  const schema = yup.string().required().url().notOneOf(urls);
  return schema.validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const addId = (posts, feedId) => posts.map((post) => ({
  ...post,
  feedId: _.uniqueId(),
  id: feedId,
}));

const parseUrl = (url) => {
  const copyUrl = new URL('https://allorigins.hexlet.app/get');
  copyUrl.searchParams.set('url', url);
  copyUrl.searchParams.set('disableCache', true);
  return copyUrl.toString();
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
  watchedState.loadingProcess = { status: 'loading', error: null };// eslint-disable-line

  const request = axios.get(parseUrl(url));
  return request
    .then((response) => {
      const { feed, post } = parser(response.data.contents);
      const idFeed = _.uniqueId();
      feed.id = idFeed;
      const postWithId = addId(post, idFeed);
      watchedState.loadingProcess = { status: 'finished', error: null };// eslint-disable-line
      watchedState.posts.push(...postWithId);
    })
    .catch((error) => {
      watchedState.loadingProcess = { status: 'failed', error: getError(error) };// eslint-disable-line
    });
};

const getUpdates = (watchedState) => {
  const feedUrl = watchedState.feeds.map(({ url }) => {
    const request = axios.get(parseUrl(url));

    return request
      .then((response) => {
        const { posts } = parser(response.data.contents);
        const postsLinks = watchedState.posts.map((post) => post.link);

        const newPosts = posts.filter((post) => !postsLinks.includes(post.link));
        const idNewPost = _.uniqueId();
        const newPost = addId(newPosts, idNewPost);
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
      urls: [],
      error: null,
    },
    loadingProcess: {
      status: 'filling',
      error: null,
    },
    posts: [],
    feeds: [],
    uiState: {
      readPost: new Set(),
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
      yup.setLocale({
        mixed: {
          required: 'notEmpty',
          notOneOf: 'rssAlreadyExists',
        },
        string: {
          url: 'invalidUrl',
        },
      });
      const watchedState = onChange(initState, render(elements, initState, i18n));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.loadingProcess.status = 'sending';
        const formData = new FormData(e.target);
        const urlForm = formData.get('url').trim();
        const urls = initState.feeds.map(({ url }) => url);
        validate(urlForm, urls)
          .then((error) => {
            if (error) {
              watchedState.form = { isValid: 'false', error: error.message };
            } else {
              watchedState.form = { isValid: 'true', error: null };
              loadUrl(urlForm, watchedState);
            }
          });
      });

      elements.postsCard.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) {
          return;
        }
        watchedState.uiState.modalId = id;
        watchedState.readPost.add(id);
      });
      getUpdates(watchedState);
    });
};
