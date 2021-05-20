import firebaseMock from "./firebase.js"

export default {
  bills: function(){
    return firebaseMock
  },
  storage: {
    ref: function(){
      this.isCalled = true // to spy the call of the firestore
      return this
    },
    put: async () => Promise.resolve({ref: {getDownloadURL: () => "fakepath.from.firebase"}})
  }
}