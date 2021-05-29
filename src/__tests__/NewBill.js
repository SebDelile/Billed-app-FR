import { fireEvent, screen } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firestoreMock from "../__mocks__/firestore.js"
import firestore from "../app/Firestore.js"
import router from "../app/Router.js"
import firebaseMock from "../__mocks__/firebase";


//setup for tests
const flushPromises = async () => new Promise(setImmediate); // wait for promises to be resolved before continue the code

class InitiateNewBill {
  constructor() {
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
    const html = NewBillUI();
    document.body.innerHTML = html;
    this.object = new NewBill({
      document,
      onNavigate,
      firestore: firestoreMock,
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
    if (file !== "") {
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      Object.defineProperty(inputFile, "value", {value: "fakepath/sample.png"})
      fireEvent.change(inputFile, {
        target: {
          files: [file],
        },
      });
    }
  }
}

class InitiateRouterToNewBill {
  constructor(){
    document.body.innerHTML = `<div id='root'></div>`;
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/",
        hash: "#employee/bill/new",
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
    router()
  }
}


//end of setup

describe("Given I am connected as an employee", () => {
  describe("When I access NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then a form with nine fields should be rendered", () => {
      document.body.innerHTML = NewBillUI();
      const form = document.querySelector("form");
      expect(form.length).toEqual(9);
    });
  });
  describe("When I am on NewBill Page and I add an image attached file", () => {
    test("Then the file handler should be run", () => {
      const initiateNewBill = new InitiateNewBill();
      initiateNewBill.object.handleChangeFile = jest.fn()
      fireEvent.change(document.querySelector(`input[data-testid="file"]`));
      expect(initiateNewBill.object.handleChangeFile).toBeCalled();
    });
  });
  describe("When I am on NewBill Page and I click on submit button", () => {
    test("Then the submit handler should be run", () => {
      const initiateNewBill = new InitiateNewBill();
      initiateNewBill.object.handleSubmit = jest.fn()
      fireEvent.submit(document.getElementById('btn-send-bill'));
      expect(initiateNewBill.object.handleSubmit).toBeCalled();
    });
  });


  describe("When I am on NewBill Page and I add an image attached file", () => {
    test("Then the image should be accepted by the app ", () => {
      new InitiateNewBill();
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      Object.defineProperty(inputFile, "value", {value: "fakepath/sample.png"})
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["sample"], "sample.png", { type: "image/png" })],
        },
      });
      const numberOfFile = document.querySelector(`input[data-testid="file"]`).files.length
      expect(numberOfFile).toEqual(1);
    });
  });
  describe("When I am on NewBill Page and I add a non-image attached file", () => {
    test("Then the image should be rejected by the app ", async () => {
      const initiateNewBill = new InitiateNewBill();
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      Object.defineProperty(inputFile, "value", {value: "fakepath/sample.txt"})
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["sample"], "sample.txt", { type: "text/plain" })],
        },
      });
      const numberOfFile = document.querySelector(`input[data-testid="file"]`).files.length
      expect(numberOfFile).toEqual(0)
      expect(initiateNewBill.object.fileName).toEqual("")
    });
  });
  describe("When I am on NewBill Page and I fill the form correctly and submit", () => {
    test("Then the form should be sent with filled data", async () => {
      const newBill = new InitiateNewBill();
      new FillTheForm()
      await flushPromises() // handleChangeFile promise
      let sentBill = {} 
      newBill.object.createBill = jest.fn(function(bill) {
          Object.keys(bill).forEach((key) => sentBill[key] = bill[key])
      })
      let e = new Event("submit")
      Object.defineProperty(e, 'target', {value: document.querySelector('form')})
      newBill.object.handleSubmit(e)
      expect(newBill.object.createBill).toHaveBeenCalled();
      expect(sentBill.email).toEqual("a@a")
      expect(sentBill.type).toEqual("Restaurants et bars")
      expect(sentBill.name).toEqual("Pot")
      expect(sentBill.amount).toEqual(100)
      expect(sentBill.date).toEqual("2021-05-01")
      expect(sentBill.vat).toEqual("20")
      expect(sentBill.pct).toEqual(20)
      expect(sentBill.commentary).toEqual("YOLO")
      expect(sentBill.fileUrl).toEqual("fakepath.from.firebase")
      expect(sentBill.fileName).toEqual("fakepath/sample.png")
      expect(sentBill.status).toEqual("pending")
    });
  }); 
  describe("When I am on NewBill Page and I uncorrectly fill the form and submit (missing value for expense type)", () => {
    test("Then the form should not be sent and the field expense type should be focussed", () => {
      const newBill = new InitiateNewBill();
      new FillTheForm({type: ""})
      window.alert = jest.fn()
      newBill.object.createBill = jest.fn()
      let e = new Event("submit")
      Object.defineProperty(e, 'target', {value: document.querySelector('form')})
      newBill.object.handleSubmit(e)
      expect.assertions(3);
      expect(newBill.object.createBill).not.toBeCalled()
      expect(window.alert).toBeCalled()
      expect(document.activeElement).toEqual(document.querySelector(`select[data-testid="expense-type"]`))
    })
  })
  describe("When I am on NewBill Page and I uncorrectly fill the form and submit (missing value for date)", () => {
    test("Then the form should not be sent and the field date should be focussed", () => {
      const newBill = new InitiateNewBill();
      new FillTheForm({date: ""})
      window.alert = jest.fn()
      newBill.object.createBill = jest.fn()
      let e = new Event("submit")
      Object.defineProperty(e, 'target', {value: document.querySelector('form')})
      newBill.object.handleSubmit(e)
      expect.assertions(3);
      expect(newBill.object.createBill).not.toBeCalled()
      expect(window.alert).toBeCalled()
      expect(document.activeElement).toEqual(document.querySelector(`input[data-testid="datepicker"]`))
    })
  })
  describe("When I am on NewBill Page and I uncorrectly fill the form and submit (missing value for amount)", () => {
    test("Then the form should not be sent and the field amount should be focussed", () => {
      const newBill = new InitiateNewBill();
      new FillTheForm({amount: ""})
      window.alert = jest.fn()
      newBill.object.createBill = jest.fn()
      let e = new Event("submit")
      Object.defineProperty(e, 'target', {value: document.querySelector('form')})
      newBill.object.handleSubmit(e)
      expect.assertions(3);
      expect(newBill.object.createBill).not.toBeCalled()
      expect(window.alert).toBeCalled()
      expect(document.activeElement).toEqual(document.querySelector(`input[data-testid="amount"]`))
    })
  })
  describe("When I am on NewBill Page and I uncorrectly fill the form and submit (missing value for VAT)", () => {
    test("Then the form should not be sent and the field VAT should be focussed", () => {
      const newBill = new InitiateNewBill();
      new FillTheForm({vat: ""})
      window.alert = jest.fn()
      newBill.object.createBill = jest.fn()
      let e = new Event("submit")
      Object.defineProperty(e, 'target', {value: document.querySelector('form')})
      newBill.object.handleSubmit(e)
      expect.assertions(3);
      expect(newBill.object.createBill).not.toBeCalled()
      expect(window.alert).toBeCalled()
      expect(document.activeElement).toEqual(document.querySelector(`input[data-testid="vat"]`))
    })
  })
  describe("When I am on NewBill Page and I uncorrectly fill the form and submit (missing file)", () => {
    test("Then the form should not be sent and the field file should be focussed", () => {
      const newBill = new InitiateNewBill();
      new FillTheForm({file: ""})
      window.alert = jest.fn()
      newBill.object.createBill = jest.fn()
      let e = new Event("submit")
      Object.defineProperty(e, 'target', {value: document.querySelector('form')})
      newBill.object.handleSubmit(e)
      expect.assertions(3);
      expect(newBill.object.createBill).not.toBeCalled()
      expect(window.alert).toBeCalled()
      expect(document.activeElement).toEqual(document.querySelector(`input[data-testid="file"]`))
    })
  })
  describe("When I am on NewBill Page and I fill the form whithout pct and submit", () => {
    test("Then the form should be sent with 20 as default value for pct field", () => {
      const newBill = new InitiateNewBill();
      new FillTheForm({pct: ""})
      let sentPctValue 
      newBill.object.createBill = jest.fn(function(bill) {
          sentPctValue = bill.pct
      })
      let e = new Event("submit")
      Object.defineProperty(e, 'target', {value: document.querySelector('form')})
      newBill.object.handleSubmit(e)
      expect.assertions(2);
      expect(newBill.object.createBill).toBeCalled()
      expect(sentPctValue).toEqual(20)
    });
  }); 


  //PUT and POST integration tests
  
  describe("When I am on NewBill Page and I choose a file", () => {
    test("Then the file is posted to the firebase", async () => {
      firestore.storage.ref = jest.fn(() => firestore.storage)
      firestore.storage.put = jest.fn(async () => Promise.resolve({
        ref: {
          getDownloadURL: () => "fakepath.from.firebase"
        }
      }))
      new InitiateRouterToNewBill()
      const file = new File(["sample"], "sample.png", { type: "image/png" })
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      Object.defineProperty(inputFile, "value", {value: "fakepath/sample.png"})
      fireEvent.change(inputFile, {
        target: {
          files: [file],
        },
      });
      await flushPromises() // handleChangeFile promise
      expect(firestore.storage.put).toHaveBeenCalledWith(file);
    })
  })

  describe("When I am on NewBill Page and I choose a file but here is a server error", () => {
    test("Then the file is not posted", async () => {
      firestore.storage.ref = jest.fn(() => firestore.storage)
      firestore.storage.put = jest.fn(async () => Promise.reject(Error("Any error")))
      const file = new File(["sample"], "sample.png", { type: "image/png" })
      const inputFile = document.querySelector(`input[data-testid="file"]`);
      Object.defineProperty(inputFile, "value", {value: "fakepath/sample.png"})
      fireEvent.change(inputFile, {
        target: {
          files: [file],
        },
      });
      await flushPromises() // handleChangeFile promise
      expect(document.querySelector(`input[data-testid="file"]`).files.length).toEqual(0)
      expect(document.querySelector(`input[data-testid="file"]`).value).toEqual("")
    })
  })
  describe("When I am on NewBill Page and I correctly fill the form and submit", () => {
    test("Then the filled data should be sent to firebase and the app navigate to Bills page", async () => {
      firestore.storage.ref = jest.fn(() => firestore.storage)
      firestore.storage.put = jest.fn(async (file) => Promise.resolve({
        ref: {
          getDownloadURL: () => "fakepath.from.firebase"
        }
      }))
      firestore.bills = jest.fn(function () {
        return firebaseMock;
      });
      const postSpy = jest.spyOn(firebaseMock, "add")
      new FillTheForm()
      await flushPromises() // handleChangeFile promises
      let sentData = {
        email: JSON.parse(window.localStorage.getItem("user")).email,
        type: document.querySelector(`select[data-testid="expense-type"]`).value,
        name: document.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(document.querySelector(`input[data-testid="amount"]`).value),
        date: document.querySelector(`input[data-testid="datepicker"]`).value,
        vat: document.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(document.querySelector(`input[data-testid="pct"]`).value),
        commentary: document.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: "fakepath.from.firebase",
        fileName: "fakepath/sample.png",
        status: "pending",
      }
      userEvent.click(document.getElementById('btn-send-bill'))
      await flushPromises() //handleSubmit promises
      expect(postSpy).toHaveBeenCalledWith(sentData);
      expect(screen.getByText(/Mes notes de frais/)).toBeTruthy()
    })
  })
  describe("When I am on NewBill Page and I correctly fill the form and submit but there is server error", () => {
    test("Then the filled data should be sent to firebase but the form is not accepted and it stays on NewBill Page", async () => {
      window.alert = jest.fn()
      firestore.storage.ref = jest.fn(() => firestore.storage)
      firestore.storage.put = jest.fn(async (file) => Promise.resolve({
        ref: {
          getDownloadURL: () => "fakepath.from.firebase"
        }
      }))
      firestore.bills = jest.fn(function () {
        return firebaseMock;
      });
      firebaseMock.add = jest.fn(() => Promise.reject(Error("Error (any)")));
      new InitiateRouterToNewBill()
      new FillTheForm()
      await flushPromises() // handleChangeFile promises
      userEvent.click(document.getElementById('btn-send-bill'))
      await flushPromises() //handleSubmit promises
      expect(window.alert).toBeCalled()
      expect(screen.getByText(/Envoyer une note de frais/)).toBeTruthy()
    })
  })
});
