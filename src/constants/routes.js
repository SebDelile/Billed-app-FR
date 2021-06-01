/** @module constants/routes */
import LoginUI from "../views/LoginUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import DashboardUI from "../views/DashboardUI.js";

/** object ROUTES_PATH - links the hash to the route
 * @type {Object.<string, string>}
 */
export const ROUTES_PATH = {
  Login: "/",
  Bills: "#employee/bills",
  NewBill: "#employee/bill/new",
  Dashboard: "#admin/dashboard",
};

/** function ROUTES - load the UI of the specified path
 * @function
 * @param {string} pathname - the hash of the current URL
 * @param {array} data - the bills table to include in the UI
 * @param {string} error - the error message
 * @param {boolean} loading - indicates to run the loading page instead of the actual page
 * @return {function} The UI corresponding to the pathname
 */
export const ROUTES = ({ pathname, data, error, loading }) => {
  switch (pathname) {
    case ROUTES_PATH["Login"]:
      return LoginUI({ data, error, loading });
    case ROUTES_PATH["Bills"]:
      return BillsUI({ data, error, loading });
    case ROUTES_PATH["NewBill"]:
      return NewBillUI();
    case ROUTES_PATH["Dashboard"]:
      return DashboardUI({ data, error, loading });
    default:
      return LoginUI({ data, error, loading });
  }
};
