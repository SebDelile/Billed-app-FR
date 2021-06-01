// /** @module app/Firestore */

class Firestore {
  /**
   * Class Firestore - provide the methods to call the firebase
   * @class Firestore
   */
  constructor() {
    /**
     * handle the call to firestore
     * @function firestore
     * @memberof Firestore
     */
    this.store = window.firebase ? window.firebase.firestore() : () => null;
    /**
     * handle the call to storage
     * @function storage
     * @memberof Firestore
     */
    this.storage = window.firebase ? window.firebase.storage() : () => null;
  }
   /**
   * request one user to the store
   * @function user
   * @memberof Firestore
   * @return {object} - User's document
   */
  user = (uid) => this.store.doc(`users/${uid}`);
  /**
   * request all users to the store
   * @function users
   * @memberof Firestore
   * @param {string} uid - the user's ID in the firebase
   * @return {array} - list of the user's documents
   */
  users = () => this.store.collection("users");

/**
   * read a pathlocation in the store, create it if not found
   * @function ref
   * @memberof Firestore
   * @param {string} path - the path in the firestore
   * @return {object} location ini the firestore
   */
  ref = (path) => this.store.doc(path);

  /**
   * request one bill to the store
   * @function bill
   * @memberof Firestore
   * @param {string} bid - the bill's ID
   * @return {object} Bill's document
   */
  bill = (bid) => this.store.doc(`bills/${bid}`);
  /**
   * request all the bills to the store
   * @function bills
   * @memberof Firestore
   * @return {array} list of the bill's documents
   */
  bills = () => this.store.collection("bills");
}
export default new Firestore();
