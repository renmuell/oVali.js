/**
 * _oVali.js
 *
 * @author Rene Müller <rene.mueller.md@gmail.com>
 */

/*global module */

if (!Array.prototype.flatten) {
    Object.defineProperty(Array.prototype, 'flatten', {
        value: function() {

        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        return Object(this).reduce(function (result, current) {
            return result.concat(Array.isArray(current) ? current.flatten() : current);
        }, []);
        },
        configurable: true,
        writable: true
    });
}

var oVali = (function(){

    /**
     *  
     * @private
     */
    var TYPES = {
        correct         : "correct",
        propertyWith    : "propertyWith",
        shouldBe        : "shouldBe",
        notContain      : "notContain",
        optionalNotIn   : "optionalNotIn",
        extraProperty   : "extraProperty"
    };

    var LITERALS = [
        "number",
        "string",
        "object",
        "array",
        "boolean",
        "undefined"
    ];

    /**
     *  
     * @private
     */
    var _oVali = {

        /**
         *  
         * @private
         */
        schemas: {},

        /* type */

        /**
         *  
         * @private
         * @param {*} value 
         */
        object  : function (value) { return typeof value === "object";  },

        /**
         *  
         * @private
         * @param {*} value 
         */
        string  : function (value) { return typeof value === "string";  },

        /**
         *  
         * @private
         * @param {*} value 
         */
        number  : function (value) { return typeof value === "number";  },

        /**
         *  
         * @private
         * @param {*} value 
         */
        boolean : function (value) { return typeof value === "boolean"; },

        /**
         *  
         * @private
         * @param {*} value 
         */
        array   : function (value) { return Array.isArray(value);       },

        /**
         * 
         * @private
         * @param {*} value 
         */
        undefined: function (value) { return typeof value === "undefined"; },

        /**
         * 
         * @private
         * @param {*} object 
         */
        getType: function (object) {
            return _oVali.undefined(object) ? "undefined" 
                : _oVali.array(object)      ? "array"
                : _oVali.boolean(object)    ? "boolean"
                : _oVali.number(object)     ? "number"
                : _oVali.string(object)     ? "string"
                : _oVali.object(object)     ? "object"
                : "?";
        },

        /* schema add/is/get */

        /**
         *  
         * @private
         * @param {*} name 
         * @param {*} definition 
         */
        addSchema: function (name, definition) { 
            return _oVali.schemas[name] = definition;
        },

        /**
         *  
         * @private
         * @param {*} value 
         */
        getSchemaWithoutOptional: function (value) { 
            return value[0] === "?" ? value.substr(1) : value;
        },

        /**
         *  
         * @private
         * @param {*} value 
         */
        getSchemaWithoutSubSchema: function (value) { 
            return value.indexOf("/") > -1 ? value.substr(0, value.indexOf("/")) : value;
        },

        /**
         *  
         * @private
         * @param {*} value 
         */
        getSchemaSubSchema: function (value) { 
            return value.indexOf("/") > -1 ? value.substr(value.indexOf("/") + 1) : value;
        },

        /**
         *  
         * @private
         * @param {*} value 
         */
        getSchema: function (value) { 
            return _oVali.getSchemaWithoutOptional(
                    _oVali.getSchemaWithoutSubSchema(
                        value));
        },

        /**
         *  
         * @private
         * @param {*} value 
         */
        isSchemaOptional: function (value) { return value[0] === '?'; },

        /**
         *  
         * @private
         * @param {*} value 
         */
        isSchemaWithSubSchema: function (value) { return value.indexOf("/") > -1; },

        /* sub-schema */

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        checkSubSchemaInner: function (object, schema, options){ 
            return (_oVali.schemas[schema])
                    ? _oVali.array(object)
                        ? _oVali.checkArray(object, _oVali.schemas[schema], options)
                        : _oVali.check(object, _oVali.schemas[schema], options)
                    : _oVali.checkArray(object, schema, options);
        },

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        checkSubSchema: function (object, schema, options) {
            return Object
                    .keys(schema)
                    .map(function (key) { 
                        return (_oVali.isSchemaWithSubSchema(schema[key]) && object[key])
                                ? _oVali.checkSubSchemaInner(
                                    object[key], 
                                    _oVali.getSchemaSubSchema(schema[key]), 
                                    options)
                                : undefined;})
                    .flatten()
                    .filter(function (error) { return error !== undefined;});
        },

        /* extra property */

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         */
        getExtraProperties: function (object, schema) {
            return Object
                    .keys(object)
                    .filter(function (key) { return !Object.keys(schema).includes(key);});
        },

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        checkExtraProperties: function (object, schema, options) { 
            return typeof options.showExtraProperties !== "undefined" 
                        && !options.showExtraProperties
                    ? []
                    : _oVali
                        .getExtraProperties(object, schema)
                        .map(function (key) { 
                            return ({ 
                                type: TYPES.extraProperty, 
                                key:key, 
                                object:object, 
                                value:object[key], 
                                schema: schema,
                                expected: undefined,
                                actual: _oVali.getType(object[key])
                            });
                        });
        },

        /* optionals */

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} key 
         * @param {*} schema 
         * @param {*} options 
         */
        getSchemaOptional: function (object, key, schema, options) { 
            return (typeof object[key] === "undefined") 
                    && (typeof options.showMissingOptionals !== "undefined" 
                        && options.showMissingOptionals)
                    && _oVali.isSchemaOptional(schema[key])
                    ? { 
                        type:TYPES.optionalNotIn, 
                        key:key, 
                        value:undefined, 
                        object: object, 
                        schema: schema,
                        expected: _oVali.getSchema(schema[key]),
                        actual: undefined
                    }
                    : undefined;
        },

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        getSchemaOptionals: function (object, schema, options) { 
            return Object
                    .keys(schema)
                    .map(function (key) { return _oVali.getSchemaOptional(object, key, schema, options);})
                    .filter(function (message) { return message !== undefined;});
        },

        /* errors */

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} key 
         * @param {*} schema 
         * @param {*} options 
         */
        getSchemaError: function (object, key, schema, options) {  
            return (typeof object[key] === "undefined") 
                    ? !_oVali.isSchemaOptional(schema[key])
                        ? typeof options.shownotContain === "undefined" 
                            || options.shownotContain
                            ? { 
                                type: TYPES.notContain, 
                                object:object, 
                                value:undefined, 
                                key:key,
                                schema:schema,
                                expected: _oVali.getSchema(schema[key]),
                                actual: undefined
                            }
                            : undefined
                        : undefined
                    : { 
                        type: TYPES.shouldBe, 
                        object:object, 
                        value:object[key], 
                        key:key, 
                        schema:schema,
                        expected: _oVali.getSchema(schema[key]),
                        actual: _oVali.getType(object[key])
                    };
        },

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        getSchemaErrors: function (object, schema, options) { 
            return Object
                    .keys(schema)
                    .filter(function (key) { return !_oVali[_oVali.getSchema(schema[key])](object[key]);})
                    .map(function (key) { return _oVali.getSchemaError(object, key, schema, options);})
                    .filter(function (message) { return message !== undefined;});
        },

        /* correct */

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        getSchemaCorrect: function (object, schema, options) { 
            return typeof options.showCorrect === "undefined" || !options.showCorrect 
                    ? []
                    : Object
                        .keys(schema)
                        .filter(function (key) { return _oVali[_oVali.getSchema(schema[key])](object[key]);})
                        .map(function (key) { 
                            return { 
                                type:TYPES.correct, 
                                key:key, 
                                value:object[key], 
                                object: object, 
                                schema: schema,
                                expected: _oVali.getSchema(schema[key]),
                                actual: _oVali.getType(object[key]) 
                            };
                        });
        },

        /* check */

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        checkSchema: function (object, schema, options) {
            return _oVali.getSchemaCorrect(object, schema, options)
                    .concat(_oVali.getSchemaErrors(object, schema, options))
                    .concat(_oVali.getSchemaOptionals(object, schema, options))
        },

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} options 
         */
        check: function (object, schema, options) {
            return _oVali
                    .checkSchema(object, schema, options||{})
                    .concat(_oVali.checkExtraProperties(object, schema, options||{}))
                    .concat(_oVali.checkSubSchema(object,schema, options||{}));
        },

        /* findPropertiesWithPattern */

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} pattern 
         */
        findPropertiesWithPattern: function (object, schema, pattern) {
            return _oVali.getPropertiesWithPattern(object, schema, pattern);
        },

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} schema 
         * @param {*} pattern 
         */
        getPropertiesWithPattern: function (object, schema, pattern) { 
            return Object
                    .keys(schema)
                    .map(function (key) { 
                        return _oVali.getPropertyWithPattern(object, key, schema, pattern);
                    })
                    .filter(function (message) { return message !== undefined;});
        },

        /**
         *  
         * @private
         * @param {*} object 
         * @param {*} key 
         * @param {*} schema 
         * @param {*} pattern 
         */
        getPropertyWithPattern: function (object, key, schema, pattern) {
            return ((typeof object[key] === "string") && (object[key].indexOf(pattern) > -1))
                    ? { 
                        type: TYPES.propertyWith, 
                        object: object, 
                        value: object[key], 
                        key: key, 
                        schema: schema,
                        pattern: pattern 
                    }
                    : undefined;
        },

        /* check array */

        /**
         *  
         * @private
         * @param {*} array 
         * @param {*} type 
         * @param {*} options 
         */
        checkFlatArrayCorrects: function (array, type, options) { 
            return typeof options.showCorrect === "undefined" || !options.showCorrect 
                    ? []
                    : array
                        .filter(function(value){ return _oVali[type](value);})
                        .map(function(value, index){ 
                            return { 
                                type:TYPES.correct, 
                                key: index, 
                                value:value, 
                                object:array, 
                                schema: type,
                                expected: type,
                                actual: _oVali.getType(value) 
                            };
                        });
        },

        /**
         *  
         * @private
         * @param {*} array 
         * @param {*} type 
         */
        checkFlatArrayErrors: function (array, type) {
            return array
                    .filter(function(value){ return !_oVali[type](value);})
                    .map(function(value, index){ 
                        return { 
                            type:TYPES.shouldBe, 
                            key: index, 
                            value:value, 
                            object:array, 
                            schema: type,
                            expected: type,
                            actual: _oVali.getType(value) 
                        };
                    });
        },

        /**
         *  
         * @private
         * @param {*} array 
         * @param {*} type 
         * @param {*} options 
         */
        checkFlatArray: function (array, type, options) {
            return _oVali.checkFlatArrayCorrects(array, type, options)
                    .concat(_oVali.checkFlatArrayErrors(array, type, options));
        },

        /**
         *  
         * @private
         * @param {*} array 
         * @param {*} schema 
         * @param {*} options 
         */
        checkFatArray: function (array, schema, options) { 
            return [].concat.apply([], 
                    array.map(function(item){ return _oVali.check(item, schema, options);}));
        },

        /**
         *  
         * @private
         * @param {*} array 
         * @param {*} schema 
         * @param {*} options 
         */
        checkSubSchemaArray: function (array, schema, options) {
            return [].concat.apply([], 
                array.map(function(array){ 
                    return _oVali.checkArray(array, _oVali.getSchemaSubSchema(schema), options);
                }))
        },

        /**
         * 
         * @private
         * @param {*} array 
         * @param {*} schemaOrType 
         * @param {*} options 
         */
        checkArray: function (array, schemaOrType, options) {
            return (typeof schemaOrType === "string")
                    ? ((_oVali.isSchemaWithSubSchema(schemaOrType)) 
                        ? _oVali.checkSubSchemaArray(array, schemaOrType, options)
                        : _oVali.checkFlatArray(array, schemaOrType, options))
                    : _oVali.checkFatArray(array, schemaOrType, options);
        }
    };

    var oVali = {

        /**
         * 
         * @public
         */
        TYPES:TYPES,

        /**
         * 
         * @public
         */
        LITERALS: LITERALS,

        /**
         *  Check object with schema.
         * 
         *  @public
         *  @param {object} object
         *  @param {object} schema {
         *    "propertyName": string -> 
         *      "number" , "string" , "array" , "object" , "boolean"                            //must exist
         *      "?number", "?string", "?array", "?object", "?boolean"                           //optional
         *      "array/number", "array/string", "array/array", "array/object", "array/boolean"  //sub-schema
         *  }
         *  @param {object} options {
         *    showCorrect          : boolean:false
         *    shownotContain       : boolean:true
         *    showExtraProperties  : boolean:true
         *    showMissingOptionals : boolean:false
         *  } 
         *  
         *  @return {array<object>} {
         *    type: "correct"
         *          "notContain"
         *          "shouldBe"
         *          "propertyWith"
         *          "optionalNotIn"
         *          "extraProperty",
         *    value: mixed,
         *    key: string
         *    object: object/array
         *    schema: string/object
         *    pattern: string
         *  }
         */
        check: function (object, schema, options) {
            return _oVali.string(schema) && LITERALS.includes(schema)
                ? _oVali.getType(object) === schema 
                    ? []
                    : [{ 
                        type: TYPES.shouldBe, 
                        object:undefined, 
                        value:object, 
                        key:undefined, 
                        schema:schema,
                        expected: _oVali.getSchema(schema),
                        actual: _oVali.getType(object)
                    }]
                : (_oVali.array(object) 
                    ? ((_oVali.schemas[_oVali.getSchemaSubSchema(schema)]) 
                        ? _oVali.checkArray(object, _oVali.schemas[_oVali.getSchemaSubSchema(schema)], options)
                        : _oVali.checkArray(object, _oVali.getSchemaSubSchema(schema), options))
                    : _oVali.check(object, schema, options));
        },

        /**
         * 
         * @param {*} json 
         * @param {*} schema 
         * @param {*} options 
         */
        checkJson: function (json, schema, options) {
            return oVali.check(JSON.parse(json), schema, options);
        },

        /**
         * 
         * @public
         * @param {*} object 
         * @param {*} schema 
         */
        isValid: function (object, schema) {
            return oVali.check(object, schema, {}).length == 0;
        },

        /**
         * 
         * @param {*} json 
         * @param {*} schema 
         */
        isJsonValid: function (json, schema) {
            return oVali.check(JSON.parse(json), schema, {}).length == 0;
        },

        /**
         * 
         * @public
         * @param {*} object 
         * @param {*} schema 
         * @param {*} pattern 
         */
        findPropertiesWithPattern: function (object, schema, pattern) {
            return _oVali.findPropertiesWithPattern(object, schema, pattern);
        },

        /**
         * 
         * @public
         * @param {*} name 
         * @param {*} definition 
         */
        addSchema: function (name, definition) { 
            return _oVali.addSchema(name, definition);
        }
    };

    return oVali;

}());

if (typeof module !== 'undefined' && module.exports) {
    module.exports = oVali;
}
