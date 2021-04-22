export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}

const frenchMonths = []
for (let i=0; i<12; i++) {
  frenchMonths.push(new Intl.DateTimeFormat('fr', { month: 'short' }).format(new Date(2000, i)))
}

export const formatDateReverse = (formatedDate) => {
  //formatedDate to come from formatDate function : 2018-09-25 => '25 Sept. 18'
  let [day, month, year] = formatedDate.split(" ")
  day = parseInt(day)
  month = frenchMonths.findIndex(element => element === month.toLowerCase())
  year = parseInt(year) < 70 ? 2000 + parseInt(year) : 1900 + parseInt(year)
  return new Date(year, month, day)
}
