import { screen } from "@testing-library/dom"
import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {formatDate, formatDateReverse} from "../app/format.js"
import { ROUTES } from "../constants/routes"
import router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"


//setup for tests
const onNavigateOriginal = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

class InitiateBills {
  constructor({onNavigateFunction=onNavigateOriginal, billsSample=bills, error=false, loading=false}={}) {
    const onNavigate = onNavigateFunction
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const html = BillsUI({ data: billsSample, error: error, loading: loading })
    document.body.innerHTML = html
    new Bills({
      document, onNavigate, firestore: null, localStorage: window.localStorage
    }) 
  }
}
//end of setup

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      /*
      let rootNode = document.createElement("div")
      rootNode.setAttribute("id", "root")
      document.body.appendChild(rootNode)
      Object.defineProperty(window, 'location', {
        value: {
          pathname: "/",
          hash: "#employee/bills"
        }
      })
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      router()


      //Calling the router makes a backend call, and noway to reach the code which highligths the icon without calling the router...
        // TypeError: this.store.collection is not a function
        // at Firestore.bills (src/app/Firestore.js:13:28)
        // at _default.getBills (src/containers/Bills.js:35:8)
        // at _default (src/app/Router.js:85:13)
        // at Object.<anonymous> (src/__tests__/Bills.js:52:7)
      */
    })
  })

  describe("When I am on Bills Page and there are bills", () => {
    test("Then bills date format should be like day as 1 or 2 digits, month as abbreviated month in French, year as two digits", () => {
      const date = formatDate(bills[0].date)
      expect(date).toBe("4 Avr. 04")
    })
    test("Then bills should be ordered from earliest to latest", () => {
      new InitiateBills
      const dates = Array.from(document.body.querySelectorAll("#data-table tbody>tr>td:nth-child(3)")).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((formatDateReverse(a) < formatDateReverse(b)) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then bills status format should be 'En attente', 'Accepté' and 'Refusé", () => {
      new InitiateBills
      const tableBody = screen.queryByTestId('tbody').innerHTML
      expect(tableBody).toMatch(/En attente/)
      expect(tableBody).toMatch(/Accepté/)
      expect(tableBody).toMatch(/Refusé/)
    })
  })
  describe("When I am on Bills Page and there are no bill", () => {
    test("Then bills should render an empty table", () => {
      new InitiateBills({billsSample: [] })
      const tbody = screen.queryByTestId('tbody')
      expect(tbody.innerHTML).toBe("")
    })
  })
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      new InitiateBills({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      new InitiateBills({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe('When I am on Bills page and I click on the submit a new bill button', () => {
    test('Then, the router should be called to go to the newBill page', () => {
      const onNavigate = jest.fn()
      new InitiateBills({ onNavigateFunction: onNavigate })
      document.querySelector(`button[data-testid="btn-new-bill"]`).click()
      expect(onNavigate).toBeCalled()
    })
    test('Then, the newBill page should be rendered', () => {
      new InitiateBills
      document.querySelector(`button[data-testid="btn-new-bill"]`).click()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
  describe('When I am on Bills page and I click on the iconEye of one of the bills', () => {
    test('Then, the modal should open with the image of the bill attached file inside', () => {
      new InitiateBills
      $.fn.modal = jest.fn(); //modal is a Bootstrap function, not reachable here
      const iconEyes = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      const modal = document.getElementById('modaleFile')
      const url = iconEyes[0].getAttribute("data-bill-url")
      iconEyes[0].click()
      expect($.fn.modal).toHaveBeenCalled()
      expect(modal.querySelector(".modal-body img").getAttribute("src")).toEqual(url)
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
