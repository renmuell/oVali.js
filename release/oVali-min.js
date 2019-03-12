!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),t.oVali=e()}}(function(){return function c(o,a,i){function u(r,e){if(!a[r]){if(!o[r]){var t="function"==typeof require&&require;if(!e&&t)return t(r,!0);if(h)return h(r,!0);throw new Error("Cannot find module '"+r+"'")}var n=a[r]={exports:{}};o[r][0].call(n.exports,function(e){var t=o[r][1][e];return u(t||e)},n,n.exports,c,o,a,i)}return a[r].exports}for(var h="function"==typeof require&&require,e=0;e<i.length;e++)u(i[e]);return u}({1:[function(e,t,r){Array.prototype.flatten||Object.defineProperty(Array.prototype,"flatten",{value:function(){if(null==this)throw new TypeError('"this" is null or not defined');return Object(this).reduce(function(e,t){return e.concat(Array.isArray(t)?t.flatten():t)},[])},configurable:!0,writable:!0});var c,n,o,a,i=(n=["number","string","object","array","boolean","undefined"],o={schemas:{},object:function(e){return"object"==typeof e},string:function(e){return"string"==typeof e},number:function(e){return"number"==typeof e},boolean:function(e){return"boolean"==typeof e},array:function(e){return Array.isArray(e)},undefined:function(e){return void 0===e},getType:function(e){return o.undefined(e)?"undefined":o.array(e)?"array":o.boolean(e)?"boolean":o.number(e)?"number":o.string(e)?"string":o.object(e)?"object":"?"},addSchema:function(e,t){return o.schemas[e]=t},getSchemaWithoutOptional:function(e){return"?"===e[0]?e.substr(1):e},getSchemaWithoutSubSchema:function(e){return-1<e.indexOf("/")?e.substr(0,e.indexOf("/")):e},getSchemaSubSchema:function(e){return-1<e.indexOf("/")?e.substr(e.indexOf("/")+1):e},getSchema:function(e){return o.getSchemaWithoutOptional(o.getSchemaWithoutSubSchema(e))},isSchemaOptional:function(e){return"?"===e[0]},isSchemaWithSubSchema:function(e){return-1<e.indexOf("/")},checkSubSchemaInner:function(e,t,r){return o.schemas[t]?o.array(e)?o.checkArray(e,o.schemas[t],r):o.check(e,o.schemas[t],r):o.checkArray(e,t,r)},checkSubSchema:function(t,r,n){return Object.keys(r).map(function(e){return o.isSchemaWithSubSchema(r[e])&&t[e]?o.checkSubSchemaInner(t[e],o.getSchemaSubSchema(r[e]),n):void 0}).flatten().filter(function(e){return void 0!==e})},getExtraProperties:function(e,t){return Object.keys(e).filter(function(e){return!Object.keys(t).includes(e)})},checkExtraProperties:function(t,r,e){return void 0===e.showExtraProperties||e.showExtraProperties?o.getExtraProperties(t,r).map(function(e){return{type:c.extraProperty,key:e,object:t,value:t[e],schema:r,expected:void 0,actual:o.getType(t[e])}}):[]},getSchemaOptional:function(e,t,r,n){return void 0===e[t]&&void 0!==n.showMissingOptionals&&n.showMissingOptionals&&o.isSchemaOptional(r[t])?{type:c.optionalNotIn,key:t,value:void 0,object:e,schema:r,expected:o.getSchema(r[t]),actual:void 0}:void 0},getSchemaOptionals:function(t,r,n){return Object.keys(r).map(function(e){return o.getSchemaOptional(t,e,r,n)}).filter(function(e){return void 0!==e})},getSchemaError:function(e,t,r,n){return void 0===e[t]?o.isSchemaOptional(r[t])?void 0:void 0===n.shownotContain||n.shownotContain?{type:c.notContain,object:e,value:void 0,key:t,schema:r,expected:o.getSchema(r[t]),actual:void 0}:void 0:{type:c.shouldBe,object:e,value:e[t],key:t,schema:r,expected:o.getSchema(r[t]),actual:o.getType(e[t])}},getSchemaErrors:function(t,r,n){return Object.keys(r).filter(function(e){return!o[o.getSchema(r[e])](t[e])}).map(function(e){return o.getSchemaError(t,e,r,n)}).filter(function(e){return void 0!==e})},getSchemaCorrect:function(t,r,e){return void 0!==e.showCorrect&&e.showCorrect?Object.keys(r).filter(function(e){return o[o.getSchema(r[e])](t[e])}).map(function(e){return{type:c.correct,key:e,value:t[e],object:t,schema:r,expected:o.getSchema(r[e]),actual:o.getType(t[e])}}):[]},checkSchema:function(e,t,r){return o.getSchemaCorrect(e,t,r).concat(o.getSchemaErrors(e,t,r)).concat(o.getSchemaOptionals(e,t,r))},check:function(e,t,r){return o.checkSchema(e,t,r||{}).concat(o.checkExtraProperties(e,t,r||{})).concat(o.checkSubSchema(e,t,r||{}))},findPropertiesWithPattern:function(e,t,r){return o.getPropertiesWithPattern(e,t,r)},getPropertiesWithPattern:function(t,r,n){return Object.keys(r).map(function(e){return o.getPropertyWithPattern(t,e,r,n)}).filter(function(e){return void 0!==e})},getPropertyWithPattern:function(e,t,r,n){return"string"==typeof e[t]&&-1<e[t].indexOf(n)?{type:c.propertyWith,object:e,value:e[t],key:t,schema:r,pattern:n}:void 0},checkFlatArrayCorrects:function(r,n,e){return void 0!==e.showCorrect&&e.showCorrect?r.filter(function(e){return o[n](e)}).map(function(e,t){return{type:c.correct,key:t,value:e,object:r,schema:n,expected:n,actual:o.getType(e)}}):[]},checkFlatArrayErrors:function(r,n){return r.filter(function(e){return!o[n](e)}).map(function(e,t){return{type:c.shouldBe,key:t,value:e,object:r,schema:n,expected:n,actual:o.getType(e)}})},checkFlatArray:function(e,t,r){return o.checkFlatArrayCorrects(e,t,r).concat(o.checkFlatArrayErrors(e,t,r))},checkFatArray:function(e,t,r){return[].concat.apply([],e.map(function(e){return o.check(e,t,r)}))},checkSubSchemaArray:function(e,t,r){return[].concat.apply([],e.map(function(e){return o.checkArray(e,o.getSchemaSubSchema(t),r)}))},checkArray:function(e,t,r){return"string"==typeof t?o.isSchemaWithSubSchema(t)?o.checkSubSchemaArray(e,t,r):o.checkFlatArray(e,t,r):o.checkFatArray(e,t,r)}},a={TYPES:c={correct:"correct",propertyWith:"propertyWith",shouldBe:"shouldBe",notContain:"notContain",optionalNotIn:"optionalNotIn",extraProperty:"extraProperty"},check:function(e,t,r){return o.string(t)&&n.includes(t)?o.getType(e)===t?[]:[{type:c.shouldBe,object:void 0,value:e,key:void 0,schema:t,expected:o.getSchema(t),actual:o.getType(e)}]:o.array(e)?o.schemas[o.getSchemaSubSchema(t)]?o.checkArray(e,o.schemas[o.getSchemaSubSchema(t)],r):o.checkArray(e,o.getSchemaSubSchema(t),r):o.check(e,t,r)},isValid:function(e,t){return 0==a.check(e,t,{}).length},findPropertiesWithPattern:function(e,t,r){return o.findPropertiesWithPattern(e,t,r)},addSchema:function(e,t){return o.addSchema(e,t)}});void 0!==t&&t.exports&&(t.exports=i)},{}]},{},[1])(1)});
//# sourceMappingURL=oVali-min.js.map