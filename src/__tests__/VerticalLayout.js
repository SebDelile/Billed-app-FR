import { screen } from "@testing-library/dom";
import VerticalLayout from "../views/VerticalLayout";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
jest.mock("../containers/Bills.js", () => {
  return jest.fn().mockImplementation(function () {
    return {
      getBills: async function () {
        return [];
      },
    };
  });
});

//setup

Object.defineProperty(window, "localStorage", { value: localStorageMock });
window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee",
  })
);

Object.defineProperty(window, "location", {
  value: {
    pathname: "/",
    hash: "",
  },
});

//end of setup

describe("Given I am connected as Employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then Icons should be rendered", async () => {
      window.location.hash = "#employee/bills";
      document.body.innerHTML = `<div id='root'></div>`;
      router();
      expect(screen.getByTestId("icon-window")).toBeTruthy();
      expect(screen.getByTestId("icon-mail")).toBeTruthy();
    });
    test("Then bill icon in vertical layout should be highlighted", () => {
      window.location.hash = "#employee/bills";
      document.body.innerHTML = `<div id='root'></div>`;
      router();
      expect(document.getElementById("layout-icon1").classList.contains("active-icon")).toBeTruthy();
      expect(document.getElementById("layout-icon2").classList.contains("active-icon")).not.toBeTruthy();
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Then Icons should be rendered", () => {
      window.location.hash = "#employee/bill/new";
      document.body.innerHTML = `<div id='root'></div>`;
      router();
      expect(screen.getByTestId("icon-window")).toBeTruthy();
      expect(screen.getByTestId("icon-mail")).toBeTruthy();
    });
    test("Then Newbill icon in vertical layout should be highlighted", () => {
      window.location.hash = "#employee/bill/new";
      document.body.innerHTML = `<div id='root'></div>`;
      router();
      expect(document.getElementById("layout-icon1").classList.contains("active-icon")).not.toBeTruthy();
      expect(document.getElementById("layout-icon2").classList.contains("active-icon")).toBeTruthy();
    });
  });
});
