import { screen } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firebaseMock from "../__mocks__/firebase";
import firestoreMock from "../__mocks__/firestore.js";
import firestore from "../app/Firestore.js"
import router from "../app/Router.js"

//setup for tests
const onNavigateOriginal = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

class InitiateBills {
  constructor({ onNavigateFunction = onNavigateOriginal, billsSample = bills, error = false, loading = false } = {}) {
    const onNavigate = onNavigateFunction;
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const html = BillsUI({ data: billsSample, error: error, loading: loading });
    document.body.innerHTML = html;
    this.object = new Bills({
      document,
      onNavigate,
      firestore: firestore,
      localStorage: window.localStorage,
    });
  }
}
//end of setup

describe("Given I am connected as an employee", () => {
  // Unit tests
  describe("When I am on Bills Page and there are bills", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      const frenchMonths = [];
      for (let i = 0; i < 12; i++) {
        frenchMonths.push(new Intl.DateTimeFormat("fr", { month: "short" }).format(new Date(2000, i)));
      }
      //to reverse the formated date into a date object
      const formatDateReverse = (formatedDate) => {
        let [day, month, year] = formatedDate.split(" ");
        day = parseInt(day);
        month = frenchMonths.findIndex((element) => element === month.toLowerCase());
        year = parseInt(year) < 70 ? 2000 + parseInt(year) : 1900 + parseInt(year);
        return new Date(year, month, day);
      };

      document.body.innerHTML = BillsUI({ data: bills });
      const dates = Array.from(document.body.querySelectorAll("#data-table tbody>tr>td:nth-child(3)")).map((a) => a.innerHTML);
      const antiChrono = (a, b) => (formatDateReverse(a) < formatDateReverse(b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe("When I am on Bills Page and there are no bill", () => {
    test("Then bills should render an empty table", () => {
      document.body.innerHTML = BillsUI({ data: [] });
      const tbody = screen.queryByTestId("tbody");
      expect(tbody.innerHTML).toBe("");
    });
  });
  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
  describe("When I am on Bills page and I click on the submit a new bill button", () => {
    test("Then, the router should be called to go to the newBill page", () => {
      const onNavigate = jest.fn();
      new InitiateBills({ onNavigateFunction: onNavigate });
      document.querySelector(`button[data-testid="btn-new-bill"]`).click();
      expect(onNavigate).toHaveBeenCalledWith("#employee/bill/new");
    });
  });
  describe("When I am on Bills page and I click on the iconEye of one of the bills", () => {
    test.only("Then, the open modal handler should be run", () => {
      const initiateBills = new InitiateBills();
      const getSpy = jest.spyOn(initiateBills.object, "handleClickIconEye");
      $.fn.modal = jest.fn(); //modal is a Bootstrap function, not reachable here
      document.querySelector(`div[data-testid="icon-eye"]`).click();
      expect(getSpy).toBeCalled();
    });
  });
  describe("When I am on Bills page and I open the modal", () => {
    test("Then, the modal should open with the image of the bill attached file inside", () => {
      const initiateBills = new InitiateBills();
      $.fn.modal = jest.fn(); //modal is a Bootstrap function, not reachable here
      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
      initiateBills.object.handleClickIconEye(iconEye);
      expect($.fn.modal).toHaveBeenCalled();
      expect(document.querySelector(".modal-body img").getAttribute("src")).toEqual(iconEye.getAttribute("data-bill-url"));
    });
  });
});

// Integration tests
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebaseMock, "get");
      const initiateBills = new InitiateBills({ billsSample: [] });
      const receivedBills = await initiateBills.object.getBills();
      expect(getSpy).toHaveBeenCalled();
      expect(receivedBills.length).toEqual(4);
    });

    /* SECOND FETCH ASSAY BY USING THE ROUTER TO BE AS CLOSED AS POSSIBLE OF THE REAL APP
    * It doesn't work
    * Router instanciates Bills then call getBills (app/router.js line 58)
    * then it goes to "get()" (containers/Bills.js line 63) then it goes to the __mock__/firebase.js as requiered
    * then it enters inside the "then()" block of getBills (containers/Bills.js line 64)
    * but then it goes to the expect statements (__tests__/Bills.js line 156) instead of going into the "then()" block of the router (app/router.js line 108)
    * so the bills are not yet inserted in th UI when the expect statement is resolved.
    * according to the diagram : spec/sequence_low-User_login.png, the expect() statement is checked after the step #24 or #25 instead of #26

    test("fetches bills from mock API GET", async () => {
      firestore.bills = jest.fn(function () {
        return firebaseMock;
      });
      const getSpy = jest.spyOn(firebaseMock, "get");
      let rootNode = document.createElement("div");
      rootNode.setAttribute("id", "root");
      document.body.appendChild(rootNode);
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/",
          hash: "#employee/bills",
        },
      });
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      expect.assertions(2);
      await router()
      expect(getSpy).toHaveBeenCalled();
      expect(document.querySelectorAll(".tbody[data-testid='tbody'] tr").length).toEqual(4);
    });*/
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebaseMock.get.mockImplementationOnce(() => Promise.reject(Error("Erreur 404")));
      let html;
      try {
        const response = await firebaseMock.get();
        html = BillsUI({ data: response });
      } catch (e) {
        html = BillsUI({ error: e });
      }
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebaseMock.get.mockImplementationOnce(() => Promise.reject(Error("Erreur 500")));
      const initiateBills = new InitiateBills({ billsSample: [] });
      const response = await initiateBills.object.getBills();
      if (response instanceof Error) {
        new InitiateBills({ error: response });
      }
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });

    /* SECOND ATTEMPT TO REALLY CATCH ERRORS WITH THE APP
    * The idea is to do the same as the fetch attempt ie. calling the router to be as closed as possible to the app,
    * the error can be throw by using the firebaseMock mockimplementation as line 173 of this file
    * However the async issue is the same and it doesn't work as the "expect()" is resolve before the "then()" of the router
    */
  });
});
