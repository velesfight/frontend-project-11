import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

console.log('loading');

const validate = (url, urls) => {
  const schema = yup.string().required().url().notOneOf(urls);
  return schema.validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const addId = (posts, feedId) => {
  const postsId = posts.map((post) => ({
    ...post,
    feedId,
    id: _.uniqueId(),
  }));
  return postsId;
};

const loadUrl = (url, watchedState) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`)
  .then((response) => response.data.contents)
  .then((data) => {
    const { feed, post } = parser(data);
    const idFeed = _.uniqueId();
    feed.id = idFeed;
    const postId = post.map((item) => ({
      ...item,
      idFeed,
      id: _.uniqueId(),
    }));
    watchedState.feeds.push(feed);
    watchedState.posts.push(postId);
  })
  .catch((error) => {
    watchedState.errors = error.message;// eslint-disable-line
  });
debugger
const parseUrl = (url) => {
  const copyUrl = new URL('https://allorigins.hexlet.app/get');
  copyUrl.searchParams.set('url', url);
  copyUrl.searchParams.set('disableCache', true);
  return copyUrl;
};

const getUpdates = (watchedState) => {
  const feedUrl = watchedState.feeds.map((feed) => feed.url);
  const request = axios.get(parseUrl(feedUrl));
  return request.then((response) => {
    const { posts } = parser(response.data.contents);
    const postsLinks = watchedState.posts.map((post) => post.link);

    const newPosts = posts.filter((post) => !postsLinks.includes(post.link));
    const idNewPost = _.uniqueId();
    const newPost = addId(newPosts, idNewPost);
    watchedState.posts.push(...newPost);
    Promise.all(request).then(setTimeout(() => getUpdates(watchedState), 5000));
  });
};

export default () => {
  const initState = {
    statusProcess: 'filling',
    form: {
      isValid: null,
      urls: [],
    },
    posts: [],
    feeds: [],
    errors: null,
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
      const watchedState = onChange(initState, render(initState, elements, i18n));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const currentUrl = formData.get('url').trim();
        const beforeUrl = initState.urls.map((url) => url);
        validate(currentUrl, beforeUrl)
          .then((error) => {
            if (error) {
              watchedState.isValid = 'false';
              watchedState.statusProcess = 'filling';
              watchedState.errors = error;// есть ошибка и надо ее записать в стейт
            } else {
              loadUrl(currentUrl);
              watchedState.isValid = 'true';
              watchedState.statusProcess = 'sending';
              watchedState.errors = null;
              watchedState.form.urls.push(currentUrl);
            }
          });
      });

      elements.postsCard.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) {
          return;
        }
        watchedState.uiState.modalId = id;
        console.log(id);
        watchedState.readPost.add(id);
      });
      getUpdates(watchedState);
    });
};
