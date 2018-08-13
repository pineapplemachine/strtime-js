// github.com/pineapplemachine/strtime-js
// MIT license, Copyright (c) 2018 Sophie Kirschner (sophiek@pineapplemachine.com)
// References:
// https://www.ibm.com/support/knowledgecenter/en/ssw_ibm_i_71/rtref/strpti.htm
// https://www.gnu.org/software/libc/manual/html_node/Formatting-Calendar-Time.html
// https://www.gnu.org/software/libc/manual/html_node/Low_002dLevel-Time-String-Parsing.html
// http://man7.org/linux/man-pages/man3/strptime.3.html
// https://apidock.com/ruby/DateTime/strftime
// http://strftime.org/


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


function leftPad(char, length, text){
    let string = String(text);
    while(string.length < length){
        string = char + string;
    }
    return string;
}

function writeTimezoneOffset(offsetMinutes, modifier){
    const absOffset = Math.abs(offsetMinutes);
    const sign = (offsetMinutes >= 0 ? "+" : "-");
    const hour = leftPad("0", 2, Math.floor(absOffset / 60));
    const minute = leftPad("0", 2, absOffset % 60);
    if(modifier === "::"){
        return sign + hour + ":" + minute + ":00";
    }else if(modifier === ":"){
        return sign + hour + ":" + minute;
    }else{
        return sign + hour + minute;
    }
}

// Get the day of the week given an input Date.
// Returns 0 for Sunday, 1 for Monday, etc.
// https://www.quora.com/How-does-Tomohiko-Sakamotos-Algorithm-work/answer/Raziman-T-V?srid=u2HNX
function getDayOfWeek(date){
    const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth();
    let day = date.getUTCDate();
    if(month < 2){
        year--;
    }
    return (
        offsets[month] + year + day +
        Math.floor(year / 4) -
        Math.floor(year / 100) +
        Math.floor(year / 400)
    ) % 7;
}

// Get the day of the year as a number (1-366)
function getDayOfYear(date){
    const lengths = monthLengths.forYear(date.getUTCFullYear());
    const months = lengths.slice(0, date.getUTCMonth());
    return date.getUTCDate() + (
        (months.length && months.reduce((a, b) => a + b)) || 0
    );
}

// Get the week of the year (starting with Sunday) (0-53)
function getWeekOfYearFromSunday(date){
    const dayOfYear = getDayOfYear(date);
    const firstDayOfWeek = getFirstWeekdayInYear(date.getUTCFullYear());
    return Math.floor((dayOfYear + (firstDayOfWeek || 7) - 1) / 7);
}

// Get the week of the year (starting with Monday) (0-53)
function getWeekOfYearFromMonday(date){
    const dayOfYear = getDayOfYear(date);
    const dayOfWeek = getDayOfWeek(date);
    const firstDayOfWeek = getFirstWeekdayInYear(date.getUTCFullYear());
    const sundayWeek = Math.floor((dayOfYear + (firstDayOfWeek || 7) - 1) / 7);
    return sundayWeek - (dayOfWeek === 0 ? 1 : 0) + (firstDayOfWeek === 1 ? 1 : 0);
}

function getISOWeeksInYear(year){
    const priorYear = year - 1;
    const a = (year +
        Math.floor(year / 4) -
        Math.floor(year / 100) +
        Math.floor(year / 400)
    ) % 7;
    const b = (priorYear +
        Math.floor(priorYear / 4) -
        Math.floor(priorYear / 100) +
        Math.floor(priorYear / 400)
    ) % 7;
    return a === 4 || b === 3 ? 53 : 52;
}

// Get the ISO week of the year
// https://en.wikipedia.org/wiki/ISO_week_date
// https://en.wikipedia.org/wiki/ISO_8601#Week_dates
function getISOWeekOfYear(date){
    const year = date.getUTCFullYear();
    const dayOfYear = getDayOfYear(date);
    const dayOfWeek = getDayOfWeek(date);
    const weekNumber = Math.floor((10 + dayOfYear - (dayOfWeek || 7)) / 7);
    if(weekNumber < 1){
        return getISOWeeksInYear(year - 1);
    }else if(weekNumber > getISOWeeksInYear(year)){
        return 1;
    }else{
        return weekNumber;
    }
}

// https://en.wikipedia.org/wiki/ISO_week_date
function getISOWeekDateYear(date){
    const year = date.getUTCFullYear();
    const dayOfYear = getDayOfYear(date);
    const dayOfWeek = getDayOfWeek(date);
    const weekNumber = Math.floor((10 + dayOfYear - (dayOfWeek || 7)) / 7);
    if(weekNumber < 1){
        return year - 1;
    }else if(weekNumber > getISOWeeksInYear(year)){
        return year + 1;
    }else{
        return year;
    }
}

class Directive{
    constructor(options){
        // List of possible names for this directive
        this.names = options.names;
        // Pad numbers to this length (normally)
        this.padLength = options.padLength;
        // A likely (but not strict) length to be used when resolving
        // ambiguous parsing inputs
        this.likelyLength = options.likelyLength;
        // Indicates that this directive uses text (as opposed to numbers)
        this.text = options.text;
        // The minimum permitted numeric value for a directive
        this.minimum = options.minimum;
        // The maximum permitted numeric value for a directive
        this.maximum = options.maximum;
        // Whether this directive represents a number that can be negative
        this.canBeNegative = options.canBeNegative;
        // This directive should always be rewritten using a combination of
        // other directives
        this.rewrite = options.rewrite;
        // Function to parse content from a string
        this.parseFunction = options.parse;
        // Function to write content as a string, given a date to format
        this.writeFunction = options.write;
        // Function to store a parsed numeric value
        this.storeFunction = options.store;
    }
    static getByName(name){
        for(let directive of Directive.list){
            if(directive.names.indexOf(name) >= 0){
                return directive;
            }
        }
        return undefined;
    }
    isOrdinal(){
        return false;
    }
    getCanBeNegative(){
        return this.canBeNegative;
    }
    getLikelyLength(){
        return this.likelyLength;
    }
    getRewriteParsed(parseFormatString){
        if(!this.rewriteParsedValue){
            this.rewriteParsedValue = parseFormatString(this.rewrite);
            for(let token of this.rewriteParsedValue){
                token.expandedFrom = this;
            }
        }
        return this.rewriteParsedValue;
    }
    hasParseFunction(){
        return !!this.parseFunction;
    }
    hasStoreFunction(){
        return !!this.storeFunction;
    }
    parse(parser){
        return this.parseFunction.call(parser);
    }
    store(parser, number){
        this.storeFunction.call(parser, number);
    }
    write(date, modifier, options, timezoneOffsetMinutes){
        return this.writeFunction(date, modifier, options, timezoneOffsetMinutes);
    }
    numberInBounds(value){
        return (
            (!Number.isFinite(this.minimum) || value >= this.minimum) &&
            (!Number.isFinite(this.maximum) || value <= this.maximum)
        );
    }
    getBoundsString(){
        if(Number.isFinite(this.minimum) && Number.isFinite(this.maximum)){
            return `[${this.minimum}, ${this.maximum}]`;
        }else if(Number.isFinite(this.minimum)){
            return `[${this.minimum}, ...]`;
        }else if(Number.isFinite(this.maximum)){
            return `[..., ${this.maximum}]`;
        }else{
            return undefined;
        }
    }
    toString(){
        return "%" + this.names[0];
    }
}

Directive.Token = class DirectiveToken{
    constructor(modifier, directive){
        this.modifier = modifier;
        this.directive = directive;
        this.expandedFrom = undefined;
    }
    isOrdinal(){
        return this.modifier === ":";
    }
    getCanBeNegative(){
        return this.directive.canBeNegative;
    }
    getLikelyLength(){
        return this.directive.likelyLength;
    }
    hasParseFunction(){
        return this.directive.hasParseFunction();
    }
    hasStoreFunction(){
        return this.directive.hasStoreFunction();
    }
    parse(parser){
        return this.directive.parseFunction.call(parser, this.modifier);
    }
    store(parser, number){
        this.directive.storeFunction.call(parser, number);
    }
    write(date, options, timezoneOffsetMinutes){
        const result = this.directive.write(date, this.modifier, options, timezoneOffsetMinutes);
        if(this.modifier === "^"){
            const resultString = String(result);
            if(typeof(result) === "number") return resultString;
            const upper = resultString.toUpperCase();
            return upper !== resultString ? upper : resultString.toLowerCase();
        }else if(this.modifier === "_" && this.directive.padLength){
            return leftPad(" ", this.directive.padLength, result);
        }else if(this.modifier === "_" && this.directive.text){
            return String(result).toLowerCase();
        }else if(this.modifier === "-" && this.directive.padLength){
            return String(result);
        }else if(this.modifier === ":" && !this.directive.text){
            const transform = ((options && options.ordinalTransform) ||
                english.ordinalTransform
            );
            return transform(result);
        }else if(!this.directive.text && this.directive.padLength){
            return (result >= 0 ?
                leftPad("0", this.directive.padLength, result) :
                `-${leftPad("0", this.directive.padLength, -result)}`
            );
        }else{
            return String(result);
        }
    }
    numberInBounds(value){
        return this.directive.numberInBounds(value);
    }
    getBoundsString(){
        return this.directive.getBoundsString();
    }
    toString(){
        return "%" + this.modifier + this.directive.names[0];
    }
}

Directive.StringToken = class DirectiveStringToken{
    constructor(string){
        this.string = string || "";
        this.expandedFrom = undefined;
    }
    addCharacter(ch){
        this.string += ch;
    }
    toString(){
        return this.string;
    }
}

Directive.list = [
    // Abbreviated weekday name
    new Directive({
        names: ["a"],
        text: true,
        parse: function(){
            this.dayOfWeek = this.parseWeekdayName(this);
        },
        write: function(date, modifier, options){
            const names = ((options && options.shortWeekdayNames) ||
                english.shortWeekdayNames
            );
            return names[date.getUTCDay() % 7];
        },
    }),
    // Long weekday name
    new Directive({
        names: ["A"],
        text: true,
        parse: function(){
            this.dayOfWeek = this.parseWeekdayName(this);
        },
        write: function(date, modifier, options){
            const names = ((options && options.longWeekdayNames) ||
                english.longWeekdayNames
            );
            return names[date.getUTCDay() % 7];
        },
    }),
    // Abbreviated month name
    new Directive({
        names: ["b", "h"],
        text: true,
        parse: function(){
            this.month = 1 + this.parseMonthName(this);
        },
        write: function(date, modifier, options){
            const names = ((options && options.shortMonthNames) ||
                english.shortMonthNames
            );
            return names[date.getUTCMonth() % 12];
        },
    }),
    // Long month name
    new Directive({
        names: ["B"],
        text: true,
        parse: function(){
            this.month = 1 + this.parseMonthName(this);
        },
        write: function(date, modifier, options){
            const names = ((options && options.longMonthNames) ||
                english.longMonthNames
            );
            return names[date.getUTCMonth() % 12];
        },
    }),
    // Combination date and time, same as "%a %b %e %H:%M:%S %Y"
    new Directive({
        names: ["c"],
        rewrite: "%a %b %e %H:%M:%S %Y",
    }),
    // Century (complements %y)
    new Directive({
        names: ["C"],
        likelyLength: 2,
        canBeNegative: true,
        store: function(number){
            this.century = number;
        },
        write: function(date){
            return Math.floor(date.getUTCFullYear() / 100);
        },
    }),
    // Two-digit day of month
    new Directive({
        names: ["d"],
        padLength: 2,
        likelyLength: 2,
        minimum: 1,
        maximum: 31,
        store: function(number){
            this.dayOfMonth = number;
        },
        write: function(date){
            return date.getUTCDate();
        },
    }),
    // Same as %m/%d/%y
    new Directive({
        names: ["D", "x"],
        rewrite: "%m/%d/%y",
    }),
    // Day of month padded with spaces (same as "%_d")
    new Directive({
        names: ["e"],
        likelyLength: 2,
        minimum: 1,
        maximum: 31,
        store: function(number){
            this.dayOfMonth = number;
        },
        write: function(date, modifier){
            if(!modifier){
                return leftPad(" ", 2, date.getUTCDate());
            }else{
                return date.getUTCDate();
            }
        },
    }),
    // Six-digit microsecond
    new Directive({
        names: ["f"],
        padLength: 6,
        likelyLength: 6,
        minimum: 0,
        maximum: 999999,
        store: function(number){
            this.microsecond = number;
        },
        write: function(date){
            return 1000 * date.getUTCMilliseconds();
        },
    }),
    // Same as %Y-%m-%d
    new Directive({
        names: ["F"],
        rewrite: "%Y-%m-%d",
    }),
    // Two-digit ISO week year
    new Directive({
        names: ["g"],
        likelyLength: 2,
        store: function(number){
            this.isoTwoDigitYear = number;
        },
        write: function(date){
            return getISOWeekDateYear(date) % 100;
        },
    }),
    // Full ISO week year
    new Directive({
        names: ["G"],
        padLength: 4,
        likelyLength: 4,
        canBeNegative: true,
        store: function(number){
            this.isoYear = number;
        },
        write: function(date){
            return getISOWeekDateYear(date);
        },
    }),
    // Two-digit hour (0-23)
    new Directive({
        names: ["H", "k"],
        padLength: 2,
        likelyLength: 2,
        minimum: 0,
        maximum: 23,
        store: function(number){
            this.hour = number;
        },
        write: function(date){
            return date.getUTCHours();
        },
    }),
    // Two-digit hour (1-12) to be used in combination with %p (AM/PM)
    new Directive({
        names: ["I", "l"],
        padLength: 2,
        likelyLength: 2,
        minimum: 1,
        maximum: 12,
        store: function(number){
            this.hour = number;
        },
        write: function(date){
            return (date.getUTCHours() % 12) || 12;
        },
    }),
    // Day in year
    new Directive({
        names: ["j"],
        padLength: 3,
        likelyLength: 3,
        minimum: 1,
        maximum: 366,
        store: function(number){
            this.dayOfYear = number;
        },
        write: function(date){
            return getDayOfYear(date);
        },
    }),
    // Three-digit millisecond
    new Directive({
        names: ["L"],
        padLength: 3,
        likelyLength: 3,
        minimum: 0,
        maximum: 999,
        store: function(number){
            this.millisecond = number;
        },
        write: function(date){
            return date.getUTCMilliseconds();
        },
    }),
    // Two-digit month number (1-12)
    new Directive({
        names: ["m"],
        padLength: 2,
        likelyLength: 2,
        minimum: 1,
        maximum: 12,
        store: function(number){
            this.month = number;
        },
        write: function(date){
            return 1 + date.getUTCMonth();
        },
    }),
    // Two-digit minute (0-59)
    new Directive({
        names: ["M"],
        padLength: 2,
        likelyLength: 2,
        minimum: 0,
        maximum: 59,
        store: function(number){
            this.minute = number;
        },
        write: function(date){
            return date.getUTCMinutes();
        },
    }),
    // AM or PM (uppercase)
    new Directive({
        names: ["p"],
        text: true,
        parse: function(){
            this.meridiem = this.parseMeridiemName();
        },
        write: function(date, modifier, options){
            const index = date.getUTCHours() < 12 ? 0 : 1;
            return (
                (options && options.meridiemNames) || english.meridiemNames
            )[index];
        },
    }),
    // AM or PM (lowercase)
    new Directive({
        names: ["P"],
        likelyLength: 2,
        text: true,
        parse: function(){
            this.meridiem = this.parseMeridiemName();
        },
        write: function(date, modifier, options){
            const index = date.getUTCHours() < 12 ? 0 : 1;
            return (
                (options && options.meridiemNames) || english.meridiemNames
            )[index].toLowerCase();
        },
    }),
    // Number of mircoseconds since epoch
    new Directive({
        names: ["Q"],
        canBeNegative: true,
        store: function(number){
            this.microsecondsSinceEpoch = number;
        },
        write: function(date){
            return Math.floor(date.getTime() * 1000);
        },
    }),
    // Same as "%I:%M:%S %p"
    new Directive({
        names: ["r"],
        rewrite: "%I:%M:%S %p",
    }),
    // Same as "%H:%M"
    new Directive({
        names: ["R"],
        rewrite: "%H:%M",
    }),
    // Number of seconds since epoch
    new Directive({
        names: ["s"],
        canBeNegative: true,
        store: function(number){
            this.secondsSinceEpoch = number;
        },
        write: function(date){
            return Math.floor(date.getTime() / 1000);
        },
    }),
    // Two-digit second (0-61)
    new Directive({
        names: ["S"],
        padLength: 2,
        likelyLength: 2,
        minimum: 0,
        maximum: 61,
        store: function(number){
            this.second = number;
        },
        write: function(date){
            return Math.min(59, date.getUTCSeconds());
        },
    }),
    // Same as %H:%M:%S
    new Directive({
        names: ["T", "X"],
        rewrite: "%H:%M:%S",
    }),
    // Weekday number, starting with Monday (1-7)
    new Directive({
        names: ["u"],
        likelyLength: 1,
        minimum: 1,
        maximum: 7,
        store: function(number){
            this.dayOfWeek = number % 7;
        },
        write: function(date){
            return getDayOfWeek(date) || 7;
        },
    }),
    // Week of the year, starting with Sunday (0-53)
    new Directive({
        names: ["U"],
        padLength: 2,
        likelyLength: 2,
        minimum: 0,
        maximum: 53,
        store: function(number){
            this.weekOfYearFromSunday = number;
        },
        write: function(date){
            return getWeekOfYearFromSunday(date);
        },
    }),
    // VMS date, same as "%e-%b-%Y"
    new Directive({
        names: ["v"],
        rewrite: "%e-%b-%Y",
    }),
    // ISO 8601:1988 week number (1-53), complements %g/%G
    new Directive({
        names: ["V"],
        padLength: 2,
        likelyLength: 2,
        minimum: 1,
        maximum: 53,
        store: function(number){
            this.isoWeekOfYear = number;
        },
        write: function(date){
            return getISOWeekOfYear(date);
        },
    }),
    // Weekday number, starting with Sunday (0-6)
    new Directive({
        names: ["w"],
        likelyLength: 1,
        minimum: 0,
        maximum: 6,
        store: function(number){
            this.dayOfWeek = number % 7;
        },
        write: function(date){
            return getDayOfWeek(date);
        },
    }),
    // Week of the year, starting with Monday (0-53)
    new Directive({
        names: ["W"],
        padLength: 2,
        likelyLength: 2,
        minimum: 0,
        maximum: 53,
        store: function(number){
            this.weekOfYearFromMonday = number;
        },
        write: function(date){
            return getWeekOfYearFromMonday(date);
        },
    }),
    // Two-digit year
    new Directive({
        names: ["y"],
        padLength: 2,
        likelyLength: 2,
        store: function(number){
            this.twoDigitYear = number;
        },
        write: function(date){
            return date.getUTCFullYear() % 100;
        },
    }),
    // Full year (usually four-digit, but not strictly so)
    new Directive({
        names: ["Y"],
        padLength: 4,
        likelyLength: 4,
        canBeNegative: true,
        store: function(number){
            this.year = number;
        },
        write: function(date, modifier){
            const year = date.getUTCFullYear();
            // Modifier "^" produces unsigned year, for combination with era "%#"
            if(year <= 0 && modifier === "^") return 1 - year;
            else return year;
        },
    }),
    // Timezone offset e.g. +0500 or -1200
    new Directive({
        names: ["z"],
        text: true,
        parse: function(modifier){
            this.timezoneOffsetMinutes = this.parseTimezoneOffset(modifier);
        },
        write: function(date, modifier, options, timezoneOffsetMinutes){
            const offset = (Number.isFinite(timezoneOffsetMinutes) ?
                timezoneOffsetMinutes : -date.getTimezoneOffset()
            );
            return writeTimezoneOffset(offset, modifier);
        },
    }),
    // Timezone offset or name e.g. UTC or GMT or EST or +0500 or -1200
    new Directive({
        names: ["Z"],
        likelyLength: 5,
        text: true,
        parse: function(modifier){
            const tzList = this.getTimezoneNameList();
            const index = this.parseIndexInList(tzList);
            if(index !== undefined){
                this.timezoneOffsetMinutes = 60 * this.timezoneNames[tzList[index]];
            }else{
                this.timezoneOffsetMinutes = this.parseTimezoneOffset(modifier);
            }
        },
        write: function(date, modifier, options, timezoneOffsetMinutes){
            const offset = (Number.isFinite(timezoneOffsetMinutes) ?
                timezoneOffsetMinutes : -date.getTimezoneOffset()
            );
            if(offset === 0) return "UTC";
            else return writeTimezoneOffset(offset, modifier);
        },
    }),
    // Same as "%a %b %e %H:%M:%S %Z %Y"
    new Directive({
        names: ["+"],
        rewrite: "%a %b %e %H:%M:%S %Z %Y",
    }),
    // Era (BC/BCE)
    new Directive({
        names: ["#"],
        text: true,
        parse: function(){
            this.era = this.parseEraName();
        },
        write: function(date, modifier, options){
            const index = date.getUTCFullYear() <= 0 ? 1 : 0;
            return (
                (options && options.eraNames) || english.eraNames
            )[index];
        },
    }),
];

// The assertion-error package was used as a basis for the TimestampParseError type
// https://github.com/chaijs/assertion-error/blob/master/index.js

// The constructor
function TimestampParseError(reason, parser){
    Error.call(this);
    this.reason = reason;
    this.format = parser.format;
    this.timestamp = parser.string;
    this.token = parser.currentToken;
    this.index = parser.index;
    if(this.token && this.token.expandedFrom && this.index !== undefined) this.message = (
        `Failed to parse token "${this.token}" ` +
        `(expanded from "${this.token.expandedFrom}") at position [${this.index}] ` +
        `in timestamp "${this.timestamp}" with format "${this.format}": ` +
        `${this.reason}`
    );
    else if(this.token && this.index !== undefined) this.message = (
        `Failed to parse token "${this.token}" at position [${this.index}] ` +
        `in timestamp "${this.timestamp}" with format "${this.format}": ` +
        `${this.reason}`
    );
    else if(this.token) this.message = (
        `Failed to parse token "${this.token}" ` +
        `in format "${this.format}": ${this.reason}`
    );
    else this.message = (
        `Failed with format "${this.format}": ${this.reason}`
    );
    // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
    if(Error.captureStackTrace){
        Error.captureStackTrace(this, this.constructor);
    }else{
        try{
            throw new Error();
        }catch(error){
            this.stack = error.stack;
        }
    }
}

// Prototype wrangling
TimestampParseError.prototype = Object.create(Error.prototype);
TimestampParseError.prototype.name = "TimestampParseError";
TimestampParseError.prototype.constructor = TimestampParseError;


function isDigit(ch){
    return (
        ch === "0" || ch === "1" || ch === "2" || ch === "3" || ch === "4" ||
        ch === "5" || ch === "6" || ch === "7" || ch === "8" || ch === "9"
    );
}

// Matches GNU C strptime behavior
// https://www.gnu.org/software/libc/manual/html_node/Low_002dLevel-Time-String-Parsing.html
function getYearFromTwoDigits(year){
    return year + (year <= 68 ? 2000 : 1900);
}

function getMonthFromDayOfYear(year, dayOfYear){
    const months = monthLengths.forYear(year);
    let days = 0;
    for(let i = 0; i < months.length; i++){
        if(days >= dayOfYear) return i;
        days += months[i];
    }
    return 12;
}

function getDayOfMonthFromDayOfYear(year, dayOfYear){
    const months = monthLengths.forYear(year);
    let days = 0;
    for(let i = 0; i < months.length; i++){
        if(dayOfYear - days <= months[i]) return dayOfYear - days;
        days += months[i];
    }
    return dayOfYear - days;
}

// https://en.wikipedia.org/wiki/ISO_week_date
// https://en.wikipedia.org/wiki/ISO_8601#Week_dates
function getDateFromISOWeekDate(parser, isoYear, isoWeekOfYear, dayOfWeek){
    const firstDayOfWeek = getFirstWeekdayInYear(isoYear);
    const weekdayOfJan4 = ((3 + firstDayOfWeek) % 7) || 7;
    const daysInYear = isLeapYear(isoYear) ? 366 : 365;
    let dayOfYear = 7 * isoWeekOfYear + (dayOfWeek || 7) - weekdayOfJan4 - 3;
    if(dayOfYear < 1){
        parser.year = isoYear - 1;
        dayOfYear += daysInYear;
    }else if(dayOfYear > daysInYear){
        parser.year = 1 + isoYear;
        dayOfYear -= daysInYear;
    }else{
        parser.year = isoYear;
    }
    parser.month = getMonthFromDayOfYear(parser.year, dayOfYear);
    parser.dayOfMonth = getDayOfMonthFromDayOfYear(parser.year, dayOfYear);
}

function getDateFromSundayWeekDate(parser, year, weekOfYear, dayOfWeek){
    const firstDayOfWeek = getFirstWeekdayInYear(year);
    const dayOfYear = 1 + 7 * weekOfYear - (firstDayOfWeek || 7) + dayOfWeek;
    parser.year = year;
    parser.month = getMonthFromDayOfYear(year, dayOfYear);
    parser.dayOfMonth = getDayOfMonthFromDayOfYear(year, dayOfYear);
}

function getDateFromMondayWeekDate(parser, year, weekOfYear, dayOfWeek){
    const firstDayOfWeek = getFirstWeekdayInYear(year);
    const sundayDayOfYear = 1 + 7 * weekOfYear - (firstDayOfWeek || 7) + dayOfWeek;
    const dayOfYear = sundayDayOfYear + (
        (dayOfWeek === 0 ? 7 : 0) - (firstDayOfWeek === 1 ? 7 : 0)
    );
    parser.year = year;
    parser.month = getMonthFromDayOfYear(year, dayOfYear);
    parser.dayOfMonth = getDayOfMonthFromDayOfYear(year, dayOfYear);
}

class TimestampParser{
    constructor(timestamp, format, tokens){
        // Parser state
        this.index = 0;
        this.string = String(timestamp);
        this.format = String(format);
        this.tokens = tokens || TimestampParser.parseFormatString(this.format);
        this.forkLength = 0;
        this.currentToken = undefined;
        // Parser settings
        this.shortWeekdayNames = english.shortWeekdayNames;
        this.longWeekdayNames = english.longWeekdayNames;
        this.shortMonthNames = english.shortMonthNames;
        this.longMonthNames = english.longMonthNames;
        this.eraNames = english.eraNames;
        this.meridiemNames = english.meridiemNames;
        this.ordinalTransform = english.ordinalTransform;
        this.timezoneNames = defaultTimezoneNames;
        // Storage values from parsing tokens
        this.era = undefined;
        this.century = undefined;
        this.year = undefined;
        this.twoDigitYear = undefined;
        this.isoYear = undefined;
        this.isoTwoDigitYear = undefined;
        this.month = undefined;
        this.isoWeekOfYear = undefined;
        this.weekOfYearFromSunday = undefined;
        this.weekOfYearFromMonday = undefined;
        this.dayOfYear = undefined;
        this.dayOfMonth = undefined;
        this.dayOfWeek = undefined;
        this.hour = undefined;
        this.minute = undefined;
        this.second = undefined;
        this.millisecond = undefined;
        this.microsecond = undefined;
        this.meridiem = undefined;
        this.timezoneOffsetMinutes = undefined;
        this.secondsSinceEpoch = undefined;
        this.millisecondsSinceEpoch = undefined;
        this.microsecondsSinceEpoch = undefined;
    }
    getTimezoneOffsetOfDate(date){
        const offset = (this.timezoneOffsetMinutes === undefined ?
            -date.getTimezoneOffset() :
            this.timezoneOffsetMinutes
        );
        const offsetSign = offset >= 0 ? +1 : -1;
        const absOffset = Math.abs(offset);
        return {
            hour: offsetSign * Math.floor(absOffset / 60),
            minute: offsetSign * Math.floor(absOffset % 60),
            totalMinutes: offset,
        };
    }
    getDate(){
        if(this.microsecondsSinceEpoch === undefined){
            if(this.millisecondsSinceEpoch !== undefined){
                this.microsecondsSinceEpoch = 1000 * this.millisecondsSinceEpoch;
            }else if(this.secondsSinceEpoch !== undefined){
                this.microsecondsSinceEpoch = 1000000 * this.secondsSinceEpoch;
            }
        }
        if(this.microsecondsSinceEpoch !== undefined){
            const date = new Date(this.microsecondsSinceEpoch / 1000);
            const offset = this.getTimezoneOffsetOfDate(date);
            date.setUTCMinutes(date.getUTCMinutes() - offset.totalMinutes);
            return date;
        }
        const date = new Date();
        if(this.year === undefined && this.twoDigitYear !== undefined){
            if(this.century === undefined){
                this.year = getYearFromTwoDigits(this.twoDigitYear);
            }else{
                this.year = 100 * this.century + this.twoDigitYear;
            }
        }else if(this.isoYear === undefined && this.isoTwoDigitYear !== undefined){
            this.isoYear = getYearFromTwoDigits(this.isoTwoDigitYear);
        }else if(this.year === undefined && this.century !== undefined){
            this.year = 100 * this.century;
        }
        if(this.era && this.year !== undefined){
            this.year = 1 - this.year;
        }
        if(this.hour !== undefined && this.meridiem !== undefined){
            this.hour = (this.hour % 12) + (this.meridiem ? 12 : 0);
        }
        if(this.microsecond === undefined && this.millisecond !== undefined){
            this.microsecond = 1000 * this.millisecond;
        }
        if(this.isoYear !== undefined && this.isoWeekOfYear !== undefined &&
            (this.month === undefined || this.dayOfMonth === undefined)
        ){
            getDateFromISOWeekDate(this,
                this.isoYear, this.isoWeekOfYear, this.dayOfWeek || 0
            );
        }else if(this.dayOfYear !== undefined){
            const year = this.year !== undefined ? this.year : date.getFullYear();
            if(this.month === undefined){
                this.month = getMonthFromDayOfYear(year, this.dayOfYear);
            }
            if(this.dayOfMonth === undefined){
                this.dayOfMonth = getDayOfMonthFromDayOfYear(year, this.dayOfYear);
            }
        }else if(this.weekOfYearFromSunday !== undefined &&
            (this.month === undefined || this.dayOfMonth === undefined)
        ){
            const year = this.year !== undefined ? this.year : date.getFullYear();
            getDateFromSundayWeekDate(this,
                year, this.weekOfYearFromSunday, this.dayOfWeek || 0
            );
        }else if(this.weekOfYearFromMonday !== undefined &&
            (this.month === undefined || this.dayOfMonth === undefined)
        ){
            const year = this.year !== undefined ? this.year : date.getFullYear();
            getDateFromMondayWeekDate(this,
                year, this.weekOfYearFromMonday, this.dayOfWeek || 0
            );
        }
        if(this.year !== undefined){
            date.setUTCFullYear(this.year);
        }
        if(this.month !== undefined){
            date.setUTCMonth(this.month - 1);
        }
        if(this.dayOfMonth !== undefined){
            date.setUTCDate(this.dayOfMonth);
        }
        const offset = this.getTimezoneOffsetOfDate(date);
        if(offset.totalMinutes){
            this.hour = (this.hour || 0) - offset.hour;
            this.minute = (this.minute || 0) - offset.minute;
        }
        date.setUTCHours(this.hour || 0);
        date.setUTCMinutes(this.minute || 0);
        date.setUTCSeconds(this.second || 0);
        date.setUTCMilliseconds(this.microsecond ? this.microsecond / 1000 : 0);
        return date;
    }
    copy(){
        const parser = new TimestampParser(this.string, this.format, this.tokens);
        for(let key in this){
            parser[key] = this[key];
        }
        return parser;
    }
    fork(length, startTokenIndex){
        const parser = this.copy();
        parser.forkLength = length;
        return parser.parse(startTokenIndex);
    }
    parse(startTokenIndex){
        for(let i = startTokenIndex || 0; i < this.tokens.length; i++){
            const token = this.tokens[i];
            this.currentToken = token;
            if(this.index >= this.string.length) throw new TimestampParseError(
                "Timestamp is too short to match the whole format.", this
            );
            if(token instanceof Directive.StringToken){
                this.parseStringToken(token.string);
            }else if(token.hasParseFunction()){
                token.parse(this);
            }else if(token.hasStoreFunction() && !token.text){
                const next = this.tokens[1 + i];
                if((next instanceof Directive.StringToken && isDigit(next.string[0])) || ((
                    next instanceof Directive ||
                    next instanceof Directive.Token
                ) && !next.text)){
                    const result = this.parseAmbiguousNumber(token, i);
                    if(result) return result;
                }else{
                    token.store(this, this.parseNumber(token));
                }
            }else{
                throw new TimestampParseError("Invalid directive.", this);
            }
        }
        this.currentToken = undefined;
        if(1 + this.index < this.string.length) throw new TimestampParseError(
            `Timestamp is too long for the given format. Text remaining: "${this.string.slice(this.index)}".`, this
        );
        return this;
    }
    parseStringToken(token){
        for(let i = 0; i < token.length; i++){
            if(this.string[this.index] !== token[i]){
                throw new TimestampParseError(`String literal "${token}" not matched.`, this);
            }
            this.index++;
        }
    }
    parseAmbiguousNumber(token, tokenIndex){
        if(this.forkLength === 0){
            const likelyLength = token.getLikelyLength();
            if(likelyLength){
                try{
                    return this.fork(likelyLength, tokenIndex);
                }catch(error){
                    if(!(error instanceof TimestampParseError)) throw error;
                }
            }
            let lastWholeError = undefined;
            for(let i = 1; i < this.string.length - this.index; i++){
                if(i === token.likelyLength) continue;
                try{
                    return this.fork(i, tokenIndex);
                }catch(error){
                    if(!(error instanceof TimestampParseError)) throw error;
                    if(error.message = "Timestamp is too short to match the whole format."){
                        lastWholeError = error;
                    }
                }
            }
            if(lastWholeError){
                throw lastWholeError;
            }else{
                throw new TimestampParseError("Failed to parse ambiguous number.", this);
            }
        }else{
            const number = this.parseNumber(token, this.forkLength);
            token.store(this, number);
            this.forkLength = 0;
        }
    }
    parseNumber(directive, lengthLimit = Infinity){
        const negative = this.string[this.index] === "-";
        if(negative && !directive.getCanBeNegative()){
            throw new TimestampParseError("Number cannot be negative.", this);
        }else if(negative){
            this.index++;
        }
        const start = this.index;
        while(this.index < this.string.length &&
            this.string[this.index] === " "
        ){
            this.index++;
        }
        while(this.index < this.string.length &&
            this.index - start < lengthLimit && isDigit(this.string[this.index])
        ){
            this.index++;
        }
        const value = +this.string.slice(start, this.index).trim();
        if(!Number.isInteger(value)){
            throw new TimestampParseError("Failed to parse number.", this);
        }else if(!directive.numberInBounds(value)){
            throw new TimestampParseError(`Number [${value}] is out of bounds ${directive.getBoundsString()}.`, this);
        }
        const result = negative ? -value : value;
        if(directive.isOrdinal()){
            const ordinal = this.ordinalTransform(result);
            this.index += ordinal.length - (this.index - start);
        }
        return result;
    }
    parseMonthName(){
        const names = this.shortMonthNames.slice();
        names.push(...this.longMonthNames);
        const index = this.parseIndexInList(names);
        if(index === undefined) throw new TimestampParseError(
            "Failed to parse month name.", this
        );
        return index % 12;
    }
    parseWeekdayName(){
        const names = this.shortWeekdayNames.slice();
        names.push(...this.longWeekdayNames);
        const index = this.parseIndexInList(names);
        if(index === undefined) throw new TimestampParseError(
            "Failed to parse weekday name.", this
        );
        return index % 7;
    }
    parseMeridiemName(){
        const index = this.parseIndexInList(this.meridiemNames);
        if(index === undefined) throw new TimestampParseError(
            "Failed to parse AM/PM.", this
        );
        return index % 2;
    }
    parseEraName(){
        const index = this.parseIndexInList(this.eraNames);
        if(index === undefined) throw new TimestampParseError(
            "Failed to parse era name.", this
        );
        return index % 2;
    }
    parseIndexInList(list){
        const possible = list.slice();
        let possibleCount = possible.length;
        let matchIndex = undefined;
        let matchLength = 0;
        for(let i = 0; possibleCount && this.index + i < this.string.length; i++){
            const ch = this.string[this.index + i].toLowerCase();
            for(let j = 0; j < possible.length; j++){
                const item = possible[j];
                if(!item) continue;
                if(i >= item.length || item[i].toLowerCase() !== ch){
                    possible[j] = null;
                    possibleCount--;
                }else if(1 + i === item.length){
                    matchIndex = j;
                    matchLength = 1 + i;
                }
            }
        }
        if(matchIndex === undefined){
            return undefined;
        }else{
            this.index += matchLength;
            return matchIndex;
        }
    }
    getTimezoneNameList(){
        if(!this.timezoneNameList){
            this.timezoneNameList = [];
            for(let key in this.timezoneNames){
                this.timezoneNameList.push(key);
            }
        }
        return this.timezoneNameList;
    }
    parseTimezoneOffset(modifier){
        const start = this.index;
        const sign = this.string[this.index];
        const hours = +this.string.slice(this.index + 1, this.index + 3);
        let minutes;
        if(this.string[this.index + 3] === ":"){
            minutes = +this.string.slice(this.index + 4, this.index + 6);
            this.index += 6;
        }else{
            minutes = +this.string.slice(this.index + 3, this.index + 5);
            this.index += 5;
        }
        if(!Number.isInteger(hours) || !Number.isInteger(minutes)){
            throw new TimestampParseError(
                `Failed to parse timezone offset from string ` +
                `"${this.string.slice(start, this.index)}".`, this
            );
        }
        const offset = minutes + 60 * hours;
        if(sign === "+" || sign === "±") return +offset;
        else if(sign === "-") return -offset;
        else throw new TimestampParseError(`Unknown timezone offset sign "${sign}".`, this);
    }
}

TimestampParser.parseFormatString = function parseFormatString(format){
    const tokens = [];
    let directive = false;
    let modifier = undefined;
    const formatString = String(format);
    if(!formatString){
        throw new TimestampParseError(`Empty format string.`, {
            format: formatString
        });
    }
    function addCharacter(ch){
        if(tokens.length && (tokens[tokens.length - 1] instanceof Directive.StringToken)){
            if(isDigit(ch) === isDigit(tokens[tokens.length - 1].string[0])){
                tokens[tokens.length - 1].addCharacter(ch);
            }else{
                tokens.push(new Directive.StringToken(ch));
            }
        }else{
            tokens.push(new Directive.StringToken(ch));
        }
    }
    for(let ch of formatString){
        if(directive && ch === "%"){
            addCharacter("%");
            modifier = "";
            directive = false;
        }else if(directive && ch === "n"){
            addCharacter("\n");
            modifier = "";
            directive = false;
        }else if(directive && ch === "t"){
            addCharacter("\t");
            modifier = "";
            directive = false;
        }else if(directive && !modifier && (
            ch === "-" || ch === "_" || ch === "^" || ch === ":"
        )){
            modifier += ch;
        }else if(directive){
            const dir = Directive.getByName(ch);
            if(!dir) throw new TimestampParseError(`Unknown directive "%${modifier}${ch}".`, {
                format: formatString
            });
            else if(dir.rewrite) tokens.push(
                ...dir.getRewriteParsed(TimestampParser.parseFormatString)
            );
            else tokens.push(
                new Directive.Token(modifier, dir)
            );
            modifier = "";
            directive = false;
        }else if(ch === "%"){
            modifier = "";
            directive = true;
        }else{
            addCharacter(ch);
        }
    }
    if(directive) throw new TimestampParseError(
        "Found unterminated directive at the end of the format string.", {
            format: formatString
        }
    );
    if(tokens.length && tokens[tokens.length - 1].string === "Z"){
        tokens.zuluTimezone = true;
    }
    return tokens;
}

function isLeapYear(year){
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}


const monthLengths = {
    common: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    leap: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    forYear: function(year){
        return isLeapYear(year) ? monthLengths.leap : monthLengths.common;
    },
};

// https://stackoverflow.com/a/478992/4099022
function getFirstWeekdayInYear(year){
    const y = year - 1;
    return (year * 365 +
        Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)
    ) % 7;
}

const defaultTimezoneNames = {
    "ACDT": +10.5,
    "ACST": +9.5,
    "ACT": -5,
    "ACWST": +8.75,
    "ADT": -3,
    "AEDT": +11,
    "AEST": +10,
    "AFT": +4.5,
    "AKDT": -8,
    "AKST": -9,
    "AMST": -3,
    "AMT": -4,
    "AMT": +4,
    "ART": -3,
    "AST": +3,
    "AST": -4,
    "AWST": +8,
    "AZOST": 0,
    "AZOT": -1,
    "AZT": +4,
    "BDT": +8,
    "BIOT": +6,
    "BIT": -12,
    "BOT": -4,
    "BRST": -2,
    "BRT": -3,
    "BST": +6,
    "BST": +11,
    "BST": +1,
    "BTT": +6,
    "CAT": +2,
    "CCT": +6.5,
    "CDT": -5,
    "CDT": -4,
    "CEST": +2,
    "CET": +1,
    "CHADT": +13.75,
    "CHAST": +12.75,
    "CHOT": +8,
    "CHOST": +9,
    "CHST": +10,
    "CHUT": +10,
    "CIST": -8,
    "CIT": +8,
    "CKT": -10,
    "CLST": -3,
    "CLT": -4,
    "COST": -4,
    "COT": -5,
    "CST": -6,
    "CST": +8,
    "CST": -5,
    "CT": +8,
    "CVT": -1,
    "CWST": +8.75,
    "CXT": +7,
    "DAVT": +7,
    "DDUT": +10,
    "DFT": +1,
    "EASST": -5,
    "EAST": -6,
    "EAT": +3,
    "ECT": -4,
    "ECT": -5,
    "EDT": -4,
    "EEST": +3,
    "EET": +2,
    "EGST": 0,
    "EGT": -1,
    "EIT": +9,
    "EST": -5,
    "FET": +3,
    "FJT": +12,
    "FKST": -3,
    "FKT": -4,
    "FNT": -2,
    "GALT": -6,
    "GAMT": -9,
    "GET": +4,
    "GFT": -3,
    "GILT": +12,
    "GIT": -9,
    "GMT": 0,
    "GST": -2,
    "GST": +4,
    "GYT": -4,
    "HDT": -9,
    "HAEC": +2,
    "HST": -10,
    "HKT": +8,
    "HMT": +5,
    "HOVST": +8,
    "HOVT": +7,
    "ICT": +7,
    "IDLW": -12,
    "IDT": +3,
    "IOT": +3,
    "IRDT": +4.5,
    "IRKT": +8,
    "IRST": +3.5,
    "IST": +5.5,
    "IST": +1,
    "IST": +2,
    "JST": +9,
    "KGT": +6,
    "KOST": +11,
    "KRAT": +7,
    "KST": +9,
    "LHST": +10.5,
    "LHST": +11,
    "LINT": +14,
    "MAGT": +12,
    "MART": -9.5,
    "MAWT": +5,
    "MDT": -6,
    "MET": +1,
    "MEST": +2,
    "MHT": +12,
    "MIST": +11,
    "MIT": -9.5,
    "MMT": +6.5,
    "MSK": +3,
    "MST": +8,
    "MST": -7,
    "MUT": +4,
    "MVT": +5,
    "MYT": +8,
    "NCT": +11,
    "NDT": -2.5,
    "NFT": +11,
    "NPT": +5.75,
    "NST": -3.5,
    "NT": -3.5,
    "NUT": -11,
    "NZDT": +13,
    "NZST": +12,
    "OMST": +6,
    "ORAT": +5,
    "PDT": -7,
    "PET": -5,
    "PETT": +12,
    "PGT": +10,
    "PHOT": +13,
    "PHT": +8,
    "PKT": +5,
    "PMDT": -2,
    "PMST": -3,
    "PONT": +11,
    "PST": -8,
    "PST": +8,
    "PYST": -3,
    "PYT": -4,
    "RET": +4,
    "ROTT": -3,
    "SAKT": +11,
    "SAMT": +4,
    "SAST": +2,
    "SBT": +11,
    "SCT": +4,
    "SDT": -10,
    "SGT": +8,
    "SLST": +5.5,
    "SRET": +11,
    "SRT": -3,
    "SST": -11,
    "SST": +8,
    "SYOT": +3,
    "TAHT": -10,
    "THA": +7,
    "TFT": +5,
    "TJT": +5,
    "TKT": +13,
    "TLT": +9,
    "TMT": +5,
    "TRT": +3,
    "TOT": +13,
    "TVT": +12,
    "ULAST": +9,
    "ULAT": +8,
    "USZ": +2,
    "UTC": 0,
    "UYST": -2,
    "UYT": -3,
    "UZT": +5,
    "VET": -4,
    "VLAT": +10,
    "VOLT": +4,
    "VOST": +6,
    "VUT": +11,
    "WAKT": +12,
    "WAST": +2,
    "WAT": +1,
    "WEST": +1,
    "WET": 0,
    "WIT": +7,
    "WST": +8,
    "YAKT": +9,
    "YEKT": +5,
    "Z": 0,
};


if(typeof(module) !== "undefined"){
    module.exports = strtime;
}else if(typeof(window) !== "undefined"){
    window.strtime = strtime;
}
