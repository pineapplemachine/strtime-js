const english = {
    eraNames: [
        "CE", "BCE"
    ],
    meridiemNames: [
        "AM", "PM"
    ],
    shortWeekdayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ],
    longWeekdayNames: [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ],
    shortMonthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    longMonthNames: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ],
    ordinalTransform: function(number){
        const digit = Math.floor(number % 10);
        if(number > 3 && number <= 20) return `${number}th`;
        if(digit === 1) return `${number}st`;
        else if(digit === 2) return `${number}nd`;
        else if(digit === 3) return `${number}rd`;
        else return `${number}th`;
    },
};

module.exports = english;
