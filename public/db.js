let db;
let transactionVersion;

const request = indexedDB.open("TransactionDB", transactionVersion || 1);

request.onupgradeneeded = function (e) {
  console.log("Upgrade needed in IndexDB");

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("TransactionStore", { autoIncrement: true });
  }
};
request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log("check db invoked");

  let transaction = db.transaction(["TransactionStore"], "readwrite");

  const store = transaction.objectStore("TransactionStore");

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            transaction = db.transaction(["TransactionStore"], "readwrite");

            const currentStore = transaction.objectStore("TransactionStore");

            currentStore.clear();
            console.log("Clearing store 🧹");
          }
        });
    }
  };
}
