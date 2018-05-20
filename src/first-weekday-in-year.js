// https://stackoverflow.com/a/478992/4099022
function getFirstWeekdayInYear(year){
    const y = year - 1;
    return (year * 365 +
        Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)
    ) % 7;
}

module.exports = getFirstWeekdayInYear;
