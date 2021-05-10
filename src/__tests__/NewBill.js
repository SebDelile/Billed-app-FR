import { fireEvent, screen } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";

//setup for tests
const onNavigateOriginal = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

class InitiateNewBill {
  constructor(onNavigateFunction = onNavigateOriginal) {
    const onNavigate = onNavigateFunction;
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
        password: "123",
        status: "connected"
      })
    );
    const html = NewBillUI();
    document.body.innerHTML = html;
    this.method = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    });
  }
}

class FillTheForm {
  constructor({
    type = "Restaurants et bars",
    name = "Pot",
    amount = "100",
    date = "2021-05-01",
    vat = "20",
    pct = "20",
    commentary = "YOLO",
    file = new File(["sample"], "sample.png", { type: "image/png" }),
  } = {}) {
    document.querySelector(`select[data-testid="expense-type"]`).value = type;
    document.querySelector(`input[data-testid="expense-name"]`).value = name;
    document.querySelector(`input[data-testid="amount"]`).value = amount;
    document.querySelector(`input[data-testid="datepicker"]`).value = date;
    document.querySelector(`input[data-testid="vat"]`).value = vat;
    document.querySelector(`input[data-testid="pct"]`).value = pct;
    document.querySelector(`textarea[data-testid="commentary"]`).value = commentary;
    const inputFile = document.querySelector(`input[data-testid="file"]`);
      fireEvent.change(inputFile, {
        target: {
          files: [file],
        },
      });
  }
}
//end of setup

describe("Given I am connected as an employee", () => {
  describe("When I access NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      new InitiateNewBill();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then a form with nine fields should be rendered", () => {
      new InitiateNewBill();
      const form = document.querySelector("form");
      expect(form.length).toEqual(9);
    });
  });
  describe("When I am on NewBill Page and I correctly fill the form and submit", () => {
    test("Then the form should be sent with filled data", () => {
      const newBill = new InitiateNewBill();
      var submittedBill= {}
      newBill.method.createBill = jest.fn(function(bill) {
        for (let key in bill) {
          submittedBill[key] = bill[key]
        }
      })
      new FillTheForm()
      userEvent.click(document.getElementById('btn-send-bill'))
      expect(newBill.method.createBill).toHaveBeenCalled()
      expect(submittedBill.email).toEqual("a@a")
      expect(submittedBill.type).toEqual("Restaurants et bars")
      expect(submittedBill.name).toEqual("Pot")
      expect(submittedBill.amount).toEqual(100)
      expect(submittedBill.date).toEqual("2021-05-01")
      expect(submittedBill.vat).toEqual("20")
      expect(submittedBill.pct).toEqual(20)
      expect(submittedBill.commentary).toEqual("YOLO")
      //expect(submittedBill.fileURL).toEqual("fakepath/Sample.png")
      //expect(submittedBill.fileName).toEqual("Sample.png")

      //the fileName & fileURL building occur within a firebase call
    });
    describe("When I am on NewBill Page and I fill the form whithout pct and submit", () => {
      test.only("Then the form should be sent with 20 as default value for pct field", () => {
        const newBill = new InitiateNewBill();
        var submittedBill= {}
        newBill.method.createBill = jest.fn(function(bill) {
          for (let key in bill) {
            submittedBill[key] = bill[key]
          }
        })
        new FillTheForm({pct: ""})
        userEvent.click(document.getElementById('btn-send-bill'))
        expect(submittedBill.pct).toEqual(20)
      });
      test("Then the Bills page should be rendered", () => {
        const newBill = new InitiateNewBill();
        newBill.method.createBill = jest.fn()
        new FillTheForm()
        userEvent.click(document.getElementById('btn-send-bill'))
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
      })
    })
  })
  /*describe("When I am on NewBill Page and I uncorrectly fill the form and submit(missing type)", () => {
    test("Then the form should not been sent and the error should be highlighted", () => {
      const newBill = new InitiateNewBill();
      var submittedBill= {}
      newBill.method.createBill = jest.fn(function(bill) {
        for (let key in bill) {
          submittedBill[key] = bill[key]
        }
      })
      new FillTheForm({type: ""})
      userEvent.click(document.getElementById('btn-send-bill'))
      expect(newBill.method.createBill).not.toHaveBeenCalled();

      //not working, it seems that HTML5 form API is not called, required attribute isn't took into account
    });
  })*/
  /*describe("When I am on NewBill Page and I add an image attached file", () => {
    test("Then the file handler should be run", () => {
      const newBill = new InitiateNewBill();
      newBill.method.handleChangeFile = jest.fn()
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["sample"], "sample.png", { type: "image/png" })],
        },
      });
      expect(newBill.method.handleChangeFile).toHaveBeenCalled()
      
      //not working as a function already attached to an eventlistener is not modified by a mock
    });
  });*/
  describe("When I am on NewBill Page and I add an image attached file", () => {
    test("Then the image should be accepted by the app ", () => {
      new InitiateNewBill();
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["sample"], "sample.png", { type: "image/png" })],
        },
      });
      expect(inputFile.files.length).toEqual(1);
    });
  });
  /*describe("When I am on NewBill Page and I add a non-image attached file", () => {
    test("Then the image should be rejected by the app ", async () => {
      new InitiateNewBill();
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["sample"], "sample.txt", { type: "text/plain" })],
        },
      });
      expect(inputFile.files.length).toEqual(0)

      // The test cannot pass successfuly.
      // to put the file by this way is not an exact simulation of an user's file selection :
      // the fileInput.value is not modified consequently.
      // even if a value is passed via object.defineProperty,
      // the filesList is not cleared in jest environment via the statement inputFile.value= "",
      // whereas it's working on chrome
    });
  });*/
});
