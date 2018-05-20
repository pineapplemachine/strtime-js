# Directives

Here is complete documention regarding the directives that strtime supports.

## Modifiers

- `-` Don't pad; i.e. produce `1` when normally `01` would be produced.
- `_` Pad with spaces; i.e. produce ` 1` instead of `01`.
- `^` Switch case (make lowercase if fully upper, uppercase otherwise), or unsigned year %Y for use with era.
- `:` Timezone with ':' delimiter e.g. "+00:00", or number with ordinal e.g. "1st".

The only cases in which a directive with any or no modifier cannot parse a
timestamp produced with the output of any other modifier
(i.e. "%d %m %Y" successfully parses the output of "-d %_m %Y") are:

- `:` is used to produce an ordinal number; e.g. only `%:d` can parse the output of `%:d`.
- `^` is used to produce an unsigned year. Only `%^Y` can correctly parse the output of `%^Y`, and then only when an era directive `%#` is also present in the timestamp.

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
- `%F` ISO 8601 format; same as `%Y-%m-%d`
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
- `%p` uppercase AM/PM
- `%P` lowercase am/pm
- `%Q` number of microseconds since epoch
- `%r` 12-hour time; same as `%I:%M:%S %p`
- `%R` 24-hour time; same as `%H:%M`
- `%s` number of seconds since epoch
- `%S` second (normally 00-59; strictly 00-61)
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
- `%+` date; same as "%a %b %e %H:%M:%S %Z %Y"
- `%#` era name, i.e. "CE" or "BCE"
