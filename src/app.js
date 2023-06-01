import * as yup from 'yup';
import onChange from 'on-change'
import render from './view.js';
import i18next from 'i18next';
import resources from './locales/index.js';

//функция валидации
const validate = (url, urls ) => {
    const schema = yup.string().required().url().notOneOf(urls).trim();
    return schema.validate(url)
    .then(() => {})
    .catch((error) => error.i18n.t('netWorkError'))
  };

export default () => {
    const initState = {
        statusProcess : 'filling', //sending finished failed 
        form: {
            isValid: null,
            urls: [],
        },
            posts: [],
            feeds: [],
            errors: null,
        };
    
    const elements = {
        form: document.querySelector('form'),
        input: document.querySelector('input'),
        feedback: document.querySelector('.feedback'),
        postsCard: document.querySelector('.posts'),
        feedsCard: document.querySelector('.feeds'),
        };

    const defaultLang = 'ru';

    yup.setLocale({
        mixed: {
            required: 'notEmpty',
            notOneOf: 'rssAlreadyExists',
    },
        string: {
            url: 'invalidUrl'
        },
    });
              
    const i18n = i18next.createInstance();
    i18n.init({
        debug: false,
        lng: defaultLang,
        resources,
    });
        //слежение за initState
    const watchedState = onChange(initState, render(initState, elements));

        //обработчик
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const currentUrl = formData.get('url');
        const beforeUrl = state.feeds.map((url) => url);
        validate(currentUrl, beforeUrl)
        .then(error => {
            if (error) {
                watchedState.isValid = 'false';
                watchedState.statusProcess = 'filling';
                watchedState.errors = error;// есть ошибка и надо ее записать в стейт
            } else {
                watchedState.isValid = 'true';
                watchedState.statusProcess = 'sending';
                watchedState.errors = null;
                watchedState.form.urls.push(currentUrl);// нет ошибки надо запустить функцию загрузки
            }
          });
        });
    };