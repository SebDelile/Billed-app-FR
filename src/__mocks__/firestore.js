import firebaseMock from "./firebase.js";

export default {
  bills: function () {
    return firebaseMock;
  },
  storage: {
    ref: function () {
      return this;
    },
    put: async () =>
      Promise.resolve({
        ref: {
          getDownloadURL: () => "fakepath.from.firebase",
        },
      }),
  },
};
