import firebaseMock from "../../__mocks__/firebase.js";

class MockFirestore {
  constructor() {
    this.storage = {
      ref: function () {
        return this;
      },
      put: async () =>
        Promise.resolve({
          ref: {
            getDownloadURL: () => "fakepath.from.firebase",
          },
        }),
    };
  }
  bills = function () {
    return firebaseMock;
  };
}

export default new MockFirestore();
