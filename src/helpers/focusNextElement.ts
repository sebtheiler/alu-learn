/**
 * Focuses the next tabbable element. Equivalent to simulating a "tab" press
 * @see https://stackoverflow.com/a/35173443/10226703
 */
const focusNextElement = () => {
  //add all elements we want to include in our selection
  const focussableElements =
    'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

  // @ts-ignore
  if (document.activeElement && document.activeElement.form) {
    const focussable = Array.prototype.filter.call(
      // @ts-ignore
      document.activeElement.form.querySelectorAll(focussableElements),
      function (element) {
        //check for visibility while always include the current activeElement
        return (
          element.offsetWidth > 0 ||
          element.offsetHeight > 0 ||
          element === document.activeElement
        );
      }
    );
    const index = focussable.indexOf(document.activeElement);
    if (index > -1) {
      const nextElement = focussable[index + 1] || focussable[0];
      nextElement.focus();
    }
  }
};

export default focusNextElement;
