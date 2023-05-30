   //VIEW
 export default (elements, initState) => {
    if (initState.statusInput === 'valid') {
             elements.input.classList.remove('is-invalid');
    } else {
             elements.input.classList.add('is-invalid');
     }
 };