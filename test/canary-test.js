const assert = require("assert").strict;
const canary = require("canary-test").Group("strtime");

const moment = require("moment");
const luxon = require("luxon");
const dayjs = require("dayjs");

function getDate(options){
    const date = new Date();
    date.setFullYear(options.year !== undefined ? options.year : 2000);
    date.setMonth((options.month || 1) - 1);
    date.setDate(options.day || 1);
    date.setHours(options.hour || 0);
    date.setMinutes(options.minute || 0);
    date.setSeconds(options.second || 0);
    date.setMilliseconds(options.millisecond || 0);
    return date;
}

function getUTCDate(options){
    const date = new Date();
    date.setUTCFullYear(options.year !== undefined ? options.year : 2000);
    date.setUTCMonth((options.month || 1) - 1);
    date.setUTCDate(options.day || 1);
    date.setUTCHours(options.hour || 0);
    date.setUTCMinutes(options.minute || 0);
    date.setUTCSeconds(options.second || 0);
    date.setUTCMilliseconds(options.millisecond || 0);
    return date;
}

function createTests(strtime){
    const strftime = strtime.strftime;
    const strptime = strtime.strptime;
    
    canary.group("individual directives", function(){
        this.group("Abbreviated weekday name %a", function(){
            this.test("format", function(){
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 13}), "%a"), "Sun");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 14}), "%a"), "Mon");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 15}), "%a"), "Tue");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 16}), "%a"), "Wed");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 17}), "%a"), "Thu");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 18}), "%a"), "Fri");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 19}), "%a"), "Sat");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 19}), "%^a"), "SAT");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("2018-W20-Fri", "%G-W%V-%a", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-FRI", "%G-W%V-%a", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-Friday", "%G-W%V-%a", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-friday", "%G-W%V-%a", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-FRIDAY", "%G-W%V-%a", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
            });
        });
        this.group("Long weekday name %A", function(){
            this.test("format", function(){
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 13}), "%A"), "Sunday");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 14}), "%A"), "Monday");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 15}), "%A"), "Tuesday");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 16}), "%A"), "Wednesday");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 17}), "%A"), "Thursday");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 18}), "%A"), "Friday");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 19}), "%A"), "Saturday");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("2018-W20-Fri", "%G-W%V-%A", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-FRI", "%G-W%V-%A", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-Friday", "%G-W%V-%A", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-friday", "%G-W%V-%A", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
                assert.deepStrictEqual(strptime("2018-W20-FRIDAY", "%G-W%V-%A", {tz: 0}), getUTCDate({year: 2018, month: 5, day: 18}));
            });
        });
        this.group("Abbreviated month name %b", function(){
            this.test("format", function(){
                assert.equal(strftime(getUTCDate({year: 2018, month: 1, day: 1}), "%b"), "Jan");
                assert.equal(strftime(getUTCDate({year: 2018, month: 2, day: 1}), "%b"), "Feb");
                assert.equal(strftime(getUTCDate({year: 2018, month: 3, day: 1}), "%b"), "Mar");
                assert.equal(strftime(getUTCDate({year: 2018, month: 4, day: 1}), "%b"), "Apr");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 1}), "%b"), "May");
                assert.equal(strftime(getUTCDate({year: 2018, month: 6, day: 1}), "%b"), "Jun");
                assert.equal(strftime(getUTCDate({year: 2018, month: 7, day: 1}), "%b"), "Jul");
                assert.equal(strftime(getUTCDate({year: 2018, month: 8, day: 1}), "%b"), "Aug");
                assert.equal(strftime(getUTCDate({year: 2018, month: 9, day: 1}), "%b"), "Sep");
                assert.equal(strftime(getUTCDate({year: 2018, month: 10, day: 1}), "%b"), "Oct");
                assert.equal(strftime(getUTCDate({year: 2018, month: 11, day: 1}), "%b"), "Nov");
                assert.equal(strftime(getUTCDate({year: 2018, month: 12, day: 1}), "%b"), "Dec");
            });
            this.test("parse", function(){
                assert.equal(strptime("1 Jan 2018", "%-d %b %Y", {tz: 0}).getUTCMonth(), 0);
                assert.equal(strptime("1 Dec 2018", "%-d %b %Y", {tz: 0}).getUTCMonth(), 11);
                assert.equal(strptime("1 January 2018", "%-d %b %Y", {tz: 0}).getUTCMonth(), 0);
                assert.equal(strptime("1 December 2018", "%-d %b %Y", {tz: 0}).getUTCMonth(), 11);
                assert.equal(strptime("1 APRIL 2018", "%-d %b %Y", {tz: 0}).getUTCMonth(), 3);
            });
        });
        this.group("Long month name %B", function(){
            this.test("format", function(){
                assert.equal(strftime(getUTCDate({year: 2018, month: 1, day: 1}), "%B"), "January");
                assert.equal(strftime(getUTCDate({year: 2018, month: 2, day: 1}), "%B"), "February");
                assert.equal(strftime(getUTCDate({year: 2018, month: 3, day: 1}), "%B"), "March");
                assert.equal(strftime(getUTCDate({year: 2018, month: 4, day: 1}), "%B"), "April");
                assert.equal(strftime(getUTCDate({year: 2018, month: 5, day: 1}), "%B"), "May");
                assert.equal(strftime(getUTCDate({year: 2018, month: 6, day: 1}), "%B"), "June");
                assert.equal(strftime(getUTCDate({year: 2018, month: 7, day: 1}), "%B"), "July");
                assert.equal(strftime(getUTCDate({year: 2018, month: 8, day: 1}), "%B"), "August");
                assert.equal(strftime(getUTCDate({year: 2018, month: 9, day: 1}), "%B"), "September");
                assert.equal(strftime(getUTCDate({year: 2018, month: 10, day: 1}), "%B"), "October");
                assert.equal(strftime(getUTCDate({year: 2018, month: 11, day: 1}), "%B"), "November");
                assert.equal(strftime(getUTCDate({year: 2018, month: 12, day: 1}), "%B"), "December");
            });
            this.test("parse", function(){
                assert.equal(strptime("1 Jan 2018", "%-d %B %Y", {tz: 0}).getUTCMonth(), 0);
                assert.equal(strptime("1 Dec 2018", "%-d %B %Y", {tz: 0}).getUTCMonth(), 11);
                assert.equal(strptime("1 January 2018", "%-d %B %Y", {tz: 0}).getUTCMonth(), 0);
                assert.equal(strptime("1 December 2018", "%-d %B %Y", {tz: 0}).getUTCMonth(), 11);
                assert.equal(strptime("1 APRIL 2018", "%-d %B %Y", {tz: 0}).getUTCMonth(), 3);
            });
        });
        this.group("Combination date and time %c", function(){
            this.test("format", function(){
                assert.equal(
                    strftime(new Date("2018-05-18T10:00:00.000Z"), "%c", {tz: 0}),
                    "Fri May 18 10:00:00 2018"
                );
            });
            this.test("parse", function(){
                assert.deepStrictEqual(
                    strptime("Fri May 18 10:00:00 2018", "%c", {tz: 0}),
                    new Date("2018-05-18T10:00:00.000Z")
                );
            });
        });
        this.group("Century number %C", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2000-06-15"), "%C"), "20");
                assert.equal(strftime(getUTCDate({year: -2000}), "%C"), "-20");
            });
            this.test("parse", function(){
                assert.equal(strptime("20", "%C").getFullYear(), 2000);
                assert.equal(strptime("-20", "%C").getFullYear(), -2000);
            });
        });
        this.group("Day of month %d", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2000-06-01"), "%d"), "01");
                assert.equal(strftime(new Date("2000-06-01"), "%-d"), "1");
                assert.equal(strftime(new Date("2000-06-01"), "%_d"), " 1");
                assert.equal(strftime(new Date("2000-06-01"), "%:d"), "1st");
            });
            this.test("parse", function(){
                assert.equal(strptime("01 Jan 2000", "%d %b %Y", {tz: 0}).getUTCDate(), 1);
                assert.equal(strptime("1 Jan 2000", "%d %b %Y", {tz: 0}).getUTCDate(), 1);
                assert.equal(strptime(" 1 Jan 2000", "%d %b %Y", {tz: 0}).getUTCDate(), 1);
                assert.equal(strptime("1st Jan 2000", "%:d %b %Y", {tz: 0}).getUTCDate(), 1);
            });
        });
        
        this.group("Date (%m/%d/%y) %D", function(){
            const date = new Date("2018-05-18T10:00:00.000Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%D", {tz: 0}), "05/18/18");
                assert.equal(strftime(date, "%D %T", {tz: 0}), "05/18/18 10:00:00");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("05/18/18 10:00:00", "%D %T", {tz: 0}), date);
            });
        });
        this.group("Space-padded day of month %e", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2000-06-01"), "%e"), " 1");
                assert.equal(strftime(new Date("2000-06-20"), "%e"), "20");
            });
            this.test("parse", function(){
                assert.equal(strptime("01 Jan 2000", "%e %b %Y", {tz: 0}).getUTCDate(), 1);
                assert.equal(strptime("1 Jan 2000", "%e %b %Y", {tz: 0}).getUTCDate(), 1);
                assert.equal(strptime(" 1 Jan 2000", "%e %b %Y", {tz: 0}).getUTCDate(), 1);
                assert.equal(strptime("1st Jan 2000", "%:e %b %Y", {tz: 0}).getUTCDate(), 1);
            });
        });
        this.group("Microsecond %f", function(){
            const date = new Date("2018-05-18T10:00:30.123Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%f", {tz: 0}), "123000");
                assert.equal(strftime(date, "%S.%f", {tz: 0}), "30.123000");
            });
            this.test("parse", function(){
                const timestamp = "2018-05-18 10:00:30.123000 +0000";
                assert.deepStrictEqual(strptime(timestamp, "%F %T.%f %z"), date);
            });
        });
        this.group("Date (%Y-%m-%d) %F", function(){
            const date = new Date("2018-01-02T12:30:15.000Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%F", {tz: 0}), "2018-01-02");
            });
            this.test("parse", function(){
                const timestamp = "2018-01-02T12:30:15Z";
                assert.deepStrictEqual(strptime(timestamp, "%FT%TZ"), date);
            });
        });
        this.group("Two-digit ISO week year %g", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("1980-06-15"), "%g"), "80");
                assert.equal(strftime(new Date("2021-06-15"), "%g"), "21");
            });
            this.test("parse", function(){
                assert.equal(strptime("80-W10", "%g-W%V").getFullYear(), 1980);
                assert.equal(strptime("21-W10", "%g-W%V").getFullYear(), 2021);
            });
        });
        this.group("Full ISO week year %G", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2000-06-15"), "%G"), "2000");
                assert.equal(strftime(getUTCDate({year: 200, month: 6}), "%G"), "0200");
                assert.equal(strftime(getUTCDate({year: -2000, month: 6}), "%G"), "-2000");
                assert.equal(strftime(getUTCDate({year: -0029, month: 6}), "%G"), "-0029");
                assert.equal(strftime(getUTCDate({year: -0029, month: 6}), "%_G"), " -29");
                assert.equal(strftime(getUTCDate({year: -0029, month: 6}), "%-G"), "-29");
            });
            this.test("parse", function(){
                assert.equal(strptime("2000-W10", "%G-W%V").getFullYear(), 2000);
                assert.equal(strptime("-2000-W10", "%G-W%V").getFullYear(), -2000);
            });
        });
        this.group("Hour (24-hour clock) %H", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-01-02T01:30:15Z"), "%H", {tz: 0}), "01");
                assert.equal(strftime(new Date("2018-01-02T12:30:15Z"), "%H", {tz: 0}), "12");
                assert.equal(strftime(new Date("2018-01-02T04:30:15Z"), "%-H", {tz: 0}), "4");
                assert.equal(strftime(new Date("2018-01-02T04:30:15Z"), "%_H", {tz: 0}), " 4");
                assert.equal(strftime(new Date("2018-01-02T04:30:15Z"), "%:H", {tz: 0}), "4th");
            });
            this.test("parse", function(){
                assert.equal(strptime("01/01/99 01:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 1);
                assert.equal(strptime("01/01/99 12:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 12);
                assert.equal(strptime("01/01/99 4:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 4);
                assert.equal(strptime("01/01/99  4:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 4);
                assert.equal(strptime("01/01/99 4th hr 0 mins", "%d/%m/%y %:H hr %M mins", {tz: 0}).getUTCHours(), 4);
            });
        });
        this.group("Hour (12-hour clock) %I", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-01-02T01:30:15Z"), "%I %p", {tz: 0}), "01 AM");
                assert.equal(strftime(new Date("2018-01-02T12:30:15Z"), "%I %p", {tz: 0}), "12 PM");
                assert.equal(strftime(new Date("2018-01-02T16:30:15Z"), "%I %p", {tz: 0}), "04 PM");
                assert.equal(strftime(new Date("2018-01-02T23:30:15Z"), "%I %p", {tz: 0}), "11 PM");
                assert.equal(strftime(new Date("2018-01-02T00:30:15Z"), "%I %p", {tz: 0}), "12 AM");
            });
            this.test("parse", function(){
                assert.equal(strptime("1 AM", "%I %p", {tz: 0}).getUTCHours(), 1);
                assert.equal(strptime("12 PM", "%I %p", {tz: 0}).getUTCHours(), 12);
                assert.equal(strptime("4 PM", "%I %p", {tz: 0}).getUTCHours(), 16);
                assert.equal(strptime("11 PM", "%I %p", {tz: 0}).getUTCHours(), 23);
                assert.equal(strptime("12 AM", "%I %p", {tz: 0}).getUTCHours(), 0);
            });
        });
        this.group("Day of year %j", function(){
            const first = new Date("2012-01-01");
            const last = new Date("2012-12-31");
            this.test("format", function(){
                assert.equal(strftime(first, "%j", {tz: 0}), "001");
                assert.equal(strftime(last, "%j", {tz: 0}), "366");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("2012-001", "%Y-%j", {tz: 0}), first);
                assert.deepStrictEqual(strptime("2012-366", "%Y-%j", {tz: 0}), last);
            });
        });
        this.group("Millisecond %L", function(){
            const date = new Date("2018-05-18T10:00:30.123Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%L", {tz: 0}), "123");
                assert.equal(strftime(date, "%S.%L", {tz: 0}), "30.123");
            });
            this.test("parse", function(){
                const timestamp = "2018-05-18 10:00:30.123 +0000";
                assert.deepStrictEqual(strptime(timestamp, "%F %T.%L %z"), date);
            });
        });
        this.group("Month number %m", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2000-01-15"), "%m", {tz: 0}), "01");
                assert.equal(strftime(new Date("2000-06-15"), "%m", {tz: 0}), "06");
                assert.equal(strftime(new Date("2000-12-15"), "%m", {tz: 0}), "12");
            });
            this.test("parse", function(){
                assert.equal(strptime("2000-01-15", "%Y-%m-%d").getUTCMonth(), 0);
                assert.equal(strptime("2000-06-15", "%Y-%m-%d").getUTCMonth(), 5);
                assert.equal(strptime("2000-12-15", "%Y-%m-%d").getUTCMonth(), 11);
            });
        });
        this.group("Minute %M", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-01-02T01:00:15Z"), "%M", {tz: 0}), "00");
                assert.equal(strftime(new Date("2018-01-02T01:30:15Z"), "%M", {tz: 0}), "30");
                assert.equal(strftime(new Date("2018-01-02T01:59:15Z"), "%M", {tz: 0}), "59");
            });
            this.test("parse", function(){
                assert.equal(strptime("01/01/99 01:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 1);
                assert.equal(strptime("01/01/99 12:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 12);
                assert.equal(strptime("01/01/99 4:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 4);
                assert.equal(strptime("01/01/99  4:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCHours(), 4);
                assert.equal(strptime("01/01/99 4th hr 0 mins", "%d/%m/%y %:H hr %M mins", {tz: 0}).getUTCHours(), 4);
            });
        });
        this.group("Uppercase AM/PM %p", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-01-02T05:30:15Z"), "%I %p", {tz: 0}), "05 AM");
                assert.equal(strftime(new Date("2018-01-02T22:30:15Z"), "%I %p", {tz: 0}), "10 PM");
            });
            this.test("parse", function(){
                assert.equal(strptime("5 AM", "%I %p", {tz: 0}).getUTCHours(), 5);
                assert.equal(strptime("10 PM", "%I %p", {tz: 0}).getUTCHours(), 22);
                assert.equal(strptime("5 am", "%I %p", {tz: 0}).getUTCHours(), 5);
                assert.equal(strptime("10 pm", "%I %p", {tz: 0}).getUTCHours(), 22);
            });
        });
        this.group("Lowercase am/pm %P", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-01-02T05:30:15Z"), "%I %P", {tz: 0}), "05 am");
                assert.equal(strftime(new Date("2018-01-02T22:30:15Z"), "%I %P", {tz: 0}), "10 pm");
            });
            this.test("parse", function(){
                assert.equal(strptime("5 AM", "%I %P", {tz: 0}).getUTCHours(), 5);
                assert.equal(strptime("10 PM", "%I %P", {tz: 0}).getUTCHours(), 22);
                assert.equal(strptime("5 am", "%I %P", {tz: 0}).getUTCHours(), 5);
                assert.equal(strptime("10 pm", "%I %P", {tz: 0}).getUTCHours(), 22);
            });
        });
        this.group("Microseconds since epoch %Q", function(){
            const date = new Date("2000-01-01T00:00:00Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%Q", {tz: 0}), "946684800000000");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("946684800000000", "%Q", {tz: 0}), date);
            });
        });
        this.group("12-hour time (%I:%M:%S %p) %r", function(){
            const date = new Date("2018-01-02T13:30:15.000Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%r", {tz: 0}), "01:30:15 PM");
            });
            this.test("parse", function(){
                const timestamp = "2018-01-02 01:30:15 PM UTC";
                assert.deepStrictEqual(strptime(timestamp, "%F %r %Z"), date);
            });
        });
        this.group("24-hour time (%H:%M) %R", function(){
            const date = new Date("2018-01-02T13:30:15.000Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%R", {tz: 0}), "13:30");
            });
            this.test("parse", function(){
                const timestamp = "2018-01-02 13:30:15 UTC";
                assert.deepStrictEqual(strptime(timestamp, "%F %R:%S %Z"), date);
            });
        });
        this.group("Seconds since epoch %s", function(){
            const date = new Date("2000-01-01T00:00:00Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%s", {tz: 0}), "946684800");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("946684800", "%s", {tz: 0}), date);
            });
        });
        this.group("Second %S", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-01-02T01:00:00Z"), "%S", {tz: 0}), "00");
                assert.equal(strftime(new Date("2018-01-02T01:00:30Z"), "%S", {tz: 0}), "30");
                assert.equal(strftime(new Date("2018-01-02T01:00:59Z"), "%S", {tz: 0}), "59");
            });
            this.test("parse", function(){
                assert.equal(strptime("01/01/99 1:00", "%d/%m/%y %H:%M", {tz: 0}).getUTCMinutes(), 0);
                assert.equal(strptime("01/01/99 1:30", "%d/%m/%y %H:%M", {tz: 0}).getUTCMinutes(), 30);
                assert.equal(strptime("01/01/99 1:59", "%d/%m/%y %H:%M", {tz: 0}).getUTCMinutes(), 59);
            });
        });
        this.group("24-hour time (%H:%M:%S) %T", function(){
            const date = new Date("2000-01-01T15:10:05Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%T", {tz: 0}), "15:10:05");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("2000-01-01 15:10:05 UTC", "%F %T %Z"), date);
            });
        });
        this.group("Weekday number, Monday first (1-7) %u", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-05-13T00:00:00Z"), "%u"), "7");
                assert.equal(strftime(new Date("2018-05-14T00:00:00Z"), "%u"), "1");
                assert.equal(strftime(new Date("2018-05-15T00:00:00Z"), "%u"), "2");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(
                    strptime("2018-W18-5 00:00:00 UTC", "%G-W%V-%u %T %Z"),
                    new Date("2018-05-04T00:00:00Z")
                );
            });
        });
        this.group("Week of the year, with Sunday as the first weekday %U", function(){
            const dates = [
                [new Date("1990-01-04T00:00:00Z"), "1990-00-4"],
                [new Date("2000-01-01T00:00:00Z"), "2000-00-6"],
                [new Date("2001-03-03T00:00:00Z"), "2001-08-6"],
                [new Date("2005-04-01T00:00:00Z"), "2005-13-5"],
                [new Date("2011-07-03T00:00:00Z"), "2011-27-0"],
                [new Date("2016-02-29T00:00:00Z"), "2016-09-1"],
                [new Date("2018-05-19T00:00:00Z"), "2018-19-6"],
                [new Date("2021-10-10T00:00:00Z"), "2021-41-0"],
                [new Date("2030-09-18T00:00:00Z"), "2030-37-3"],
                [new Date("2038-09-21T00:00:00Z"), "2038-38-2"],
                [new Date("2040-12-30T00:00:00Z"), "2040-53-0"],
                [new Date("2040-12-31T00:00:00Z"), "2040-53-1"],
            ];
            this.test("format", function(){
                for(let date of dates){
                    assert.equal(strftime(date[0], "%Y-%U-%w", {tz: 0}), date[1]);
                }
            });
            this.test("parse", function(){
                for(let date of dates){
                    assert.deepStrictEqual(strptime(date[1], "%Y-%U-%w", {tz: 0}), date[0]);
                }
            });
        });
        this.group("VMS date (%e-%b-%Y) %v", function(){
            const date = new Date("1995-04-08T00:00:00Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%v", {tz: 0}), " 8-Apr-1995");
            });
            this.test("parse", function(){
                const timestamp = " 8-Apr-1995 00:00:00 UTC";
                assert.deepStrictEqual(strptime(timestamp, "%v %T %Z"), date);
            });
        });
        this.group("ISO week number %V", function(){
            this.test("format", function(){
                assert.equal(
                    strftime(new Date("2018-05-04T00:00:00Z"), "%G-W%V-%u %T %Z", {tz: 0}),
                    "2018-W18-5 00:00:00 UTC"
                );
            });
            this.test("parse", function(){
                assert.deepStrictEqual(
                    strptime("2018-W18-5 00:00:00 UTC", "%G-W%V-%u %T %Z"),
                    new Date("2018-05-04T00:00:00Z")
                );
            });
        });
        this.group("Weekday number, Sunday first (0-6) %w", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2018-05-13T00:00:00Z"), "%w"), "0");
                assert.equal(strftime(new Date("2018-05-14T00:00:00Z"), "%w"), "1");
                assert.equal(strftime(new Date("2018-05-15T00:00:00Z"), "%w"), "2");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(
                    strptime("2018-W18-5 00:00:00 UTC", "%G-W%V-%w %T %Z"),
                    new Date("2018-05-04T00:00:00Z")
                );
            });
        });
        this.group("Week of the year, with Monday as the first weekday %W", function(){
            const dates = [
                [new Date("1990-01-04T00:00:00Z"), "1990-01-4"],
                [new Date("2000-01-01T00:00:00Z"), "2000-00-6"],
                [new Date("2001-03-03T00:00:00Z"), "2001-09-6"],
                [new Date("2005-04-01T00:00:00Z"), "2005-13-5"],
                [new Date("2011-07-03T00:00:00Z"), "2011-26-7"],
                [new Date("2016-02-29T00:00:00Z"), "2016-09-1"],
                [new Date("2018-05-19T00:00:00Z"), "2018-20-6"],
                [new Date("2021-10-10T00:00:00Z"), "2021-40-7"],
                [new Date("2030-09-18T00:00:00Z"), "2030-37-3"],
                [new Date("2038-09-21T00:00:00Z"), "2038-38-2"],
                [new Date("2040-12-30T00:00:00Z"), "2040-52-7"],
                [new Date("2040-12-31T00:00:00Z"), "2040-53-1"],
            ];
            this.test("format", function(){
                for(let date of dates){
                    assert.equal(strftime(date[0], "%Y-%W-%u", {tz: 0}), date[1]);
                }
            });
            this.test("parse", function(){
                for(let date of dates){
                    assert.deepStrictEqual(strptime(date[1], "%Y-%W-%u", {tz: 0}), date[0]);
                }
            });
        });
        this.group("Two-digit year %y", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("1980-06-15"), "%y"), "80");
                assert.equal(strftime(new Date("2021-06-15"), "%y"), "21");
            });
            this.test("parse", function(){
                assert.equal(strptime("80", "%y").getFullYear(), 1980);
                assert.equal(strptime("21", "%y").getFullYear(), 2021);
                assert.equal(strptime("2121", "%C%y").getFullYear(), 2121);
            });
        });
        this.group("Full year %Y", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date("2000-06-15"), "%Y"), "2000");
                assert.equal(strftime(getUTCDate({year: -2000}), "%Y"), "-2000");
                assert.equal(strftime(getUTCDate({year: -59}), "%Y"), "-0059");
                assert.equal(strftime(getUTCDate({year: -59}), "%_Y"), " -59");
                assert.equal(strftime(getUTCDate({year: -59}), "%-Y"), "-59");
                assert.equal(strftime(getUTCDate({year: -59}), "%^Y"), "60");
            });
            this.test("parse", function(){
                assert.equal(strptime("2000", "%Y").getFullYear(), 2000);
                assert.equal(strptime("-2000", "%Y").getFullYear(), -2000);
            });
        });
        this.group("Timezone offset %z", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date(), "%z", {tz: 0}), "+0000");
                assert.equal(strftime(new Date(), "%:z", {tz: 0}), "+00:00");
                assert.equal(strftime(new Date(), "%z", {tz: +2.5}), "+0230");
                assert.equal(strftime(new Date(), "%z", {tz: -2.5}), "-0230");
            });
            this.test("parse", function(){
                assert.equal(strptime("12:00 +0000", "%H:%M %z").getUTCHours(), 12);
                assert.equal(strptime("12:00 +0000", "%H:%M %z").getUTCMinutes(), 0);
                assert.equal(strptime("12:00 ±0000", "%H:%M %z").getUTCHours(), 12);
                assert.equal(strptime("12:00 -0400", "%H:%M %z").getUTCHours(), 16);
                assert.equal(strptime("12:00 +0400", "%H:%M %z").getUTCHours(), 8);
                assert.equal(strptime("12:00 +0230", "%H:%M %z").getUTCHours(), 9);
                assert.equal(strptime("12:00 +0230", "%H:%M %z").getUTCMinutes(), 30);
                assert.equal(strptime("12:00 +01:00", "%H:%M %z").getUTCHours(), 11);
                assert.equal(strptime("12:00 +01:00", "%H:%M %z").getUTCMinutes(), 0);
            });
        });
        this.group("Timezone name or offset %Z", function(){
            this.test("format", function(){
                assert.equal(strftime(new Date(), "%Z", {tz: 0}), "UTC");
                assert.equal(strftime(new Date(), "%:Z", {tz: 0}), "UTC");
                assert.equal(strftime(new Date(), "%Z", {tz: +2.5}), "+0230");
                assert.equal(strftime(new Date(), "%Z", {tz: -2.5}), "-0230");
                assert.equal(strftime(new Date(), "%:Z", {tz: 6}), "+06:00");
            });
            this.test("parse", function(){
                assert.equal(strptime("12:00 +0000", "%H:%M %Z").getUTCHours(), 12);
                assert.equal(strptime("12:00 +0000", "%H:%M %Z").getUTCMinutes(), 0);
                assert.equal(strptime("12:00 ±0000", "%H:%M %Z").getUTCHours(), 12);
                assert.equal(strptime("12:00 -0400", "%H:%M %Z").getUTCHours(), 16);
                assert.equal(strptime("12:00 +0400", "%H:%M %Z").getUTCHours(), 8);
                assert.equal(strptime("12:00 +0230", "%H:%M %Z").getUTCHours(), 9);
                assert.equal(strptime("12:00 +0230", "%H:%M %Z").getUTCMinutes(), 30);
                assert.equal(strptime("12:00 +01:00", "%H:%M %Z").getUTCHours(), 11);
                assert.equal(strptime("12:00 +01:00", "%H:%M %Z").getUTCMinutes(), 0);
                assert.equal(strptime("12:00 Z", "%H:%M %Z").getUTCHours(), 12);
                assert.equal(strptime("12:00 UTC", "%H:%M %Z").getUTCHours(), 12);
                assert.equal(strptime("12:00 utc", "%H:%M %Z").getUTCHours(), 12);
                assert.equal(strptime("12:00 EDT", "%H:%M %Z").getUTCHours(), 16); // -4
                assert.equal(strptime("12:00 EEST", "%H:%M %Z").getUTCHours(), 9); // +3
                assert.equal(strptime("12:00 ACDT", "%H:%M %Z").getUTCHours(), 1); // +10.5
                assert.equal(strptime("12:00 ACDT", "%H:%M %Z").getUTCMinutes(), 30);
            });
        });
        this.group("Date (%a %b %e %H:%M:%S %Z %Y) %+", function(){
            const date = new Date("2000-01-02T10:11:12Z");
            this.test("format", function(){
                assert.equal(strftime(date, "%+", {tz: 0}), "Sun Jan  2 10:11:12 UTC 2000");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("Sun Jan  2 10:11:12 UTC 2000", "%+"), date);
            });
        });
        this.group("Era (BC/BCE) %#", function(){
            const ceDate = getUTCDate({year: 1900, month: 6, day: 12});
            const bceDate = getUTCDate({year: -299, month: 6, day: 12});
            this.test("format", function(){
                assert.equal(strftime(ceDate, "%^Y %#", {tz: 0}), "1900 CE");
                assert.equal(strftime(bceDate, "%^Y %#", {tz: 0}), "300 BCE");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("12 June 1900 CE", "%-d %B %Y %#", {tz: 0}), ceDate);
                assert.deepStrictEqual(strptime("12 June 300 BCE", "%-d %B %Y %#", {tz: 0}), bceDate);
            });
        });
        this.group("Literal % character %%", function(){
            const date = new Date("2001-01-01");
            this.test("format", function(){
                assert.equal(strftime(date, "%%%% %%", {tz: 0}), "%% %");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("2001-01-01%", "%F%%", {tz: 0}), date);
            });
        });
        this.group("Tab \\t character %t", function(){
            const date = new Date("2001-01-01");
            this.test("format", function(){
                assert.equal(strftime(date, "%t", {tz: 0}), "\t");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("2001-01-01\t", "%F%t", {tz: 0}), date);
            });
        });
        this.group("Newline \\n character %%", function(){
            const date = new Date("2001-01-01");
            this.test("format", function(){
                assert.equal(strftime(date, "%n", {tz: 0}), "\n");
            });
            this.test("parse", function(){
                assert.deepStrictEqual(strptime("2001-01-01\n", "%F%n", {tz: 0}), date);
            });
        });
    });
    
    canary.group("common timestamp formats", function(){
        const date = new Date("2018-05-04T22:15:30.000Z");
        this.test("write common formats", function(){
            assert.equal(strftime(date, "%F %T"), "2018-05-04 22:15:30");
            assert.equal(strftime(date, "%Y-%m-%d %H:%M:%S"), "2018-05-04 22:15:30");
            assert.equal(strftime(date, "%-m/%-d/%y"), "5/4/18");
            assert.equal(strftime(date, "%FT%T"), "2018-05-04T22:15:30");
            assert.equal(strftime(date, "%FT%T.%L"), "2018-05-04T22:15:30.000");
            assert.equal(strftime(date, "%A %-d %B %Y %I:%M %p"), "Friday 4 May 2018 10:15 PM");
        });
        this.test("parse common formats", function(){
            assert.deepStrictEqual(strptime("2018-05-04 22:15:30", "%F %T"), date);
            assert.deepStrictEqual(strptime("2018-05-04 22:15:30", "%Y-%m-%d %H:%M:%S"), date);
            assert.deepStrictEqual(strptime("5/4/18 22:15:30", "%-m/%-d/%y %H:%M:%S"), date);
            assert.deepStrictEqual(strptime("2018-05-04T22:15:30", "%FT%T"), date);
            assert.deepStrictEqual(strptime("2018-05-04T22:15:30.000", "%FT%T.%L"), date);
            assert.deepStrictEqual(strptime("Friday 4 May 2018 10:15:30 PM", "%A %-d %B %Y %I:%M:%S %p"), date);
        });
    });
    
    canary.group("potentially ambiguous number formats", function(){
        const date = new Date("2018-05-04");
        this.test("write potentially ambiguous formats", function(){
            assert.equal(strftime(date, "%Y%m%d"), "20180504");
            assert.equal(strftime(date, "%Y%-m%-d"), "201854");
            assert.equal(strftime(date, "%Y0%m0%d"), "2018005004");
        });
        this.test("parse potentially ambiguous formats", function(){
            assert.deepStrictEqual(strptime("20180504", "%Y%m%d"), date);
            assert.deepStrictEqual(strptime("201854", "%Y%-m%-d"), date);
            assert.deepStrictEqual(strptime("2018005004", "%Y0%m0%d"), date);
        });
    });
    
    canary.group("ISO week date format", function(){
        const dates = [
            [getUTCDate({year: 1906, month: 12, day: 9}), "1906-W49-7"],
            [getUTCDate({year: 1948, month: 3, day: 4}), "1948-W10-4"],
            [getUTCDate({year: 1991, month: 6, day: 23}), "1991-W25-7"],
            [getUTCDate({year: 2000, month: 1, day: 1}), "1999-W52-6"],
            [getUTCDate({year: 2008, month: 2, day: 25}), "2008-W09-1"],
            [getUTCDate({year: 2018, month: 5, day: 4}), "2018-W18-5"],
            [getUTCDate({year: 2100, month: 12, day: 31}), "2100-W52-5"],
        ];
        this.test("write ISO week dates", function(){
            for(let date of dates){
                const timestamp = strftime(date[0], "%G-W%V-%u", {tz: 0});
                assert.equal(timestamp, date[1], (
                    `\nFor ISO week date ${date[0].toISOString()}:` +
                    `\n- Expected "${date[1]}"` +
                    `\n- But found "${timestamp}`
                ));
            }
        });
        this.test("parse ISO week dates", function(){
            for(let date of dates){
                const parsed = strptime(date[1], "%G-W%V-%u", {tz: 0});
                assert.deepStrictEqual(parsed, date[0], (
                    `\nFor ISO week timestamp ${date[1]}:` +
                    `\n- Expected "${date[0].toISOString()}"` +
                    `\n- But found "${parsed.toISOString()}`
                ));
            }
        });
    });
    
    canary.group("dates before 1 CE", function(){
        const bceDate = year => getUTCDate({year: year, month: 1, day: 1});
        const dates = [
            [bceDate(1), "1 Jan 1 CE", "1 Jan 0001"],
            [bceDate(0), "1 Jan 1 BCE", "1 Jan 0000"],
            [bceDate(-1), "1 Jan 2 BCE", "1 Jan -0001"],
            [bceDate(-99), "1 Jan 100 BCE", "1 Jan -0099"],
        ];
        this.test("write dates before 1 CE", function(){
            for(let date of dates){
                const eraTimestamp = strftime(date[0], "%-d %b %^Y %#", {tz: 0});
                assert.equal(eraTimestamp, date[1], (
                    `\nFor CE/BCE date ${date[0].toISOString()}:` +
                    `\n- Expected "${date[1]}"` +
                    `\n- But found "${eraTimestamp}`
                ));
                const signedTimestamp = strftime(date[0], "%-d %b %Y", {tz: 0});
                assert.equal(signedTimestamp, date[2], (
                    `\nFor CE/BCE date ${date[0].toISOString()}:` +
                    `\n- Expected "${date[2]}"` +
                    `\n- But found "${signedTimestamp}`
                ));
            }
        });
        this.test("parse dates before 1 CE", function(){
            for(let date of dates){
                const eraParsed = strptime(date[1], "%-d %b %^Y %#", {tz: 0});
                assert.deepStrictEqual(eraParsed, date[0], (
                    `\nFor CE/BCE timestamp ${date[1]}:` +
                    `\n- Expected "${date[0].toISOString()}"` +
                    `\n- But found "${eraParsed.toISOString()}`
                ));
                const signedParsed = strptime(date[2], "%-d %b %Y", {tz: 0});
                assert.deepStrictEqual(signedParsed, date[0], (
                    `\nFor CE/BCE timestamp ${date[2]}:` +
                    `\n- Expected "${date[0].toISOString()}"` +
                    `\n- But found "${signedParsed.toISOString()}`
                ));
            }
        });
    });
    
    canary.group("providing an explicit timezone option", function(){
        const date = new Date("2018-06-15T12:30:00Z");
        this.test("write using the default timezone (UTC)", function(){
            assert.equal(strftime(date, "%F %T %z"), "2018-06-15 12:30:00 +0000");
        });
        this.test("write using the local timezone", function(){
            const localTimezoneOffset = -(date.getTimezoneOffset());
            const absOffset = Math.abs(localTimezoneOffset);
            const tzSign = localTimezoneOffset >= 0 ? "+" : "-";
            const tzHours = Math.floor(absOffset / 60);
            const tzMinutes = Math.floor(absOffset % 60);
            const tzString = (tzSign +
                (tzHours >= 10 ? tzHours : `0${tzHours}`) +
                (tzMinutes >= 10 ? tzMinutes : `0${tzMinutes}`)
            );
            assert.equal(strftime(date, "%z", "local"), tzString); // e.g. "+0200"
        });
        this.test("write with a specific timezone", function(){
            assert.equal(strftime(date, "%F %T %z", {tz: 0}), "2018-06-15 12:30:00 +0000");
            assert.equal(strftime(date, "%F %T %z", {tz: "UTC"}), "2018-06-15 12:30:00 +0000");
            assert.equal(strftime(date, "%F %T %z", {tz: "utc"}), "2018-06-15 12:30:00 +0000");
            assert.equal(strftime(date, "%F %T %z", {tz: +300}), "2018-06-15 17:30:00 +0500");
            assert.equal(strftime(date, "%F %T %z", {tz: -300}), "2018-06-15 07:30:00 -0500");
            assert.equal(strftime(date, "%F %T %z", "UTC"), "2018-06-15 12:30:00 +0000");
            assert.equal(strftime(date, "%F %T %z", 0), "2018-06-15 12:30:00 +0000");
            assert.equal(strftime(date, "%F %T %z", +1), "2018-06-15 13:30:00 +0100");
            assert.equal(strftime(date, "%F %T %z", -1), "2018-06-15 11:30:00 -0100");
            assert.equal(strftime(date, "%F %T %z", +3.5), "2018-06-15 16:00:00 +0330");
            assert.equal(strftime(date, "%F %T %z", -3.5), "2018-06-15 09:00:00 -0330");
            assert.equal(strftime(date, "%F %T %z", +120), "2018-06-15 14:30:00 +0200");
            assert.equal(strftime(date, "%F %T %z", -120), "2018-06-15 10:30:00 -0200");
        });
        this.test("write with explicit timezone ignores 'Z' (Zulu) ending", function(){
            assert.equal(strftime(new Date("2018-01-01"), "%FT%TZ"), "2018-01-01T00:00:00Z");
            assert.equal(strftime(new Date("2018-01-01"), "%FT%TZ", {tz: +2}), "2018-01-01T02:00:00Z");
        });
        this.test("write attempt with unknown timezone name", function(){
            assert.throws(() => {
                strftime(date, "%F %T", "NOT_A_REAL_TIMEZONE");
            }, error => {
                assert(error.message.startsWith("Unrecognized timezone option"));
                return true;
            });
        });
        this.test("parse assuming the default timezone (UTC)", function(){
            assert.deepStrictEqual(strptime("2018-06-15 12:30:00", "%F %T"), date);
        });
        this.test("parse assuming a certain timezone when none is in the timestamp", function(){
            const ts = "2018-08-15 12:30:00";
            assert.deepStrictEqual(strptime(ts, "%F %T", {tz: 0}), new Date("2018-08-15T12:30:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", {tz: "UTC"}), new Date("2018-08-15T12:30:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", {tz: "utc"}), new Date("2018-08-15T12:30:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", {tz: +60}), new Date("2018-08-15T11:30:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", {tz: -60}), new Date("2018-08-15T13:30:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", {tz: +2.5}), new Date("2018-08-15T10:00:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", {tz: -2.5}), new Date("2018-08-15T15:00:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", 0), new Date("2018-08-15T12:30:00Z"));
            assert.deepStrictEqual(strptime(ts, "%F %T", "UTC"), new Date("2018-08-15T12:30:00Z"));
        });
        this.test("parse with explicit timezone ignores 'Z' (Zulu) ending", function(){
            assert(strptime("2018-01-01T04:00:00Z", "%FT%TZ").getUTCHours() === 4);
            assert(strptime("2018-01-01T04:00:00Z", "%FT%TZ", {tz: +2}).getUTCHours() === 2);
        });
        this.test("parse with explicit timezone overridden by timezone in timestamp", function(){
            assert(strptime("2018-01-01 04:00:00 UTC", "%F %T %Z").getUTCHours() === 4);
            assert(strptime("2018-01-01 04:00:00 UTC", "%F %T %Z", {tz: +2}).getUTCHours() === 4);
        });
    });
    
    canary.group("custom locale strings", function(){
        const spanish = {
            shortWeekdayNames: [
                "D", "L", "M", "X", "J", "V", "S"
            ],
            longWeekdayNames: [
                "domingo", "lunes", "martes", "miércoles",
                "jueves", "viernes", "sábado"
            ],
            shortMonthNames: [
                "ene", "feb", "mar", "abr", "may", "jun",
                "jul", "ago", "sep", "oct", "nov", "dic"
            ],
            longMonthNames: [
                "enero", "febrero", "marzo",
                "abril", "mayo", "junio",
                "julio", "agosto", "septiembre",
                "octubre", "noviembre", "diciembre"
            ],
            ordinalTransform: number => {
                return `${number}ª`;
            },
        };
        this.test("write custom weekday names", function(){
            assert.equal(strftime(new Date("2018-05-19"), "%a", "UTC", spanish), "S");
            assert.equal(strftime(new Date("2018-05-19"), "%A", "UTC", spanish), "sábado");
        });
        this.test("write custom month names", function(){
            assert.equal(strftime(new Date("2018-01-01"), "%b", "UTC", spanish), "ene");
            assert.equal(strftime(new Date("2018-01-01"), "%B", "UTC", spanish), "enero");
        });
        this.test("write custom ordinals", function(){
            assert.equal(
                strftime(new Date("2018-01-01"), "%:d día de %B de %Y", "UTC", spanish),
                "1ª día de enero de 2018"
            );
        });
        this.test("parse custom weekday names", function(){
            const date = new Date("2008-02-25");
            assert.deepStrictEqual(strptime("2008-W09-L", "%G-W%V-%A", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("2008-W09-l", "%G-W%V-%A", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("2008-W09-lunes", "%G-W%V-%A", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("2008-W09-Lunes", "%G-W%V-%A", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("2008-W09-LUNES", "%G-W%V-%A", "UTC", spanish), date);
        });
        this.test("parse custom month names", function(){
            const date = new Date("2018-03-10");
            assert.deepStrictEqual(strptime("10 mar 2018", "%d %b %Y", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("10 MAR 2018", "%d %b %Y", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("10 marzo 2018", "%d %b %Y", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("10 Marzo 2018", "%d %b %Y", "UTC", spanish), date);
            assert.deepStrictEqual(strptime("10 MARZO 2018", "%d %b %Y", "UTC", spanish), date);
        });
        this.test("parse custom ordinals", function(){
            const date = new Date("2018-07-10");
            assert.deepStrictEqual(strptime(
                "10ª día de julio de 2018", "%:d día de %B de %Y", "UTC", spanish
            ), date);
        });
    });
    
    canary.group("reversibility of various date and format combinations", function(){
        const dates = [
            new Date("0004-02-29T10:01:05.800Z"),
            new Date("1204-02-29T10:08:55.060Z"),
            new Date("1889-04-26T05:00:00.000Z"),
            new Date("1900-01-01T00:00:00.000Z"),
            new Date("1906-12-09T12:00:00.000Z"),
            new Date("1912-06-23T09:00:00.000Z"),
            new Date("1948-03-04T22:00:00.000Z"),
            new Date("1970-01-01T00:00:00.000Z"),
            new Date("1991-06-23T23:59:59.999Z"),
            new Date("1994-01-07T04:00:00.000Z"),
            new Date("2000-01-01T00:00:00.000Z"),
            new Date("2002-07-10T20:01:50.100Z"),
            new Date("2012-12-21T23:59:59.999Z"),
            new Date("2016-12-31T23:59:59.000Z"),
            new Date("2018-05-18T18:59:30.121Z"),
            new Date("2038-01-01T00:00:00.000Z"),
            new Date("2038-01-19T03:15:00.000Z"),
            new Date("4000-11-11T05:06:07.089Z"),
            new Date("4100-01-01T12:00:00.000Z"),
            new Date("9001-08-04T02:01:00.555Z"),
        ];
        const dayFormats = [
            "%-m/%-d/%Y",
            "%G-W%V-%u",
            "%-d %B %C %y",
            "%Y%j",
            "%Y-%j",
            "%Y %U %u",
            "%Y %W %u",
            "%C %y %U %a",
        ];
        const secondFormats = [
            "%F %T",
            "%Y-%m-%d %H:%M:%S",
            "%FT%T",
            "%A %-d %B %Y %I:%M:%S %p",
            "%m/%d/%Y %H:%M:%S",
            "%GW%V%uT%H%M%S%z",
            "%Y%m%dT%H%M%S%z",
        ];
        const millisecondFormats = [
            "%Y-%m-%d %H:%M:%S.%L",
            "%C %y %U %a %H %M %S %L",
        ];
        const getAssertMessage = (format, timestamp, expected, actual) => (
            `\nFailed format reversibility for "${format}".` +
            `\nInput date was ${expected.toISOString()}.` +
            `\nIntermediate timestamp was "${timestamp}".` +
            `\nMismatched parse result was ${actual.toISOString()}.`
        );
        function assertDate(format, timestamp, expected, actual){
            assert.deepStrictEqual(actual, expected, getAssertMessage(
                format, timestamp, expected, actual
            ));
        }
        for(let dayFormat of dayFormats){
            this.test(`using format "${dayFormat}"`, function(){
                for(let date of dates){
                    const dayDate = new Date(date);
                    dayDate.setUTCHours(0);
                    dayDate.setUTCMinutes(0);
                    dayDate.setUTCSeconds(0);
                    dayDate.setUTCMilliseconds(0);
                    const timestamp = strftime(date, dayFormat, {tz: 0});
                    const parsed = strptime(timestamp, dayFormat, {tz: 0});
                    assertDate(dayFormat, timestamp, dayDate, parsed);
                }
            });
        }
        for(let secondFormat of secondFormats){
            this.test(`using format "${secondFormat}"`, function(){
                for(let date of dates){
                    const secondDate = new Date(date);
                    secondDate.setUTCMilliseconds(0);
                    const timestamp = strftime(date, secondFormat, {tz: 0});
                    const parsed = strptime(timestamp, secondFormat, {tz: 0});
                    assertDate(secondFormat, timestamp, secondDate, parsed);
                }
            });
        }
        for(let millisecondFormat of millisecondFormats){
            this.test(`using format "${millisecondFormat}"`, function(){
                for(let date of dates){
                    const timestamp = strftime(date, millisecondFormats, {tz: 0});
                    const parsed = strptime(timestamp, millisecondFormats, {tz: 0});
                    assertDate(millisecondFormat, timestamp, date, parsed);
                }
            });
        }
    });
    
    canary.group("strftime inputs other than Date objects", function(){
        this.test("strftime accepts a UTC unix timestamp", function(){
            const date = 1526601600000; // milliseconds since epoch
            assert.equal(strftime(date, "%F %T", {tz: 0}), "2018-05-18 00:00:00");
        });
        this.test("strftime accepts dayjs inputs", function(){
            const date = dayjs('2018-08-08');
            assert.equal(strftime(date, "%F %T", "local"), "2018-08-08 00:00:00");
        });
        this.test("strftime accepts luxon inputs", function(){
            const date = luxon.DateTime.utc(2017, 5, 15);
            assert.equal(strftime(date, "%F %T"), "2017-05-15 00:00:00");
        });
        this.test("strftime accepts moment inputs", function(){
            const date = moment.utc('1995-12-25');
            assert.equal(strftime(date, "%F %T"), "1995-12-25 00:00:00");
        });
        this.test("strftime throws an error for null and undefined inputs", function(){
            assert.throws(() => strftime(null, "%F"), {
                message: "No date input was provided.",
            });
            assert.throws(() => strftime(undefined, "%F"), {
                message: "No date input was provided.",
            });
        });
        this.test("strftime throws an error for other inputs", function(){
            assert.throws(() => strftime("not a date", "%F"), {
                message: "Failed to get Date instance from date input.",
            });
            assert.throws(() => strftime(["not", "a", "date"], "%F"), {
                message: "Failed to get Date instance from date input.",
            });
        });
    });
    
    canary.group("graceful failure states", function(){
        this.test("invalid directives produce a readable error", function(){
            assert.throws(() => strftime(new Date(), "%Y-%m-%d %?"), {
                name: "TimestampParseError",
                message: `Failed with format "%Y-%m-%d %?": Unknown directive "%?".`,
            });
            assert.throws(() => strptime("2000-01-01", "%Y-%m-%?"), {
                name: "TimestampParseError",
                message: `Failed with format "%Y-%m-%?": Unknown directive "%?".`,
            });
        });
        this.test("unterminated directive produces a readable error", function(){
            assert.throws(() => strftime(new Date(), "%"), {
                name: "TimestampParseError",
                message: `Failed with format "%": Found unterminated directive at the end of the format string.`,
            });
            assert.throws(() => strptime("2000-01-01", "%"), {
                name: "TimestampParseError",
                message: `Failed with format "%": Found unterminated directive at the end of the format string.`,
            });
        });
        this.test("parse format is an empty string", function(){
            assert.throws(() => strptime("2000-01-01", ""), {
                name: "TimestampParseError",
                message: `Failed with format "": Empty format string.`,
            });
        });
        this.test("parse format is longer than input timestamp", function(){
            assert.throws(() => strptime("2000-01-01", "%F %T"), {
                name: "TimestampParseError",
                message: `Failed to parse token " " at position [10] in timestamp "2000-01-01" with format "%F %T": Timestamp is too short to match the whole format.`,
            });
        });
        this.test("parse format is shorter than input timestamp", function(){
            assert.throws(() => strptime("2000-01-01 00:00:00", "%F"), {
                name: "TimestampParseError",
                message: `Failed with format "%F": Timestamp is too long for the given format. Text remaining: " 00:00:00".`,
            });
        });
        this.test("parse format with unmatched string literal", function(){
            assert.throws(() => strptime("2000-01-01", "%Y.%m.%d"), {
                name: "TimestampParseError",
                message: `Failed to parse token "." at position [4] in timestamp "2000-01-01" with format "%Y.%m.%d": String literal "." not matched.`,
            });
        });
        this.test("parse format with number out of range", function(){
            assert.throws(() => strptime("-2000 Jan -20", "%Y %b %d"), {
                name: "TimestampParseError",
                message: `Failed to parse token "%d" at position [10] in timestamp "-2000 Jan -20" with format "%Y %b %d": Number cannot be negative.`,
            });
            assert.throws(() => strptime("2000-50-50", "%Y-%m-%d"), {
                name: "TimestampParseError",
                message: `Failed to parse token "%m" at position [7] in timestamp "2000-50-50" with format "%Y-%m-%d": Number [50] is out of bounds [1, 12].`,
            });
        });
        this.group("parse format with invalid timezone data", function(){
            assert.throws(() => strptime("2000-01-01 ?0000", "%F %z"), {
                name: "TimestampParseError",
                message: `Failed to parse token "%z" at position [16] in timestamp "2000-01-01 ?0000" with format "%F %z": Unknown timezone offset sign "?".`,
            });
            assert.throws(() => strptime("2000-01-01 +??:??", "%F %z"), {
                name: "TimestampParseError",
                message: `Failed to parse token "%z" at position [17] in timestamp "2000-01-01 +??:??" with format "%F %z": Failed to parse timezone offset from string "+??:??".`,
            });
        });
        this.group("parse timestamps with invalid names of things", function(){
            this.test("attempt to parse invalid weekday name", function(){
                assert.throws(() => strptime("Someday 2018-01-01", "%A %F"), {
                    name: "TimestampParseError",
                    message: `Failed to parse token "%A" at position [0] in timestamp "Someday 2018-01-01" with format "%A %F": Failed to parse weekday name.`,
                });
            });
            this.test("attempt to parse invalid month name", function(){
                assert.throws(() => strptime("1 NotAMonth 2018", "%-d %B %Y"), {
                    name: "TimestampParseError",
                    message: `Failed to parse token "%B" at position [2] in timestamp "1 NotAMonth 2018" with format "%-d %B %Y": Failed to parse month name.`,
                });
            });
            this.test("attempt to parse invalid AM/PM text", function(){
                assert.throws(() => strptime("2018-01-01 10:00 ??", "%F %I:%M %p"), {
                    name: "TimestampParseError",
                    message: `Failed to parse token "%p" at position [17] in timestamp "2018-01-01 10:00 ??" with format "%F %I:%M %p": Failed to parse AM/PM.`,
                });
            });
            this.test("attempt to parse invalid era name", function(){
                assert.throws(() => strptime("1 Jan 2018 ??", "%-d %b %^Y %#"), {
                    name: "TimestampParseError",
                    message: `Failed to parse token "%#" at position [11] in timestamp "1 Jan 2018 ??" with format "%-d %b %^Y %#": Failed to parse era name.`,
                });
            });
        });
    });
    
    return canary;
};

module.exports = createTests;
