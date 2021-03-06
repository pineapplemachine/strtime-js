# strtime

[![MIT License][license-image]][license] [![Build Status][travis-image]][travis-url] [![NPM version][npm-version-image]][npm-url]

The strtime package provides native JavaScript implementations of the
**strftime** and **strptime** functions.
It supports most of the combined features of
[Python](http://strftime.org/),
[Ruby](https://apidock.com/ruby/DateTime/strftime),
and [GNU C](https://www.gnu.org/software/libc/manual/html_node/Formatting-Calendar-Time.html)
strftime and strptime functions.
It's possible to write and parse calendar dates (e.g. `%Y-%m-%d`),
week dates (e.g. `%G-W%V-%u`), and ordinal dates (e.g. `%Y-%j`).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/pineapplemachine/strtime-js/blob/master/LICENSE

[travis-url]: https://travis-ci.org/pineapplemachine/strtime-js
[travis-image]: https://travis-ci.org/pineapplemachine/strtime-js.svg?branch=master

[npm-url]: https://www.npmjs.com/package/strtime
[npm-version-image]: https://badge.fury.io/js/strtime.svg

## Installation

You can add the strtime package to your project using a JavaScript package manager such as [npm](https://www.npmjs.com/get-npm).

``` text
npm install --save strtime
```

## Directives

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

## Advanced usage

### Timezone output with strftime

The **strftime** function defaults to writing a UTC timestamp.
You can specify which timezone should be used by passing it as an argument. Timezones are accepted as numeric offsets or as abbreviations such as `UTC` or `EDT` or `EEST`. Offsets between and including -16 and +16 are interpreted as hour offsets. Other offset values are interpreted as minute offsets. You can also use the string `local` to use the local timezone.

``` js
// Prints "2000-01-01 12:00:00 GMT+0000"
console.log(strftime(new Date("2000-01-01T12:00:00Z"), "%Y-%m-%d %H:%M:%S GMT%z"));

// Prints "2000-01-01 14:00:00 GMT+0200"
console.log(strftime(new Date("2000-01-01T12:00:00Z"), "%Y-%m-%d %H:%M:%S GMT%z", +2));

// Prints "2000-01-01 08:00:00 GMT-0400"
console.log(strftime(new Date("2000-01-01T12:00:00Z"), "%Y-%m-%d %H:%M:%S GMT%z", "EDT"));
```

### Timezone assumption with strptime

The **strptime** function assumes that a timestamp represents a UTC date if no timezone is specified in that timestamp.
You can specify what timezone should be assumed for timestamps which do not
contain an explicit timezone by passing it as an argument. The strptime function accepts timezones arguments in the same way that strftime does.

``` js
// Prints e.g. "2000-01-01T12:00:00.000Z"
const date = strptime("2000-01-01 12:00:00", "%Y-%m-%d %H:%M:%S");
console.log(date.toISOString());

// Prints "2000-01-01T10:00:00.000Z" due to the +2 hours offset
const date = strptime("2000-01-01 12:00:00", "%Y-%m-%d %H:%M:%S", +2);
console.log(date.toISOString());
```

### Locale-dependent strings

The **strftime** and **strptime** functions default to English weekday names,
month names, and ordinals.
However, it is possible to specify different text by passing an options object.

The options object attributes which are recognized for this purpose are:

- **shortWeekdayNames**: A list of abbreviated weekday names, e.g. "Sun", "Mon".
- **longWeekdayNames**: A list of full weekday names, e.g. "Sunday", "Monday".
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
console.log(strftime(new Date("2000-01-01"), "%-d %B %Y", +0, {
    longMonthNames: monthNames
}));
```
