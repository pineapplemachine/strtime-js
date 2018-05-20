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
        `Failed to parse format "${this.format}": ${this.reason}`
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

module.exports = TimestampParseError;
