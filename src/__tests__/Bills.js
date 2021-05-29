import { screen } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firebaseMock from "../__mocks__/firebase";
import firestore from "../app/Firestore.js";
import router from "../app/Router.js";

//setup for tests
const flushPromises = async () => new Promise(setImmediate); // wait for promises to be resolved before continue the code

class InitiateBills {
  constructor({billsSample = bills, error = false, loading = false } = {}) {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
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
      firestore: null,
      localStorage: window.localStorage,
    });
  }
}

class InitiateRouterToBills{
  constructor() {
    document.body.innerHTML = `<div id='root'></div>`;
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
    router();
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
    test("Then, the submit a new bill handler should be run", () => {
      const initiateBills = new InitiateBills();
      initiateBills.object.handleClickNewBill = jest.fn();
      document.querySelector(`button[data-testid="btn-new-bill"]`).click();
      expect(initiateBills.object.handleClickNewBill).toBeCalled();
    });
  });
  describe("When I am on Bills page and I click on the iconEye of one of the bills", () => {
    test("Then, the open modal handler should be run", () => {
      const initiateBills = new InitiateBills();
      initiateBills.object.handleClickIconEye = jest.fn();
      document.querySelector(`div[data-testid="icon-eye"]`).click();
      expect(initiateBills.object.handleClickIconEye).toBeCalled();
    });
  });
  describe("When I am on Bills page and I click on the submit a new bill button", () => {
    test("Then, the router should be called to go to the newBill page", () => {
      const initiateBills = new InitiateBills();
      initiateBills.object.onNavigate = jest.fn();
      initiateBills.object.handleClickNewBill();
      expect(initiateBills.object.onNavigate).toHaveBeenCalledWith("#employee/bill/new");
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
  describe("When I land on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      firestore.bills = jest.fn(function () {
        return firebaseMock;
      });
      const getSpy = jest.spyOn(firebaseMock, "get");
      new InitiateRouterToBills()
      await flushPromises(); // router() : getBills().then() promise
      expect(getSpy).toHaveBeenCalled();
      const numberOfLines = document.querySelectorAll("tbody[data-testid='tbody'] tr").length;
      expect(numberOfLines).toEqual(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firestore.bills = jest.fn(function () {
        return firebaseMock;
      });
      firebaseMock.get = jest.fn(() => Promise.reject(Error("Erreur 404")));
      new InitiateRouterToBills()
      await flushPromises(); // router() : getBills().then() promise
      expect(screen.getByText(/Erreur 404/)).toBeTruthy();;
    })
    test("fetches bills from an API and fails with 500 message error", async () => {
      firestore.bills = jest.fn(function () {
        return firebaseMock;
      });
      firebaseMock.get = jest.fn(() => Promise.reject(Error("Erreur 500")));
      new InitiateRouterToBills()
      await flushPromises(); // router() : getBills().then() promise
      expect(screen.getByText(/Erreur 500/)).toBeTruthy();
    })
  })
});
