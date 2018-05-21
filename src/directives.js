const english = require("./english");
const getFirstWeekdayInYear = require("./first-weekday-in-year");
const monthLengths = require("./month-lengths");

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

module.exports = Directive;
