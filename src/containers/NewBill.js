// /** @module containers/Newbill */
import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  /**
   * Class Newbill - Manages the bill submission feature (employee pathway)
   * @class NewBill
   * @param {Object} document - the document (HTML page)
   * @param {function} onNavigate - the function which is called to navigate to another page
   * @param {object} firestore - instance of the firestore class
   * @param {object} localStorage - windows.localStorage, used to store user's login info
   */
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", (e) => this.handleSubmit(e));
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", (e) => this.handleChangeFile(e));
    this.fileUrl = null;
    this.fileName = null;
    new Logout({ document, localStorage, onNavigate });
  }
  /**
   * handle the submission of a file as attached file,
   * exctract filename and file extension from input.value
   * check if the extension is fits the requirement
   * if yes, send the file to firebase
   *   get the url of the file
   *   store it as a property
   * else, empty the input to decline the file submission
   * @function
   * @memberof NewBill
   */
  handleChangeFile = async (e) => {
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const extension = fileName.split(".")[fileName.split(".").length - 1];
    if (["png", "jpeg", "jpg"].includes(extension)) {
      this.firestore.storage
        .ref(`justificatifs/${fileName}`)
        .put(file)
        .then((snapshot) => snapshot.ref.getDownloadURL())
        .then((url) => {
          this.fileUrl = url;
          this.fileName = fileName;
        })
        .catch(() => this.inputFileReset());
    } else {
      this.inputFileReset();
    }
  };

  /**
   * reset the input[type=file]
   * launch in case the extension o not match the requierement or in case of failure to upload the file
   * first try is a soft method
   * in case the navigator does not support the soft, do a hard reset
   * the hard reset is the replacement of the input with a new one with the same attributes and event listeners
   * @function
   * @memberof NewBill
   */
  inputFileReset = () => {
    this.fileUrl = "";
    this.fileName = "";
    const inputFile = document.querySelector(`input[data-testid="file"]`);
    try {
      // clear the list in most of the cases
      inputFile.value = "";
    } catch {
      // in some cases, it throw an error due to security issues on input[type=file]
      // so it needs a hard reset of inputFile
      let newInputFile = document.createElement("input");
      newInputFile.setAttribute("required", true);
      newInputFile.setAttribute("type", "file");
      newInputFile.setAttribute("data-testid", "file");
      newInputFile.setAttribute("accept", "image/png, image/jpeg");
      newInputFile.classList.add("form-control", "blue-border");
      inputFile.replaceWith(newInputFile);
      newInputFile.addEventListener("change", (e) => this.handleChangeFile(e));
    }
  };

  /**
   * handle the submission of the form,
   * check for all the required fields are actually filled
   * if not, focus the first one and cancel submission
   * build an object with all the information of the form
   * send this object to firebase
   * navigate to Bills page
   * @function
   * @memberof NewBill
   * @param {event} e - the form submission event
   */
  handleSubmit = (e) => {
    e.preventDefault();
    // Force the user to actually fill the requiered fields in case "requiered" attribute is disabled.
    const requieredFields = [`select[data-testid="expense-type"]`, `input[data-testid="datepicker"]`, `input[data-testid="amount"]`, `input[data-testid="vat"]`, `input[data-testid="file"]`];
    for (let requieredField of e.target.querySelectorAll(requieredFields)) {
      if (requieredField.value === "") {
        alert("Veuillez compléter le champ indiqué s'il vous plait");
        requieredField.focus();
        return;
      }
    }
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.createBill(bill);
  };

  /**
   * ask the creation of the bill to the firebase,
   * then navigate to the Bills page
   * @function
   * @async
   * @memberof NewBill
   * @param {object} bill - the submitted bill
   */
  // not need to cover this function by tests
  createBill(bill) {
    if (this.firestore) {
      this.firestore
        .bills()
        .add(bill)
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => {
          window.alert("Une erreur est survenue : " + error)
        });
    }
  }
}
