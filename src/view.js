   //VIEW
 export default (elements, initState) => {
    if (initState.statusInput === 'true') {
             elements.input.classList.remove('is-invalid');
    }  else {
             elements.input.classList.add('is-invalid');
             elements.feedback.classList.remove('text-success');
             elements.feedback.classList.add('text-danger');
             elements.feedback.textContent = initState.errors;
    }
 };