# Directives

Here is complete documention regarding the directives that strtime supports.

## Modifiers

Directives can be modified using special characters.
An unmodified directive looks like `%d`. A modified directive looks like `%-d` or `%_d` or `%:d` or `%^B`.

- `-` Don't pad; i.e. produce `1` when normally `01` would be produced.
- `_` Pad with spaces; i.e. produce ` 1` instead of `01`.
- `^` Switch case (make lowercase if fully upper, uppercase otherwise), or unsigned year %Y for use with era.
- `:` Timezone with ':' delimiter e.g. "+00:00", or number with ordinal e.g. "1st".

The only cases in which a directive with any or no modifier cannot parse a
timestamp produced with the output of any other modifier
(i.e. "%d %m %Y" successfully parses the output of "-d %_m %Y") are:

- `:` is used to produce an ordinal number; e.g. `%:d` can parse the output of `%:d` but not the output of `%d`, `%-d`, or `%_d`. Neither can these differently-modified directives parse the output of `%:d`.
- `^` is used to produce an unsigned year. Either `%Y` or `%^Y` can correctly parse the output of `%^Y`, but only when an era directive `%#` is also present in the timestamp.

## Overview

- `%a` abbreviated weekday name, e.g. "Mon", "Tue"
- `%A` full weekday name, e.g. "Monday", "Tuesday"
- `%b` abbreviated month name, e.g. "Jan", "Feb"
- `%B` full month name, e.g. "January", "February"
- `%c` date and time; same as `%a %b %e %H:%M:%S %Y`
- `%C` century, i.e. "20" when the year is "2018"
- `%d` day of the month (01-31)
- `%D` date; same as `%m/%d/%y`
- `%e` space-padded numeric day of the month; same as `%_d`
- `%f` microsecond in second (000000-999999)
- `%F` ISO 8601 date format; same as `%Y-%m-%d`
- `%g` two-digit ISO 8601 week year, i.e. "18" when the ISO week year is "2018" (00-99)
- `%G` full ISO 8601 week year
- `%h` abbreviated month name; same as `%b`
- `%H` hour number (00-23)
- `%I` hour number (01-12)
- `%j` day of the year (000-366)
- `%k` hour; same as `%H` (00-23)
- `%l` hour; same as `%I` (01-12)
- `%L` millisecond in second (000-999)
- `%m` month number (00-12)
- `%M` minute (00-59)
- `%n` newline character "\n"
- `%p` uppercase AM/PM
- `%P` lowercase am/pm
- `%Q` number of microseconds since epoch
- `%r` 12-hour time; same as `%I:%M:%S %p`
- `%R` 24-hour time; same as `%H:%M`
- `%s` number of seconds since epoch
- `%S` second (normally 00-59; strictly 00-61)
- `%t` tab character "\t"
- `%T` 24-hour time; same as `%H:%M:%S`
- `%v` VMS date; same as `%e-%b-%Y`
- `%V` ISO 8601 week number (01-53)
- `%u` weekday number, starting with Monday (1-7)
- `%U` week number, counting from the first Sunday (0-53)
- `%w` weekday number, starting with Sunday (0-6)
- `%W` week number, counting from the first Monday (0-53)
- `%x` date; same as `%D` and `%m/%d/%y`
- `%X` 24-hour time; same as `%T` and `%H:%M:%S`
- `%y` two-digit year; i.e. "18" when the year is "2018" (00-99)
- `%Y` full year number
- `%z` timezone offset, e.g. "+0100"
- `%Z` timezone name or offset, e.g. "UTC" or "+0100"
- `%+` date; same as `%a %b %e %H:%M:%S %Z %Y`
- `%#` era name, i.e. "CE" or "BCE"
- `%%` literal "%" character

## Details

### Abbreviated weekday name %a

Abbreviated weekday name. Using the default English settings these names are "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", and "Sat".

The weekday names can be changed by passing an options object to **strftime** or **strptime** which includes a `shortWeekdayNames` attribute. The value of this attribute must be an array containing seven abbreviated weekday names, beginning with Sunday and ending with Saturday.

The modified directive `%^a` produces switched-case outputs. With the default English settings, this means the output will be "SUN", "MON", "TUE", and so on.

The `%a` directive, when used in a format for **strptime**, is also able to parse the outputs of the full weekday name directive `%A`. Parsing is case-insensitive. This means that, for example, the string "mOnDay" will be correctly parsed no matter whether the parsing directive is modified or not.

### Full weekday name %A

Full weekday name. Using the default English settings these names are "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", and "Saturday".

The weekday names can be changed by passing an options object to **strftime** or **strptime** which includes a `longWeekdayNames` attribute. The value of this attribute must be an array containing seven full weekday names, beginning with Sunday and ending with Saturday.

The modified directive `%^A` produces switched-case outputs. With the default English settings, this means the output will be "SUNDAY", "MONDAY", "TUESDAY", and so on.

The `%A` directive, when used in a format for **strptime**, is also able to parse the outputs of the abbreviated weekday name directive `%a`. Parsing is case-insensitive. This means that, for example, the string "mOnDay" will be correctly parsed no matter whether the parsing directive is modified or not.

### Abbreviated month name %b

Abbreviated month name. Using the default English settings these names are "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", and "Dec".

The month names can be changed by passing an options object to **strftime** or **strptime** which includes a `shortMonthNames` attribute. The value of this attribute must be an array containing twelve abbreviated month names, beginning with January and ending with December.

The modified directive `%^b` produces switched-case outputs. With the default English settings, this means the output will be "JAN", "FEB", "MAR", and so on.

The `%b` directive, when used in a format for **strptime**, is also able to parse the outputs of the full month name directive `%B`. Parsing is case-insensitive. This means that, for example, the string "jANuARy" will be correctly parsed no matter whether the parsing directive is modified or not.

### Full month name %B

Full month name. Using the default English settings these names are "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", and "December".

The month names can be changed by passing an options object to **strftime** or **strptime** which includes a `longMonthNames` attribute. The value of this attribute must be an array containing twelve full month names, beginning with January and ending with December.

The modified directive `%^B` produces switched-case outputs. With the default English settings, this means the output will be "JANUARY", "FEBRUARY", "MARCH", and so on.

The `%B` directive, when used in a format for **strptime**, is also able to parse the outputs of the abbreviated month name directive `%b`. Parsing is case-insensitive. This means that, for example, the string "jANuARy" will be correctly parsed no matter whether the parsing directive is modified or not.

### Date and time %c

This directive is rewritten as `%a %b %e %H:%M:%S %Y`.

### Century %C

Century number, e.g. `20` when the year is `2018`. The number is padded with zeroes if it is fewer than two digits long. In most practical use cases, this number will be either 19 or 20. However, it is possible for the century number to be outside that range, or even for it to be negative.

Typically, this directive is used in combination with `%y`, the two-digit year directive. It is not safe to use this directive in combination with the ISO week year directive `%g`; doing so will cause the information in the `%C` century directive to be ignored.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Day of the month %d

Day of the month. The number is padded with zeroes if it is fewer than two digits long. The day number is always in the range 01 through 31.

The day of the month can be written using either the `%d` or `%e` directives. Either directive is able to parse day number output written using the other directive.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Date %D

This directive is rewritten as `%m/%d/%y`.

### Space-padded day of the month %e

Day of the month. The number is padded with spaces if it is fewer than two digits long. The day number is always in the range  1 through 31.

The day of the month can be written using either the `%d` or `%e` directives. Either directive is able to parse day number output written using the other directive.

This numeric directive can be modified using the no-padding `-` and ordinal `:` modifiers. To get the day number padded with zeroes instead of with spaces, use the `%d` directive instead.

### Microsecond %f

Microsecond in second. The number is padded with zeroes if it is fewer than six digits long. The microsecond number is always in the range 000000 through 999999.

Realistically, since at the time of writing JavaScript Date objects do not offer any better than millisecond precision, writing a timestamp with a microsecond directive will give only three significant digits followed by zeroes (e.g. `123000` would be written) and parsing a timestamp with a microsecond `%f` directive will erase the trailing three significant digits.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### ISO 8601 date format %F

This directive is rewritten as `%Y-%m-%d`.

### Two-digit ISO 8601 week year %g

Two-digit ISO week year, e.g. `18` when the ISO week year is `2018`. The number is padded with zeroes if it is fewer than two digits long. Normally, this directive should be used in combination with the ISO week number directive `%V` and the weekday number directive `%u`. Please note that the ISO week year may differ from the calendar year `%y`, `%Y` for days of the year before January 4th.

When parsing a two-digit ISO week year, numbers less than or equal to 68 are considered to belong to the 21st century (e.g. `2068`) whereas numbers greater than 68 are considered to belong to the 20th century (e.g. `1969`). To avoid the possibility of reading the wrong year number from a timestamp outside the range 1969-2068, it is better to always write timestamps using the full ISO year directive `%G` instead of the two-digit year `%g`.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

You can refer to the [ISO week date article on Wikipedia](https://en.wikipedia.org/wiki/ISO_week_date) for more information about ISO 8601 week dates.

### Full ISO 8601 week year %G

Full ISO week year. The number is padded with zeroes if it is fewer than four digits long. Normally, this directive should be used in combination with the ISO week number directive `%V` and the weekday number directive `%u`. Please note that the ISO week year may differ from the calendar year `%y`, `%Y` for days of the year before January 4th. Note also that it is possible for the ISO week year to be negative.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

You can refer to the [ISO week date article on Wikipedia](https://en.wikipedia.org/wiki/ISO_week_date) for more information about ISO 8601 week dates.

### Abbreviated month name %h

This directive is identical to the [abbreviated month name `%b` directive](#user-content-abbreviated-month-name-b).

### Hour number (24-hour) %H

Hour number on a 24-hour clock. The number is padded with spaces if it is fewer than two digits long. The hour number is always in the range 00 through 23.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Hour number (12-hour) %I

Hour number on a 12-hour clock. The number is padded with spaces if it is fewer than two digits long. The hour number is always in the range 01 through 12. Normally, this directive should be used in combination with the AM/PM directive `%p` or `%P`.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Day of the year %j

Ordinal day number in the year. The number is padded with zeroes if it is fewer than three digits long. The day number is always in the range 000 through 366.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Hour number (24-hour) %k

This directive is identical to the [hour number (24-hour) `%H` directive](#user-content-hour-number-24-hour-h).

### Hour number (12-hour) %l

This directive is identical to the [hour number (12-hour) `%I` directive](#user-content-hour-number-12-hour-i).

### Millisecond %L

Millisecond in second. The number is padded with zeroes if it is fewer than three digits long. The microsecond number is always in the range 000 through 999.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Month number %m

Month number. The number is padded with spaces if it is fewer than two digits long. The month number is always in the range 01 through 12.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Minute %M

Minute number. The number is padded with spaces if it is fewer than two digits long. The minute number is always in the range 00 through 59.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Newline character %n

This directive literally writes the newline character `\n` when formatting a date with **strftime** and matches the same newline character when parsing a timestamp using **strptime**.

### Uppercase AM/PM %p

Uppercase AM/PM text. Using the default English settings these strings are "AM" for times before noon and "PM" for noon and times after noon but before midnight. Normally, this directive is used in combination with the 12-hour hour number directive `%I`.

The AM/PM strings can be changed by passing an options object to **strftime** or **strptime** which includes a `meridiemNames` attribute. The value of this attribute must be an array two elements, an AM equivalent and then a PM equivalent. The strings given here are written with their original capitalization when using this `%p` directive.

The modified directive `%^p` produces switched-case outputs. With the default English settings, this means the output will be "am" or "pm". Note that, with the default English settings, this is the same result as using the lowercase am/pm `%P` directive.

The `%p` directive, when used in a format for **strptime**, is also able to parse the outputs of the lowercase am/pm directive `%P`. Parsing is case-insensitive. This means that, for example, the string "Pm" will be correctly parsed no matter whether the parsing directive is modified or not.

### Lowercase am/pm %P

Lowercase am/pm text. Using the default English settings these strings are "am" for times before noon and "pm" for noon and times after noon but before midnight. Normally, this directive is used in combination with the 12-hour hour number directive `%I`.

The am/pm strings can be changed by passing an options object to **strftime** or **strptime** which includes a `meridiemNames` attribute. The value of this attribute must be an array two elements, an AM equivalent and then a PM equivalent. The strings given here are written after conversion to lowercase when using this `%P` directive.

The modified directive `%^P` produces switched-case outputs. With the default English settings, this means the output will be "AM" or "PM". Note that, with the default English settings, this is the same result as using the uppercase AM/PM `%p` directive.

The `%P` directive, when used in a format for **strptime**, is also able to parse the outputs of the uppercase AM/PM directive `%o`. Parsing is case-insensitive. This means that, for example, the string "Pm" will be correctly parsed no matter whether the parsing directive is modified or not.

### Microseconds since epoch %Q

The number of microseconds that have elapsed since [00:00:00 on 1 January 1970](https://en.wikipedia.org/wiki/Unix_time) in the timezone that the timestamp applies to.

Realistically, since at the time of writing JavaScript Date objects do not offer any better than millisecond precision, writing a timestamp with a microsecond directive will be followed by three zeroes, and parsing a timestamp with a microseconds `%Q` directive will erase the trailing three significant digits.

This numeric directive can be modified using the ordinal `:` modifier. However, since it is not padded, the no-padding `-` and space-padding `_` modifiers are not applicable to this directive.

### 12-hour time %r

This directive is rewritten as `%I:%M:%S %p`.

### 24-hour time %R

This directive is rewritten as `%H:%M`.

### Seconds since epoch %s

The number of seconds that have elapsed since [00:00:00 on 1 January 1970](https://en.wikipedia.org/wiki/Unix_time) in the timezone that the timestamp applies to.

This numeric directive can be modified using the ordinal `:` modifier. However, since it is not padded, the no-padding `-` and space-padding `_` modifiers are not applicable to this directive.

### Second %S

Second number. The number is padded with spaces if it is fewer than two digits long. The second number is normally in the range 00 through 59 and always in the range 00 through 61.

The second number may be 60 in the case of a [leap second](https://en.wikipedia.org/wiki/Leap_second), which occur every few years. The posix standard originally allowed for the possibility of [double leap seconds](https://www.ucolick.org/~sla/leapsecs/onlinebib.html), and this is why a value of 61 is also accepted. However, there have never been two successive leap seconds in the past and this is unlikely to occur in the future.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Tab character "\t" %t

This directive literally writes the horizontal tab character `\t` when formatting a date with **strftime** and matches the same tab character when parsing a timestamp using **strptime**.

### 24-hour time %T

This directive is rewritten as `%H:%M:%S`.

### VMS date %v

This directive is rewritten as `%e-%b-%Y`.

### ISO 8601 week number %V

ISO 8601 week number. Normally, this directive should be used in combination with the ISO week year directive `%G` and the weekday number directive `%u`. This number is always in the range 01 through 53. It is padded with zeroes if it is fewer than two digits long.

You can refer to the [ISO week date article on Wikipedia](https://en.wikipedia.org/wiki/ISO_week_date) for more information about ISO 8601 week dates.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Weekday number %u

The weekday number, starting with Monday and ending with Sunday. The number is always in the range 1 through 7.

Note that you will get the same results parsing a weekday number with the `%u` directive regardless of whether the timestamp was written with the `%u` or the `%w` weekday number directive.

This numeric directive can be modified using the ordinal `:` modifier. However, since it is not padded, the no-padding `-` and space-padding `_` modifiers are not applicable to this directive.

### Week number %U

The week number, starting from the first Sunday in the year. Days of the year that come before the first Sunday are considered to be in week zero. The number is padded with zeroes if it is fewer than two digits long. The week number is always in the range 00 through 53.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Weekday number %w

The weekday number, starting with Sunday and ending with Saturday. The number is always in the range 0 through 6.

Note that you will get the same results parsing a weekday number with the `%w` directive regardless of whether the timestamp was written with the `%u` or the `%w` weekday number directive.

This numeric directive can be modified using the ordinal `:` modifier. However, since it is not padded, the no-padding `-` and space-padding `_` modifiers are not applicable to this directive.

### Week number %W

The week number, starting from the first Monday in the year. Days of the year that come before the first Monday are considered to be in week zero. The number is padded with zeroes if it is fewer than two digits long. The week number is always in the range 00 through 53.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Date %x

This directive is rewritten as `%m/%d/%y`.

### 24-hour time %X

This directive is rewritten as `%H:%M:%S`.

### Two-digit year %y

Two-digit calendar year number, e.g. `18` when the year is `2018`. The number is padded with zeroes if it is fewer than two digits long.

When parsing a two-digit year number in a timestamp that does not also have a century number `%C`, numbers less than or equal to 68 are considered to belong to the 21st century (e.g. `2068`) whereas numbers greater than 68 are considered to belong to the 20th century (e.g. `1969`). To avoid the possibility of reading the wrong year number from a timestamp outside the range 1969-2068, it is better to always write timestamps using the full calendar year directive `%Y` instead of the two-digit year `%y`.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

### Full year number %Y

Full calendar year number. The number is padded with zeroes if it is fewer than four digits long. Note that it's possible for the year number to be negative.

Like other numeric directives, this one can be modified using the no-padding `-`, space-padding `_`, and ordinal `:` modifiers.

Negative year numbers are also padded to four digits, e.g. `-0099` when the calendar year number was -99 and the number was zero-padded or ` -99` when the number was space-padded.

The full calendar year can also be made unsigned using the `^` modifier, i.e. `%^Y`. This is intended to be used in combination with the era directive `%#`, such that a calendar year of 0 produces outputs like `1 BCE` and a calendar year of -99 produces outputs like `100 BCE`. Note that this seemingly off-by-one scheme conforms to the [ISO 8601 standard](https://en.wikipedia.org/wiki/Year_zero#ISO_8601), in which year zero represents 1 BCE.

### Timezone offset %z

Timezone offset in hours and minutes. The offset is represented as a sign followed by two hour digits and then two minute digits. The hour and minute digits may optionally be delimited by a colon ":". For example, different offsets might be written as `+0130` or `-02:00`. The **strptime** function also recognizes the sign "±" for offset 00:00, but **strftime** will never write this character.

The `:` modifier indicates whether the timezone offset should be formatted with a delimiter or not. When passing a format string to **strftime**, the modified `%:z` directive would write `+01:00` where the unmodified `%z` directive would write `+0100`.

### Timezone name or offset %Z

Timezone name, or offset in hours and minutes. The offset is represented in the same way as with the [timezone offset `%z` directive](#user-content-timezone-offset-z). However, when parsing a timestamp, abbreviations such as `UTC`, `EEST`, or `EDT` will also be recognized. The complete list of recognized abbreviations and their associated offsets can be found in the [`timezone-names.js` source file](https://github.com/pineapplemachine/strtime-js/blob/master/src/timezone-names.js).

Note that IANA timezone names such as `America/Los_Angeles` or `Europe/Paris` are not currently recognized, although this may change in the future.

When writing a format with **strftime** which includes the `%Z` directive, the only timezone name that is written is "UTC" when the offset is zero. Otherwise, the offset is written in the same manner as the timezone offset `%z` directive.

The `:` modifier indicates whether the timezone offset should be formatted with a delimiter or not. When passing a format string to **strftime**, the modified `%:Z` directive would write `+01:00` where the unmodified `%Z` directive would write `+0100`.

### Date %+

This directive is rewritten as `%a %b %e %H:%M:%S %Z %Y`.

### Era name %#

Era name, i.e. "CE" or "BCE" with the default English language settings. This should normally be used in combination with the unsigned calendar year directive `%^Y`

The "CE" and "BCE" strings can be changed by passing an options object to **strftime** or **strptime** which includes an `eraNames` attribute. The value of this attribute must be an array two elements, a "CE" equivalent and then a "BCE" equivalent.

The `^` modifier can be used to write switch-cased outputs, e.g. "ce" and "bce" with the default English language settings.

The `%#` directive, when used in a format for **strptime**, is case-insensitive. This means that, for example, the string "cE" will be correctly parsed no matter whether the parsing directive is modified or not.

### Literal "%" character %%

This directive literally writes the percent character `%` when formatting a date with **strftime** and matches the same percent character when parsing a timestamp using **strptime**.
