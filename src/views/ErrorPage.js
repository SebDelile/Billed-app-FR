/** @module views/ErrorPage */
import VerticalLayout from "./VerticalLayout.js";

/**
 * function ErrorPage - build UI of the Error page
 * @function
 * @param {string} error - the error message if applicable
 * @return {string} the UI of the error page to be used in the html
 */
export default (error) => {
  return `
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Erreur </div>
        </div>
        <div data-testid="error-message">
          ${error ? error : ""}
        </div>
    </div>`;
};
