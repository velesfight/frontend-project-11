   //VIEW
 export default (elements, initState) => {
    if (initState.statusInput === 'valid') {
             elements.input.classList.remove('is-invalid');
    } 
    if (initState.statusInput === 'invalid') {
             elements.input.classList.add('is-invalid');
             elements.feedback.classList.remove('text-success');
             elements.feedback.classList.add('text-danger');
    }
     if (initState.statusInput === 'success') {
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
     }
 };