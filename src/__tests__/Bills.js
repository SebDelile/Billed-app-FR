import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {formatDate, formatStatus, formatDateReverse} from "../app/format.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      bills.forEach(bill => {
          bill.date = formatDate(bill.date),
          bill.status = formatStatus(bill.status)
      })
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = Array.from(document.body.querySelectorAll("#data-table tbody>tr>td:nth-child(3)")).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((formatDateReverse(a) < formatDateReverse(b)) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})