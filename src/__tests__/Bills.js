import { screen } from "@testing-library/dom"
import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {formatDate, formatStatus, formatDateReverse} from "../app/format.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression

      // les lignes de code qui activent l'icone sont dans le router :
        //modifier le code pour déplacer ces lignes dans Bills ou BillsUI ?
        //ou invoquer le router ici pour tester cette commande ? <===
        //ou déplacer ce test dans le fichier test du router
    })
  })

  describe("When I am on Bills Page and there are bills", () => {
    test("Then bills date format should be like day as 1 or 2 digits, month as abbreviated month in French, year as two digits", () => {
      const date = formatDate(bills[0].date)
      expect(date).toBe("4 Avr. 04")
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = Array.from(document.body.querySelectorAll("#data-table tbody>tr>td:nth-child(3)")).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((formatDateReverse(a) < formatDateReverse(b)) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then bills status format should be 'En attente', 'Accepté' and 'Refusé", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const tableBody = screen.queryByTestId('tbody').innerHTML
      expect(tableBody).toMatch(/En attente/)
      expect(tableBody).toMatch(/Accepté/)
      expect(tableBody).toMatch(/Refusé/)
    })
  })
  describe("When I am on Bills Page and there are no bill", () => {
    test("Then bills should render an empty table", () => {
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      const tbody = screen.queryByTestId('tbody')
      expect(tbody.innerHTML).toBe("")
    })
  })
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  
  describe('When I am on Bills page and I click on the submit a new bill button', () => {
    test('Then, the router should be called to go to thte newbill page', () => {
      const onNavigate = jest.fn()
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'User'
      }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })  
      document.querySelector(`button[data-testid="btn-new-bill"]`).click()
      expect(onNavigate).toBeCalled()
    })
    test('Then, the newBill page should be rendered', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'User'
      }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })  
      document.querySelector(`button[data-testid="btn-new-bill"]`).click()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
  describe('When I am on Bills page and I click on the iconEye of one of the bills', () => {
    test.only('Then, the modal should open with the image of the bill attached file inside', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'User'
      }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })  
      const iconEyes = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      const modal = document.getElementById('modaleFile')
      const urlEnd = iconEyes[0].getAttribute("data-bill-url").slice(-10)
      iconEyes[0].click()
      expect(modal.classList.contains("show")).toBeTruthy() // not working yet
      expect(modal.innerHTML).toMatch(new RegExp(urlEnd)) // not working yet
    })
  })
})