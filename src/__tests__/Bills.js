import { screen } from "@testing-library/dom"
import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {formatDate, formatDateReverse} from "../app/format.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebaseMock from "../__mocks__/firebase"
import firestoreMock from "../__mocks__/firestore.js"

//setup for tests
const onNavigateOriginal = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

class InitiateBills {
  constructor({onNavigateFunction=onNavigateOriginal, billsSample=bills, error=false, loading=false}={}) {
    const onNavigate = onNavigateFunction
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const html = BillsUI({ data: billsSample, error: error, loading: loading })
    document.body.innerHTML = html
    this.object = new Bills({
      document, onNavigate, firestore: firestoreMock, localStorage: window.localStorage
    }) 
  }
}
//end of setup

describe("Given I am connected as an employee", () => {
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
      const getSpy = jest.spyOn(firebaseMock, "get")
      const initiateBills = new InitiateBills({billsSample: []})
      const receivedBills = await initiateBills.object.getBills()
      expect(getSpy).toHaveBeenCalled()
      expect(receivedBills.length).toEqual(4)
   })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebaseMock.get.mockImplementationOnce(() =>
        Promise.reject(Error("Erreur 404"))
      )
      let html
      try {
        const response = await firebaseMock.get()
        html = BillsUI({data: response})
      }
      catch(e) {
        html = BillsUI({ error: e })
      }
      document.body.innerHTML = html
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebaseMock.get.mockImplementationOnce(() =>
        Promise.reject(Error("Erreur 500"))
      )
      const initiateBills = new InitiateBills({billsSample: []})
      const response = await initiateBills.object.getBills()
      if (response instanceof Error) {
        new InitiateBills({error: response})
      }
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
    /*test.only("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get = jest.fn(() =>
        {throw Error("Erreur 500")}
      )
      const initiateBills = new InitiateBills({billsSample: []})
      const response = await initiateBills.object.getBills()
      if (response instanceof Error) {
        new InitiateBills({error: response})
      }
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })*/
  })
})
