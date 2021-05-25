// /** @module containers/Dashboard */
import { formatDate } from "../app/format.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import BigBilledIcon from "../assets/svg/big_billed.js";
import { ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import Logout from "./Logout.js";

/** function filteredBills - filter the bills according to status
 * @function
 * @param {array} data - the bills table to filter
 * @param {string} status - the parameter of the filtering
 * @return {array} The bills selection matching the filtering parameter
 */
export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // in jest environment
        if (typeof jest !== "undefined") {
          selectCondition = bill.status === status;
        } else {
          // in prod environment
          const userEmail = JSON.parse(localStorage.getItem("user")).email;
          selectCondition = bill.status === status && [...USERS_TEST, userEmail].includes(bill.email);
        }

        return selectCondition;
      })
    : [];
};

/** function card - build and return the UI for the preview of the bills in the left-side menues
 * @function
 * @param {object} bill - a bill object
 * @return {string} The UI corresponding to the bill's preview
 */
export const card = (bill) => {
  const firstAndLastNames = bill.email.split("@")[0];
  const firstName = firstAndLastNames.includes(".") ? firstAndLastNames.split(".")[0] : "";
  const lastName = firstAndLastNames.includes(".") ? firstAndLastNames.split(".")[1] : firstAndLastNames;

  return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `;
};

/** function cards - build and return the list of cards to include in the left-side menues
 * @function
 * @param {array} bills - list of bills object
 * @return {string} calls the card function for all bills and join all the result in a big string
 */
export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join("") : "";
};

/** function getStatus - link the index to a status
 * @function
 * @param {number} index - index as 1, 2 or 3
 * @return {string} the status written in full
 */
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

export default class {
  /**
   * Class Dashboard - Manages the features of the Dashboard page (landing page for admin pathway)
   * @class Dashboard
   * @param {Object} document - the document (HTML page)
   * @param {function} onNavigate - the function which is called to navigate to another page
   * @param {object} firestore - instance of the firestore class
   * @param {array} bills - the bills list
   * @param {object} localStorage - windows.localStorage, used to store user's login info
   */
  constructor({ document, onNavigate, firestore, bills, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    $("#arrow-icon1").click((e) => this.handleShowTickets(e, bills, 1));
    $("#arrow-icon2").click((e) => this.handleShowTickets(e, bills, 2));
    $("#arrow-icon3").click((e) => this.handleShowTickets(e, bills, 3));
    this.getBillsAllUsers();
    new Logout({ localStorage, onNavigate });
  }

  /**
   * handle the click on a see attached file button, display the attached file in a modal
   * @function
   * @memberof Dashboard
   */
  handleClickIconEye = () => {
    const billUrl = $("#icon-eye-d").attr("data-bill-url");
    $("#modaleFileAdmin1").find(".modal-body").html(`<div style='text-align: center;'><img style='max-width: 100%; max-height: 100%;' src=${billUrl} /></div>`);
    if (typeof $("#modaleFileAdmin1").modal === "function") $("#modaleFileAdmin1").modal("show");
  };

  /**
   * handle the click on a card,
   * display the corresponding bill in the central pannel
   * turn the color of all cards in blue, and the color of the selected card in darkgray
   * set some event listener on the displayed bill
   * @function
   * @memberof Dashboard
   * @param {object} bill - the selected bill to display
   * @param {array} bills - the whole list of bills
   */
  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0;
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id;
    if (this.counter % 2 === 0) {
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: "#0D5AE5" });
      });
      $(`#open-bill${bill.id}`).css({ background: "#2A2B35" });
      $(".dashboard-right-container div").html(DashboardFormUI(bill));
      $(".vertical-navbar").css({ height: "150vh" });
      this.counter++;
    } else {
      $(`#open-bill${bill.id}`).css({ background: "#0D5AE5" });

      $(".dashboard-right-container div").html(`
        <div id="big-billed-icon"> ${BigBilledIcon} </div>
      `);
      $(".vertical-navbar").css({ height: "120vh" });
      this.counter++;
    }
    $("#icon-eye-d").click(this.handleClickIconEye);
    $("#btn-accept-bill").click((e) => this.handleAcceptSubmit(e, bill));
    $("#btn-refuse-bill").click((e) => this.handleRefuseSubmit(e, bill));
  }

  /**
   * handle the click on the accept submited bill,
   * turn the status of the bill to "accepted"
   * update the number of bils of each category in the left-side menu
   * reload the Dashboard page
   * @function
   * @memberof Dashboard
   * @param {object} bill - the selected bill to display
   */
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "accepted",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  /**
   * handle the click on the refuse submited bill,
   * turn the status of the bill to "refused"
   * update the number of bils of each category in the left-side menu
   * reload the Dashboard page
   * @function
   * @memberof Dashboard
   * @param {object} bill - the selected bill to display
   */
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "refused",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  /**
   * handle the click on of the left-side menues,
   * open or close the menu, showing or hiding the corresponding bills
   * turn the icon to 0 or 90deg depending on opening or closing
   * for opening, add event listener on each of the bills to open it in the central panel
   * @function
   * @memberof Dashboard
   * @param {array} bills - the whole list of bills
   * @param {number} index - the index of the menu
   */
  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0;
    if (this.index === undefined || this.index !== index) this.index = index;
    if (this.counter % 2 === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: "rotate(0deg)" });
      $(`#status-bills-container${this.index}`).html(cards(filteredBills(bills, getStatus(this.index))));
      this.counter++;
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: "rotate(90deg)" });
      $(`#status-bills-container${this.index}`).html("");
      this.counter++;
    }
    bills.forEach((bill) => {
      $(`#status-bills-container${index} #open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills));
    });
    return bills;
  }

  /**
   * ask the bills data to the firebase
   * @function
   * @async
   * @memberof Dashboard
   * @return {array} all bills in thedatabase
   */
  // not need to cover this function by tests
  getBillsAllUsers = () => {
    if (this.firestore) {
      return this.firestore
        .bills()
        .get()
        .then((snapshot) => {
          const bills = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date,
            status: doc.data().status,
          }));
          return bills;
        })
        .catch(console.log);
    }
  };

  /**
   * send the updated bill to the firebase
   * @function
   * @async
   * @memberof Dashboard
   * @param {array} bills - the whole list of bills
   */
  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.firestore) {
      return this.firestore
        .bill(bill.id)
        .update(bill)
        .then((bill) => bill)
        .catch(console.log);
    }
  };
}
