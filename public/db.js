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
