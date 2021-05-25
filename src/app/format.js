/** @module app/format */

/**
 * function formatDate - turn the date to french date specific format
 * for example : 2021-04-23 => 23 Avr. 21
 * @function formatDate
 * @param {string} dateStr - a date string that can be understand by Date constructor
 * @return {string} the corresponding formated date
 */
export const formatDate = (dateStr) => {
  if (Date.parse(dateStr) === NaN || dateStr === "") return "1 Jan. 01"; //TEMP FIX: there are invalid Dates in the DB and it makes the bill's page to crash
  const date = new Date(dateStr);
  const ye = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
  const mo = new Intl.DateTimeFormat("fr", { month: "short" }).format(date);
  const da = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
  const month = mo.charAt(0).toUpperCase() + mo.slice(1);
  return `${parseInt(da)} ${month.substr(0, 3)}. ${ye.toString().substr(2, 4)}`;
};

/**
 * function formatStatus - translate the status in french
 * @function formatStatus
 * @param {string} status - the status in the database
 * @return {string} the formated status
 */
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refusé";
  }
};

/**
 * const frenchMonths - the table of the 12 french formatted months
 * @const {array} frenchMonths
 */
const frenchMonths = [];
for (let i = 0; i < 12; i++) {
  frenchMonths.push(new Intl.DateTimeFormat("fr", { month: "short" }).format(new Date(2000, i)));
}

/**
 * function formatDateReverse - reverse the formatDate function to get a date from a formated date
 * for example : 23 Avr. 21 => 2021-04-23
 * @function formatDateReverse
 * @param {string} formatedDate - a date having been formatted by formatDate
 * @return {date} the corresponding date as date object
 */
export const formatDateReverse = (formatedDate) => {
  let [day, month, year] = formatedDate.split(" ");
  day = parseInt(day);
  month = frenchMonths.findIndex((element) => element === month.toLowerCase());
  year = parseInt(year) < 70 ? 2000 + parseInt(year) : 1900 + parseInt(year);
  return new Date(year, month, day);
};
