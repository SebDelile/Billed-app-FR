import { screen } from "@testing-library/dom"
import VerticalLayout from "../views/VerticalLayout"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { mockBills } from "../fixtures/bills.js"
import router from "../app/Router.js"
jest.mock("../containers/Bills.js", () => {
  return jest.fn().mockImplementation(function() {
    return {getBills: async function() {return mockBills}};
  });
});


//setup
class InitiateNavigation {
  constructor({hashPathname}={}) {
    let rootNode = document.createElement("div")
    rootNode.setAttribute("id", "root")
    document.body.appendChild(rootNode)
    Object.defineProperty(window, 'location', {
      value: {
        pathname: "/",
        hash: ""
      }
    })
    window.location.hash = hashPathname
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    router()
  }
}
//end of setup

describe('Given I am connected as Employee', () => {
  describe("When I am on Bills Page", () => {
    test("Then Icons should be rendered", async () => {
        new InitiateNavigation({hashPathname:"#employee/bills"})
        expect(screen.getByTestId('icon-window')).toBeTruthy()
        expect(screen.getByTestId('icon-mail')).toBeTruthy()
      
    })
  })
describe("When I am on Bills Page", () => {
  test("Then bill icon in vertical layout should be highlighted", () => {
    new InitiateNavigation({hashPathname:"#employee/bills"})
    expect(document.getElementById('layout-icon1').classList.contains('active-icon')).toBeTruthy()
    expect(document.getElementById('layout-icon2').classList.contains('active-icon')).not.toBeTruthy()
    })
  })

  describe("When I am on NewBill Page", () => {
    test("Then Icons should be rendered", () => {
      new InitiateNavigation({hashPathname:"#employee/bill/new"})
      expect(screen.getByTestId('icon-window')).toBeTruthy()
      expect(screen.getByTestId('icon-mail')).toBeTruthy()
    })
  })
  describe("When I am on NewBill Page", () => {
    test("Then Newbill icon in vertical layout should be highlighted", () => {
      new InitiateNavigation({hashPathname:"#employee/bill/new"})
      expect(document.getElementById('layout-icon1').classList.contains('active-icon')).not.toBeTruthy()
      expect(document.getElementById('layout-icon2').classList.contains('active-icon')).toBeTruthy()
    })
  })
})
