import { bills } from "../fixtures/bills.js"
import {formatDate, formatStatus} from "../app/format.js"

describe("Given I am connected as an employee or Admin", () => {
  describe("When I am on Bills Page or Dashboard and there are bills", () => {
    test("Then bills date format should be like day as 1 or 2 digits, month as abbreviated month in French, year as two digits", () => {
      const date = formatDate(bills[0].date)
      expect(date).toBe("4 Avr. 04")
    })
    test("Then bills status format should be 'En attente', 'Accepté' and 'Refusé", () => {
      const pendingBill = formatStatus(bills[0].status)
      const refusedBill = formatStatus(bills[1].status)
      const acceptedBill = formatStatus(bills[2].status)
      expect(pendingBill).toMatch(/En attente/)
      expect(refusedBill).toMatch(/Refusé/)
      expect(acceptedBill).toMatch(/Accepté/)
    })
  })
})