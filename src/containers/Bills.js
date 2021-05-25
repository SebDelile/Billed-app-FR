// /** @module containers/Bills */
import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  /**
   * Class Bills - Manages the features of the Bill page (landing page for employee pathway)
   * @class Bills
   * @param {Object} document - the document (HTML page)
   * @param {function} onNavigate - the function which is called to navigate to another page
   * @param {object} firestore - instance of the firestore class
   * @param {object} localStorage - windows.localStorage, used to store user's login info
   */
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye.length !== 0)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", (e) => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  /**
   * handle the click on the newbill button, navigate to NewBill page
   * @function
   * @memberof Bills
   */
  handleClickNewBill = (e) => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  /**
   * handle the click on a see attached file button, display the attached file in a modal
   * @function
   * @memberof Bills
   */
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    $("#modaleFile").find(".modal-body").html(`<div style='text-align: center;'><img style='max-width: 100%; max-height: 100%;' src=${billUrl} /></div>`);
    $("#modaleFile").modal("show");
  };

  /**
   * ask the bills data to the firebase,
   * filter the bills corresponding to the logged-in user
   * @function
   * @async
   * @memberof Bills
   * @return {array} bills corresponding to the logged-in user
   */
  // not need to cover this function by tests
  getBills = () => {
    const userEmail = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).email : "";
    if (this.firestore) {
      return this.firestore
        .bills()
        .get()
        .then((snapshot) => {
          const bills = snapshot.docs.map((doc) => ({ ...doc.data() })).filter((bill) => bill.email === userEmail);
          return bills;
        })
        .catch((error) => error);
    }
  };
}
