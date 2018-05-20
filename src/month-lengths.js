const isLeapYear = require("./leap-year");

const monthLengths = {
    common: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    leap: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    forYear: function(year){
        return isLeapYear(year) ? monthLengths.leap : monthLengths.common;
    },
};

module.exports = monthLengths;
