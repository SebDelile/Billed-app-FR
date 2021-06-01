import { screen } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { billsSample } from "../fixtures/billsSample.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockFirebase from "../__mocks__/firebase";
import router from "../app/Router.js";
import mockOnNavigate from "../__mocks__/onNavigate.js";
jest.mock("../app/Firestore.js");

//setup for tests

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

const flushPromises = async () => new Promise(setImmediate); // wait for any pending promise to be resolved before continue the code

//end of setup

describe("Given I am connected as an employee", () => {
  // Unit tests
  describe("When I access Bills Page", () => {
    test("Then the Bills page should be rendered", () => {
      document.body.innerHTML = BillsUI({ data: billsSample });
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
  describe("When I am on Bills Page and there are bills", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      const frenchMonths = [];
      for (let i = 0; i < 12; i++) {
        frenchMonths.push(new Intl.DateTimeFormat("fr", { month: "short" }).format(new Date(2000, i)));
      }
      const formatDateReverse = (formatedDate) => {
        let [day, month, year] = formatedDate.split(" ");
        day = parseInt(day);
        month = frenchMonths.findIndex((element) => element === month.toLowerCase());
        year = parseInt(year) < 70 ? 2000 + parseInt(year) : 1900 + parseInt(year); //arbitrary range for year : 1970-2069
        return new Date(year, month, day);
      };
      const antiChronoSort = (a, b) => (formatDateReverse(a) < formatDateReverse(b) ? 1 : -1);

      document.body.innerHTML = BillsUI({ data: billsSample });
      const dates = Array.from(document.body.querySelectorAll("#data-table tbody>tr>td:nth-child(3)")).map((a) => a.innerHTML);
      const datesSorted = [...dates].sort(antiChronoSort);
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
      document.body.innerHTML = BillsUI({ data: billsSample });
      const bills = new Bills({
        document,
        mockOnNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      bills.handleClickNewBill = jest.fn();
      document.querySelector(`button[data-testid="btn-new-bill"]`).click();
      expect(bills.handleClickNewBill).toBeCalled();
    });
  });
  describe("When I am on Bills page and I click on the iconEye of one of the bills", () => {
    test("Then, the open modal handler should be run", () => {
      document.body.innerHTML = BillsUI({ data: billsSample });
      const bills = new Bills({
        document,
        mockOnNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      bills.handleClickIconEye = jest.fn();
      document.querySelector(`div[data-testid="icon-eye"]`).click();
      expect(bills.handleClickIconEye).toBeCalled();
    });
  });
  describe("When I am on Bills page and I click on the submit a new bill button", () => {
    test("Then, the router should be called to go to the newBill page", () => {
      document.body.innerHTML = BillsUI({ data: billsSample, error: false, loading: false });
      const bills = new Bills({
        document,
        mockOnNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      bills.onNavigate = jest.fn();
      bills.handleClickNewBill();
      expect(bills.onNavigate).toHaveBeenCalledWith("#employee/bill/new");
    });
  });
  describe("When I am on Bills page and I open the modal", () => {
    test("Then, the modal should open with the image of the bill attached file inside", () => {
      document.body.innerHTML = BillsUI({ data: billsSample, error: false, loading: false });
      const bills = new Bills({
        document,
        mockOnNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn(); //modal is a Bootstrap function, not reachable here
      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
      bills.handleClickIconEye(iconEye);
      expect($.fn.modal).toHaveBeenCalled();
      expect(document.querySelector(".modal-body img").getAttribute("src")).toEqual(iconEye.getAttribute("data-bill-url"));
    });
  });
});

// Integration tests
describe("Given I am a user connected as Employee", () => {
  describe("When I land on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(mockFirebase, "get");
      document.body.innerHTML = `<div id='root'></div>`;
      router();
      await flushPromises(); // router() : getBills().then() promise
      expect(getSpy).toHaveBeenCalled();
      const numberOfLines = document.querySelectorAll("tbody[data-testid='tbody'] tr").length;
      expect(numberOfLines).toEqual(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      jest.spyOn(mockFirebase, "get").mockRejectedValueOnce(Error("Erreur 404"));
      document.body.innerHTML = `<div id='root'></div>`;
      router();
      await flushPromises(); // router() : getBills().then() promise
      expect(screen.getByText(/Erreur 404/)).toBeTruthy();
    });
    test("fetches bills from an API and fails with 500 message error", async () => {
      jest.spyOn(mockFirebase, "get").mockRejectedValueOnce(Error("Erreur 500"));
      document.body.innerHTML = `<div id='root'></div>`;
      router();
      await flushPromises(); // router() : getBills().then() promise
      expect(screen.getByText(/Erreur 500/)).toBeTruthy();
    });
  });
});
