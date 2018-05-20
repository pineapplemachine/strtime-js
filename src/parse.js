const english = require("./english");
const getFirstWeekdayInYear = require("./first-weekday-in-year");
const defaultTimezoneNames = require("./timezone-names");
const Directive = require("./directives");
const isLeapYear = require("./leap-year");
const monthLengths = require("./month-lengths");
const TimestampParseError = require("./parse-error");

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
    if(tokens.length && tokens[tokens.length - 1].string === "Z"){
        tokens.zuluTimezone = true;
    }
    return tokens;
}

module.exports = TimestampParser;
