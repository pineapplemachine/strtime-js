# strtime

The strtime package provides native JavaScript implementations of the
**strftime** and **strptime** functions.
It supports most of the combined features of
[Python](http://strftime.org/),
[Ruby](https://apidock.com/ruby/DateTime/strftime),
and [GNU C](https://www.gnu.org/software/libc/manual/html_node/Formatting-Calendar-Time.html)
strftime and strptime functions.
It's possible to write and parse calendar dates (e.g. `%Y-%m-%d`),
week dates (e.g. `%G-W%V-%u`), and ordinal dates (e.g. `%Y-%j`).

## Installation

You can add the strtime package to your project using a JavaScript package manager such as [npm](https://www.npmjs.com/get-npm).

``` text
npm install --save strtime
```

# Directives

You can read complete documentation regarding the directives which strtime
supports (e.g. `%Y`, `%b`) and how they behave in [directives.md](directives.md).

## Basic usage

The **strftime** function accepts
[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) objects,
unix timestamps (as milliseconds since UTC epoch),
[moment](https://www.npmjs.com/package/moment) datetime objects,
[luxon](https://www.npmjs.com/package/luxon) datetime objects, and
[dayjs](https://www.npmjs.com/package/dayjs) datetime objects.
The **strptime** function always outputs a Date object.

``` js
const strftime = require("strtime").strftime;
const strptime = require("strtime").strptime;

// Prints "2000-01-01T00:00:00.000Z"
console.log(strftime(new Date("2000-01-01"), "%Y-%m-%dT%H:%M:%S.%LZ"));

// Prints "2000-01-01T00:00:00.000Z"
const date = strptime("2000-01-01T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%LZ");
console.log(date.toISOString());
```

# Advanced usage

## Timezone output with strftime

The **strftime** function uses the inputted Date object's local timezone offset by
default.
This behavior changes when the timestamp ends with a Zulu indicator ("Z"),
for example in `%Y-%m-%dT%H:%M%SZ`; in this case it defaults to using UTC.
You can specify which timezone should be used by passing it as an argument.

``` js
// Prints e.g. "2000-01-01 14:00:00 GMT+0200"
console.log(strftime(new Date("2000-01-01T12:00:00Z"), "%Y-%m-%d %H:%M:%S GMT%z"));

// Prints "2000-01-01 12:00:00 GMT+0000"
console.log(strftime(new Date("2000-01-01T12:00:00Z"), "%Y-%m-%d %H:%M:%S GMT%z", +0));

// Prints "2000-01-01 08:00:00 GMT-0400"
console.log(strftime(new Date("2000-01-01T12:00:00Z"), "%Y-%m-%d %H:%M:%S GMT%z", "EDT"));
```

## Timezone assumption with strptime

The **strptime** function assumes that a timestamp represents a date in the local
timezone if no timezone is specified in that timestamp.
Timestamps ending with a Zulu indicator ("Z"), for example in `%Y-%m-%dT%H:%M%SZ`,
are assumed to be UTC.
You can specify what timezone should be assumed for timestamps which do not
contain an explicit timezone by passing it as an argument.

``` js
// Prints e.g. "2000-01-01T10:00:00.000Z" - due to the local offset of GMT+0200
const date = strptime("2000-01-01 12:00:00", "%Y-%m-%d %H:%M:%S");
console.log(date.toISOString());

// Prints "2000-01-01T12:00:00.000Z"
const date = strptime("2000-01-01 12:00:00", "%Y-%m-%d %H:%M:%S", +0);
console.log(date.toISOString());
```

## Locale-dependent strings

The **strftime** and **strptime** functions default to english weekday names,
month names, and ordinals.
However, it is possible to specify different text by passing an options object.

The options object attributes which are recognized for this purpose are:

- **shortWeekdayNames**: A list of abbreviated weekday names, e.g. "Mon", "Tue".
- **longWeekdayNames**: A list of full weekday names, e.g. "Monday", "Tuesday".
- **shortMonthNames**: A list of abbreviated month names, e.g. "Jan", "Feb".
- **longMonthNames**: A list of full month names, e.g. "January", "February".
- **eraNames**: A list of era names, e.g. "CE", "BCE".
- **meridiemNames**: A list of meridiem strings, e.g. "AM", "PM".
- **ordinalTransform**: A function accepting a number and outputting an ordinal suffix, e.g. 1 => "st".

``` js
const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

// Prints "1 enero 2000"
console.log(strftime(new Date("2000-01-01"), "%-d %B %Y", +0, {longMonthNames: monthNames}));
```
