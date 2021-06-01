/** @module app/Router */
import firestore from "./Firestore.js";
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js";
import Bills from "../containers/Bills.js";
import NewBill from "../containers/NewBill.js";
import Dashboard from "../containers/Dashboard.js";

import BillsUI from "../views/BillsUI.js";
import DashboardUI from "../views/DashboardUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

/**
 * function Router - is called by the html page to drive all JS
 * take the hash of the URL then build the corresponding UI and instanciate the corresponding class
 * @function
 */
export default async () => {
  const rootDiv = document.getElementById("root");
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });

  /**
   * function onNavigate - same effet as rooter but using a parameter instead of the current hash
   * @function onNavigate
   * @param {string} pathname - the path where to navigate
   */
  window.onNavigate = (pathname) => {
    /**
     * function history.pushState - build the history of the navagtion
     * @function historyPushState
     * @param {object} - navigation information
     */
    window.history.pushState({}, pathname, window.location.origin + pathname);
    if (pathname === ROUTES_PATH["Login"]) {
      rootDiv.innerHTML = ROUTES({ pathname });
      document.body.style.backgroundColor = "#0E5AE5";
      new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, firestore });
    } else if (pathname === ROUTES_PATH["Bills"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.add("active-icon");
      divIcon2.classList.remove("active-icon");
      const bills = new Bills({ document, onNavigate, firestore, localStorage });
      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          const divIcon1 = document.getElementById("layout-icon1");
          const divIcon2 = document.getElementById("layout-icon2");
          divIcon1.classList.add("active-icon");
          divIcon2.classList.remove("active-icon");
          new Bills({ document, onNavigate, firestore, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    } else if (pathname === ROUTES_PATH["NewBill"]) {
      rootDiv.innerHTML = ROUTES({ pathname });
      new NewBill({ document, onNavigate, firestore, localStorage });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.remove("active-icon");
      divIcon2.classList.add("active-icon");
    } else if (pathname === ROUTES_PATH["Dashboard"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const bills = new Dashboard({ document, onNavigate, firestore, bills: [], localStorage });
      bills
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          new Dashboard({ document, onNavigate, firestore, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    }
  };

  /**
   * function onpopstate - manage the goback navigation
   * initiate navigation to a specific path depending on user type
   * @function onpopstate
   */
  window.onpopstate = (e) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (window.location.pathname === "/" && !user) {
      document.body.style.backgroundColor = "#0E5AE5";
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });
    } else if (user) {
      onNavigate(PREVIOUS_LOCATION);
    }
  };

  if (window.location.pathname === "/" && window.location.hash === "") {
    new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, firestore });
    document.body.style.backgroundColor = "#0E5AE5";
  } else if (window.location.hash !== "") {
    if (window.location.hash === ROUTES_PATH["Bills"]) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.add("active-icon");
      divIcon2.classList.remove("active-icon");
      const bills = new Bills({ document, onNavigate, firestore, localStorage });
      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          const divIcon1 = document.getElementById("layout-icon1");
          const divIcon2 = document.getElementById("layout-icon2");
          divIcon1.classList.add("active-icon");
          divIcon2.classList.remove("active-icon");
          new Bills({ document, onNavigate, firestore, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
        });
    } else if (window.location.hash === ROUTES_PATH["NewBill"]) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash });
      new NewBill({ document, onNavigate, firestore, localStorage });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.remove("active-icon");
      divIcon2.classList.add("active-icon");
    } else if (window.location.hash === ROUTES_PATH["Dashboard"]) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true });
      const bills = new Dashboard({ document, onNavigate, firestore, bills: [], localStorage });
      bills
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          new Dashboard({ document, onNavigate, firestore, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
        });
    }
  }

  return null;
};
