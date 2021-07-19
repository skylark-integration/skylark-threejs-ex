define(function () {
    'use strict';

    const CodeSerializationInstruction = function (name, fullName) {
        this.name = name;
        this.fullName = fullName;
        this.code = null;
        this.removeCode = false;
    };
    CodeSerializationInstruction.prototype = {
        constructor: CodeSerializationInstruction,
        getName: function () {
            return this.name;
        },
        getFullName: function () {
            return this.fullName;
        },
        setCode: function (code) {
            this.code = code;
            return this;
        },
        getCode: function () {
            return this.code;
        },
        setRemoveCode: function (removeCode) {
            this.removeCode = removeCode;
            return this;
        },
        isRemoveCode: function () {
            return this.removeCode;
        }
    };

    return  CodeSerializationInstruction;
});