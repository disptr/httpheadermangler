# ![HTTP Header Mangler Icon](https://raw.githubusercontent.com/disptr/httpheadermangler/master/legacy/icon.png) HTTP Header Mangler

HTTP Header Mangler is a Firefox add-on which inserts HTTP headers on a per host basis.

Matching hosts is done with either simple strings or regular expressions.

Rules can have multiple headers apply to multiple hosts, or simply insert a single header for a single host. 

## Installation

Using Firefox, install it from https://addons.mozilla.org/en-US/firefox/addon/http-header-mangler/.

## How to write rules

A rule is made up of contiguous lines of text.

Each line of a rule defines one of two things:
* a simple string or regular expression for matching a host
* an HTTP header expressed as `Name=Value`

To qualify as a rule and not be ignored, at least one of each of the above must be present.

All headers defined in a rule will apply to each and every matching host for that same rule.

A newline acts as a delimiter for rules.

Comments are defined as lines starting with the `#` sign, and are ignored.

Whitespace at the beginning and the end of a line is ignored. Consequently, indentation is ignored. Whitespace at the beginning and the end of a header name or value is also ignored, meaning it will be removed from said name or value.

### Example of rules

	example.com
	.*regexp\d+
	# This is a comment.
	X-Forwarded-For=10.11.12.13
	
	# Delete headers using "" or ''.
	X-Forwarded-For=""
	X-Forwarded-For=''

		# Indentation is allowed.
		foobar
	# Formatting with whitespace is allowed.
	X-Forwarded-For    =    100.101.102.103
	User-Agent         =    Mozilla/3.0 (X11; I; AIX 2)

	# Here's an incomplete rule, which will be ignored.
	Accept-Language=en-US,en;q=0.5
