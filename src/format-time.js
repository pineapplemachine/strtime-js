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

function getTimezoneOffsetMinutes(date, tz){
    if(tz === null || tz === undefined){
        return undefined;
    }else if(tz >= -16 && tz <= +16){
        return Math.floor(60 * tz);
    }else if(Number.isFinite(tz)){
        return Math.floor(tz);
    }else if(tz === "local"){
        return -(date || new Date()).getTimezoneOffset()
    }else if(tz in defaultTimezoneNames){
        return Math.floor(60 * defaultTimezoneNames[tz]);
    }else{
        throw new Error(`Unrecognized timezone option "${tz}".`);
    }
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
    const tokens = TimestampParser.parseFormatString(format);
    const useOptions = getFormatOptions(timezone, options);
    const timezoneOffsetMinutes = getTimezoneOffsetMinutes(date, useOptions.tz);
    const tzDate = new Date(date);
    if(timezoneOffsetMinutes !== undefined){
        tzDate.setUTCMinutes(
            date.getUTCMinutes() +
            date.getTimezoneOffset() +
            timezoneOffsetMinutes
        );
    }else if(tokens.zuluTimezone){
        tzDate.setUTCMinutes(
            date.getUTCMinutes() +
            date.getTimezoneOffset()
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
    }else if(parser.tokens.zuluTimezone){
        parser.timezoneOffsetMinutes = 0;
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
