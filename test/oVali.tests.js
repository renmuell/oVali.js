/*global require */

var test = require('tape');
var oVali = require('../build/oVali.js');

test('oVali', function (t) {
    t.plan(1);
    oVali.check({},{});
    t.ok(true);
});

test('oVali simple - number', function (t) {
    t.plan(1);
    var result = oVali.check({
        years: 2
    },{
        'years': 'number'
    });
    t.equal(result.length, 0);
});

test('oVali simple - string', function (t) {
    t.plan(1);
    var result = oVali.check({
        text: "foo"
    },{
        'text': 'string'
    });
    t.equal(result.length, 0);
});

test('oVali simple - array', function (t) {
    t.plan(1);
    var result = oVali.check({
        list: [1, 2]
    },{
        'list': 'array'
    });
    t.equal(result.length, 0);
});

test('oVali simple - array', function (t) {
    t.plan(1);
    var result = oVali.check({
        isFoo: true
    },{
        'isFoo': 'boolean'
    });
    t.equal(result.length, 0);
});

test('oVali simple fail', function (t) {
    t.plan(4);
    var result = oVali.check({
        years: '2'
    },{
        'years': 'number'
    });
    t.equal(result.length, 1);
    t.equal(result[0].type, "shouldBe");
    t.deepEqual(result[0].schema, {
        'years': 'number'
    });
    t.equal(result[0].key, "years");
});

test('oVali simple deep', function (t) {
    t.plan(1);
    
    oVali.addSchema("Car", {
        model: "string"
    })
    var result = oVali.check({
        car: {
            model: "fooBar"
        }
    },{
        'car': 'object/Car'
    });
    t.equal(result.length, 0);
});

test('oVali simple deep fail', function (t) {
    t.plan(4);
    
    oVali.addSchema("Car", {
        model: "string"
    })
    var result = oVali.check({
        car: {
            model: 3
        }
    },{
        'car': 'object/Car'
    });
    t.equal(result.length, 1);
    t.equal(result[0].type, "shouldBe");
    t.deepEqual(result[0].schema, {
        model: "string"
    });
    t.equal(result[0].key, "model");
});

test('oVali simple - array subschema number', function (t) {
    t.plan(1);
    oVali.addSchema("Car", {
        model: "string"
    })
    var result = oVali.check({
        list: [{model: "foo"}, {model: "bar"}]
    },{
        'list': 'array/Car'
    });
    t.equal(result.length, 0);
});

test('oVali simple - array subschema number', function (t) {
    t.plan(1);
    var result = oVali.check({
        list: [1, 2]
    },{
        'list': 'array/number'
    });
    t.equal(result.length, 0);
});

test('oVali simple - array subschema number fail', function (t) {
    t.plan(2);
    var result = oVali.check({
        list: [1, true]
    },{
        'list': 'array/number'
    });
    t.equal(result.length, 1);
    t.equal(result[0].type, "shouldBe");
});

test('oVali simple - array subschema string', function (t) {
    t.plan(1);
    var result = oVali.check({
        list: ["foo", "bar"]
    },{
        'list': 'array/string'
    });
    t.equal(result.length, 0);
});

test('oVali simple - array subschema boolean', function (t) {
    t.plan(1);
    var result = oVali.check({
        list: [true, false]
    },{
        'list': 'array/boolean'
    });
    t.equal(result.length, 0);
});

test('oVali simple - array subschema array', function (t) {
    t.plan(1);
    var result = oVali.check({
        list: [[], []]
    },{
        'list': 'array/array'
    });
    t.equal(result.length, 0);
});

test('oVali simple - array sub-subschema array', function (t) {
    t.plan(1);
    var result = oVali.check({
        list: [[[10, 10], [10, 10]], [[10, 10], [10, 10]]]
    },{
        'list': 'array/array/array/number'
    });    
    t.equal(result.length, 0);
});

test('oVali simple - optional number', function (t) {
    t.plan(1);
    var result = oVali.check({
    },{
        'years': '?number'
    });
    t.equal(result.length, 0);
});

test('oVali simple - optional number', function (t) {
    t.plan(1);
    var result = oVali.check({
        'name': "foo",
        'extra': "bar"
    },{
        'name': "string",
        'years': '?number',
        "must": "string"
    },{
        showCorrect: true,
        shownotContain: true,
        showExtraProperties: true,
        showMissingOptionals: true
    });
    t.equal(result.length, 4);
});

test('oVali findPropertiesWithPattern', function (t) {
    t.plan(1);
    var result = oVali.findPropertiesWithPattern({
        'name': "foobar"
    },{
        'name': "string"
    }, "oob");
    t.equal(result.length, 1);
});

test('oVali complex', function (t) {
    t.plan(12);

    oVali.addSchema("Tank", {
        "fill": "number",
        "type": "string"
    })

    oVali.addSchema("Car", {
        "brand": "string",
        "wheels": "number",
        "tank": "object/Tank"
    })

    oVali.addSchema("Person", {
        "id": "number",
        "name": "string",
        "age": "number",
        "cars": "?array/Car",
        "geoData": "?array/array/array/number"
    })

    var schema = {
        'version': "string",
        "personen": "array/Person"
    };

    var testData = {
        version: "1.0.0",
        personen: [{
            id: 0,
            name: "Max Meier",
            age: 30,
            geoData: [[
                [0,0,1], [1,0,1], [1,1,0]
            ],[
                [1,0,1], [0,0,1], [1,0,0]
            ],[
                [0,0,0], [1,0,0], [0,1, true]
            ]],
            cars: [{
                "brand": "audi",
                "wheels": 4,
                "tank": {
                    fill: 20
                },
                "ExtraProperty": 34
            }]
        },{
            id: 0,
            name: "Nina Foo",
            age: 45,
            cars: [{
                "brand": "volvo",
                "wheels": 4,
                "tank": {
                    fill: 10,
                    type: "diesel"
                }
            },{
                "brand": "mercedes",
                "wheels": 4,
                "tank": {
                    fill: 50,
                    type: "petrol"
                }
            }]
        },{
            id: 0,
            name: "tom"
        }],
        ExtraProperty: true
    };

    var result = oVali.check(testData, schema);

    t.equal(result.length, 5);
    t.equal(result.filter(function(item){ return item.type === oVali.TYPES.extraProperty }).length, 2);
    t.equal(result.filter(function(item){ return item.type === oVali.TYPES.notContain }).length, 2);
    t.equal(result.filter(function(item){ return item.type === "shouldBe" }).length, 1);

    result = oVali.check(testData, schema, {
        showCorrect: true,
        shownotContain: true,
        showExtraProperties: true,
        showMissingOptionals: true
    });
    
    t.equal(result.length, 61);
    t.equal(result.filter(function(item){ return item.type === "correct" }).length, 53);
    t.equal(result.filter(function(item){ return item.type === "notContain" }).length, 2);
    t.equal(result.filter(function(item){ return item.type === "shouldBe" }).length, 1);
    t.equal(result.filter(function(item){ return item.type === "extraProperty" }).length, 2);
    t.equal(result.filter(function(item){ return item.type === "optionalNotIn" }).length, 3);

    result = oVali.check(testData, schema, {
        showCorrect: false,
        shownotContain: false,
        showExtraProperties: false,
        showMissingOptionals: false
    });
    
    t.equal(result.length, 1);
    t.equal(result.filter(function(item){ return item.type === "shouldBe" }).length, 1);
});

test('oVali simple literals', function (t) {
    t.plan(10);
    t.ok(oVali.isValid(3, "number"));
    t.ok(oVali.isValid("3", "string"));
    t.ok(oVali.isValid(true, "boolean"));
    t.ok(oVali.isValid([], "array"));
    t.ok(oVali.isValid({}, "object"));

    t.notOk(oVali.isValid(3, "string"));
    t.notOk(oVali.isValid("3", "boolean"));
    t.notOk(oVali.isValid(true, "array"));
    t.notOk(oVali.isValid([], "object"));
    t.notOk(oVali.isValid({}, "number"));
});

test('oVali array direct', function (t) {
    t.plan(1);
    t.ok(oVali.isValid([10,2,1,12,3], "array/number"));
});

test('oVali array direct', function (t) {
    t.plan(1);
    t.notOk(oVali.isValid([10,2,1,12,true], "array/number"));
});
test('oVali array direct deep', function (t) {
    t.plan(1);
    t.ok(oVali.isValid([[[10, 2],[10, 2]],[[10, 1]],[[10, 8],[10, 2],[10, 2]]], "array/array/array/number"));
});

test('oVali array direct deep wrong', function (t) {
    t.plan(1);
    t.notOk(oVali.isValid([[[10, true],[10, 2]],[[10, {}]],[[10, "9"],[10, 2],[10, 2]]], "array/array/array/number"));
});

test('oVali array direct complex', function (t) {
    t.plan(1);
    oVali.addSchema("Car", {
        wheels: "number"
    })
    t.ok(oVali.isValid([{wheels:4},{wheels:2},{wheels:8}], "array/Car"));
});

test('oVali array direct complex wrong', function (t) {
    t.plan(1);
    oVali.addSchema("Car", {
        wheels: "number"
    })
    t.notOk(oVali.isValid([{wheels:4},{wheels:"9"},{wheels:8}], "array/Car"));
});

test('oVali undefined', function (t) {
    t.plan(1);
    t.ok(oVali.isValid(undefined, "undefined"));
});

test('oVali undefined fail', function (t) {
    t.plan(1);
    t.notOk(oVali.isValid(1, "undefined"));
});

test('oVali simple - undefined', function (t) {
    t.plan(1);
    var result = oVali.check({
        isFoo: undefined
    },{
        'isFoo': 'boolean'
    });
    t.equal(result.length, 1);
});