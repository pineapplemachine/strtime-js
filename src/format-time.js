// References:
// https://www.ibm.com/support/knowledgecenter/en/ssw_ibm_i_71/rtref/strpti.htm
// https://www.gnu.org/software/libc/manual/html_node/Formatting-Calendar-Time.html
// https://www.gnu.org/software/libc/manual/html_node/Low_002dLevel-Time-String-Parsing.html
// http://man7.org/linux/man-pages/man3/strptime.3.html
// https://apidock.com/ruby/DateTime/strftime
// http://strftime.org/

const defaultTimezoneNames = require("./timezone-names");
const Directive = require("./directives.js");
const TimestampParser = require("./parse.js");

function getFormatOptions(timezone, options){
    let useOptions;
    let tz = undefined;
    if(
        timezone === null || timezone === undefined ||
        Number.isFinite(timezone) || typeof(timezone) === "string"
    ){
        tz = timezone;
        useOptions = options || {};
    }else if(timezone && !options){
        useOptions = timezone;
        tz = useOptions.tz;
    }else{
        useOptions = {};
    }
    return {
        tz: tz,
        options: useOptions,
    };
}

function getDateTimeFormat(tz){
    return new Intl.DateTimeFormat("en-US", {
        hour12: false,
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function parseDateTimeFormatString(string){
    const month = +string.slice(0, 2);
    const day = +string.slice(3, 5);
    const year = +string.slice(6, string.length - 10);
    const hour = +string.slice(string.length - 8, string.length - 6);
    const minute = +string.slice(string.length - 5, string.length - 3);
    const second = +string.slice(string.length - 2, string.length);
    const utcDate = new Date();
    utcDate.setUTCFullYear(year);
    utcDate.setUTCMonth(month - 1);
    utcDate.setUTCDate(day);
    utcDate.setUTCHours(hour);
    utcDate.setUTCMinutes(minute);
    utcDate.setUTCSeconds(second);
    return utcDate;
}

function getTimezoneOffsetAtIANADate(tz, date){
    // Get the offset as though the input date was UTC
    const format = getDateTimeFormat(tz);
    const timestamp = format.format(date);
    const parsedDate = parseDateTimeFormatString(timestamp);
    parsedDate.setUTCMilliseconds(date.getUTCMilliseconds());
    const probableOffset = (parsedDate.getTime() - date.getTime()) / 60000;
    // If this offset is correct (and it *probably* is) then this is
    // the UTC date corresponding to the date input
    const probableDate = new Date(date);
    probableDate.setUTCMinutes(probableDate.getUTCMinutes() - probableOffset);
    // See whether reversing the operation gives the input date
    const checkTimestamp = format.format(probableDate);
    const checkedDate = parseDateTimeFormatString(checkTimestamp);
    checkedDate.setUTCMilliseconds(date.getUTCMilliseconds());
    // This offset will be 0 if probableOffset was correct, otherwise it
    // will be the number of minutes that the offset was off by.
    const checkOffset = (checkedDate.getTime() - date.getTime()) / 60000;
    return probableOffset + checkOffset;
}

function getTimezoneOffsetAtUTCDate(tz, date){
    const format = getDateTimeFormat(tz);
    const timestamp = format.format(date);
    const parsedDate = parseDateTimeFormatString(timestamp);
    parsedDate.setUTCMilliseconds(date.getUTCMilliseconds());
    const offset = parsedDate.getTime() - date.getTime();
    return offset / 60000; // millseconds => minutes
}

function getTimezoneOffsetMinutes(date, tz){
    if(tz === null || tz === undefined){
        return 0;
    }else if(tz >= -16 && tz <= +16){
        return Math.floor(60 * tz);
    }else if(Number.isFinite(tz)){
        return Math.floor(tz);
    }else if(tz === "local"){
        return -(date || new Date()).getTimezoneOffset();
    }else{
        const tzString = String(tz);
        if(tzString.startsWith("Etc/GMT")){
            const offset = +tzString.slice(7);
            if(Number.isInteger(offset)) return 60 * -offset;
        }else if(typeof(Intl) !== "undefined" && tzString.indexOf("/") >= 0){
            return {
                formatOffset: date => getTimezoneOffsetAtUTCDate(tz, date),
                parseOffset: date => getTimezoneOffsetAtIANADate(tz, date),
            };
        }else{
            const tzUpper = String(tz).toUpperCase();
            if(tzUpper in defaultTimezoneNames){
                const offset = Math.floor(60 * defaultTimezoneNames[tzUpper]);
                if(Number.isFinite(offset)) return offset;
            }
        }
    }
    throw new Error(`Unrecognized timezone option "${tz}".`);
}

function strftime(date, format, timezone, options){
    if(Number.isFinite(date)){
        // Accept unix timestamps (milliseconds since epoch)
        date = new Date(date);
    }else if(!date){
        throw new Error("No date input was provided.");
    }else if(typeof(date.toDate) === "function"){
        // Support date objects from https://www.npmjs.com/package/moment
        // Support date objects from https://www.npmjs.com/package/dayjs
        date = date.toDate();
    }else if(typeof(date.toJSDate) === "function"){
        // Support date objects from https://www.npmjs.com/package/luxon
        date = date.toJSDate();
    }
    if(!(date instanceof Date)){
        throw new Error("Failed to get Date instance from date input.");
    }
    if(!Number.isFinite(date.getTime())){
        throw new Error("Can't format an invalid date.");
    }
    const tokens = TimestampParser.parseFormatString(format);
    const useOptions = getFormatOptions(timezone, options);
    const timezoneOffsetMinutes = getTimezoneOffsetMinutes(date, useOptions.tz);
    const tzDate = new Date(date);
    if(Number.isFinite(timezoneOffsetMinutes)){
        tzDate.setUTCMinutes(
            date.getUTCMinutes() +
            timezoneOffsetMinutes
        );
    }
    let output = "";
    for(let token of tokens){
        if(token instanceof Directive){
            output += token.write(tzDate, "", useOptions.options, timezoneOffsetMinutes);
        }else if(token instanceof Directive.Token){
            output += token.write(tzDate, useOptions.options, timezoneOffsetMinutes);
        }else{
            output += token;
        }
    }
    return output;
}

function strptime(timestamp, format, timezone, options){
    const useOptions = getFormatOptions(timezone, options);
    const parser = new TimestampParser(timestamp, format);
    const timezoneOffsetMinutes = getTimezoneOffsetMinutes(undefined, useOptions.tz);
    if(timezoneOffsetMinutes !== undefined){
        parser.timezoneOffsetMinutes = timezoneOffsetMinutes;
    }
    if(useOptions.options){
        for(let key in useOptions.options){
            parser[key] = useOptions.options[key];
        }
    }
    const result = parser.parse();
    return result.getDate();
}

const strtime = {
    strftime: strftime,
    strptime: strptime,
};

module.exports = strtime;
