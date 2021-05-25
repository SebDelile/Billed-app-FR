// /** @module containers/Logout */
import { ROUTES_PATH } from "../constants/routes.js";

export default class Logout {
  /**
   * Class Logout - Manages the logout feature
   * @class Logout
   * @param {Object} document - the document (HTML page)
   * @param {function} onNavigate - the function which is called to navigate to another page
   * @param {object} localStorage - windows.localStorage, used to store user's login info
   */
  constructor({ document, onNavigate, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.localStorage = localStorage;
    $("#layout-disconnect").click(this.handleClick);
  }

  /**
   * handle the click on the logout button,
   * clear the localStorage
   * navigate to Login page
   * @function
   * @memberof Logout
   */
  handleClick = (e) => {
    this.localStorage.clear();
    this.onNavigate(ROUTES_PATH["Login"]);
  };
}
