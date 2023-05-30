import * as yup from 'yup';
import onChange from 'on-change'
import render from './view.js';

//функция валидации
const validate = (url, urls ) => {
    const schema = yup.string().required().url().notOneOf(urls).trim();
    return schema.validate(url)
    .then(() => {});
  };

export default () => {
    const initState = {
        form: {
            statusInput: 'valid',
        },
            feeds: [],
            eroor: null,
        };
        
        const elements = {
            form: document.querySelector('form'),
            input: document.querySelector('input'),
            feedback: document.querySelector('.feedback'),
            };

        //слежение за initState
        const watchedState = onChange(initState, render(initState, elements));

        //обработчик
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const currentUrl = formData.get('url');
        const beforeUrl = state.feeds.map((url) => url);
        validate(currentUrl, beforeUrl)
        .then(() => {
          watchedState.statusInput = 'valid';
           elements.form.reset();
           elements.input.focus();
        })
        .catch(() => {
            watchedState.statusInput = 'invalid';
        })
});
};