/*
 * # dø - 1.1.8
 * http://alt-o.net/
 *
 * Copyright 2016 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
(function(global) {
    
    "use strict";

    typeof exports === "object" && typeof module !== "undefined" ? module.exports = dø :
    typeof define === "function" && define.amd ? define(dø) : (global && (global.dø = dø));

    function dø(o, one, two, three, context, js) {

        if (typeof o !== "function")
            return deem(o, one, two, three, context);

        var no_context = (typeof context !== "object" || // Has context been cloned?

                typeof context.enclosure !== "object"),

            enclosure = !no_context ? context.enclosure:

                nameParameters(typeof js === "string" ? js : o.toString(), true),

            alone = enclosure.count > 0,

            o = !alone || !no_context ? o : close("dø", enclosure),

            context = no_context ? {
                function: o,
                enclosure: enclosure
            }: context;

        if (no_context) context[alone ? "alone" : "invoke"] = true;

        return deem(o.call(context), one, two, three, context);
    }

    var __cache__ = {};
    dø.opt = function(o, one, two, three) {
        if (typeof o !== 'function' || o.length === 0)
            return dø(o, one, two, three);

        var js = o.toString(),
            no_context = !__cache__.hasOwnProperty(js),
            context = no_context ? undefined : __cache__[js],
            o = no_context ? o : context.function,

            op = dø(o, one, two, three, context, js);

        if (no_context) __cache__[js] = op["get context"]();

        return op;
    };
    function deem(o, one, two, three, context) {
        if (o !== undefined)
            return Array.isArray(o) ?
                typeof o[0] !== "function" ?
                        new DoArray (o, one, two, three, context):
                new DoFunctionArray (o, one, two, context):
                new DoFunctionObject(o, one, two, context);
    }

    var ES6Proxy = (function() { // Does VM work with Proxy?
        return (
            typeof Proxy === "function" && 
            dø === (new Proxy({},{ get: function(){ return dø }}))[Math.random()]
        );
    })();
    dø.Proxy = false; // Set to true or to a Proxy function to enable

    function Net(keys) {
        this.counts = [keys ? keys.length : 0, 0];
        this._ = [
            keys||[],
            [], // vals
            [] // issets
        ];
        return this;
    }
    Net.prototype = {
        "get isset": function() {
            return this.counts[1] === this.counts[0];
        },
        "get defined": function() {
            if (this["get isset"]())
                return this._[1];

            var defined = [],
            vals = this._[1],
            issets = this._[2];

            for(var i=0,len=issets.length;i<len;i++) {

                if (issets[i] === true)
                    defined.push(vals[i]);
            }
            return defined;
        },
        set: function(key, val) {
            var i = this._[0].indexOf(key);

            if (i === -1)
                return undefined;

            var issets = this._[2];

            this._[1][i] = val;

            if (issets[i] === true)
                return this.counts[1];

            var count = this.counts[1] += 1;

            issets[i] = true;

            return count;
        },
        need: function(need) {
            var keys = this["get keys"](),

                count = need.length;
            for(var i=0;i<count;i++) {

                keys.push(need[i]);
            }
            this.counts[0] += count;
        },
        "get keys": function() {
            return this._[0];
        },
        "get count": function() {
            return this.counts[0];
        },
        replace: function(array) {
            return this._[1] = array;
        },
        empty: function() {
            this._[1].length = 0;
            this._[2].length = 0;
            this.counts[1] = 0;

            return this;
        }
    };

    function Do(one, two, three, four, five) {
        var args = this.arguments = [];

        // inlined slice
        for(var i=0,len=arguments.length;i<len;i++)
            args.push(arguments[i]);

        return this.construct.call(this, one, two, three, four, five);
    }
    Do.prototype = {
        die: function() {
            this["end active"]();

            var die = this.arguments[1];
            if (die)
                die.apply(null, arguments);
        },
        finish: function(active) {
            if (active === false &&
                this["some died"] === true)
                return this.die(this.dead);

            if (active === false)
                this["set active"](active);

            if (this.active === true)
                this["end active"]();

            var next = this.next;

            if (next)
                next(this.done);
            return 0;
        },
        "end active": function() {
            var doing = this.doing,
                done = this.done,
                dead = this.dead;

            for(var k in doing) {
                var returned = doing[k];

                if (typeof returned === "function" &&
                    !done.hasOwnProperty(k) &&
                    !dead.hasOwnProperty(k))
                    returned();
            }
            this["set active"](false);
        },
        "set active": function(boolean) {
            return this.active = this.contents.active = boolean;
        },
        "get context": function() {},
        bind: function(context) {
            var context = context || {};

            this["call context"] = context;

            this.finish = bind(this.finish, this);
            this.die = bind(this.die, this);

            if (context.enclosure !== undefined)
                this["bind closure"](context);

            this["get context"] = this["get context"].bind(this);

            this.dø = bind(this.dø, this);

            return context;
        },
        "bind closure": function(context) {
            var enclosure = this.enclosure = context.enclosure,
                alone = context.alone = enclosure.count > 0;
            if (alone)
                this["stand alone"](enclosure);
        },
        "stand alone": function(enclosure) {
            this.alone = true;

            this["set active"] = this["set active alone"];
            this["rests alone"] = enclosure.hash[enclosure.list[enclosure.count-1]] === "...";
            this.dø = this["dø alone"];
            this.enclosing = enclosure.list;
            this.enclosed = [];
        },
        "set active alone": function(boolean) {
            if (boolean === false)
                this.enclosed.length = 0;
            this.active = this.contents.active = boolean;
        },
        "dø alone": function() {
            var enclosed = this.enclosed = [],
                count = 0;

            for(var i=0,len=arguments.length;i<len;i++) // inlined slice
                count = enclosed.push(arguments[i]);

            if (this["rests alone"]) {
                var last = this.enclosing.length-1;

                enclosed[last] = enclosed.splice(last, count);
            }
            this.context = enclosed[0];
            this.refresh();
        }
    };

    var DoFunctionArray = extend(Do, { // Array of Functions
        construct: function() {
            var context = this.bind(this.arguments[3]);

            this.next = this.arguments[2] || this.arguments.splice(1,1,undefined).pop();

            this.init();

            return context.invoke !== true ?
                this.dø:
                this.dø();
        },
        "count down": function() {
            if((this.countdown -= 1) > 0)
                return;

            this.finish(false);
        },
        "it did": function(i, val) {
            this.net.set(i, val);
        },
        "it died": function(i, val) {
            this["some died"] = true;
            this.dead[i] = val;
        },
        "bound it": function(i, it) {
            var that = this;
            return function(val) {
                if (that.active === false)
                    return;

                it.call(that, i, val);

                that["count down"].call(that);
            }
        },
        init: function() {
            var that = this;

            this["some died"] = false;
            this.dead = {};
            this.cued = false;
            this.contents = {};

            this.net = this.net ?
                this.net.empty():
                 new Net(NumberInArray(this.arguments[0].length));

            this.countdown = this.net.counts[0];

            this.done = this.done || this.net._[1];
            this.doing = {};

            this.refresh();
        },
        do: function() {
            this.cued = true;
            this["set active"](true);

            var functions = this.arguments[0],
                it = this["bound it"],
                did = this["it did"],
                died = this["it died"],
                doing = this.doing,

                each = this.each;
            for(var i=0,len=functions.length;i<len;i++) {
                if (this.active !== true)
                    break;
                each.call(this, i, functions[i], doing, it.call(this, i, did), it.call(this, i, died));
            }
            return this.dø;
        },
        refresh: function() {
            if (this.alone !== true && 
                this["call context"].function !== undefined)
                
                API(this["call context"], this);

            API(this.contents, this, true);
            API(this.dø, this);
        },
        dø: function(context) {
            if (this.cued)
                return this.clone().apply(null, arguments);

            this.context = context;

            this.refresh();

            return this.do.call(this);
        },
        each: function(i, func, doing, did, died) {
            doing[i] = func
                .call(this, i, did, died);
        },
        clone: function() {
            var func = this.alone !== true && this["call context"].function,
                args = this.arguments;

            return dø((func || args[0]), args[1], this.next, undefined, {

                function: func || undefined,
                enclosure: this.enclosure,
                alone: this.alone,
                clone: true
            });
        },
        "stand alone": function(args) {
            this.super["stand alone"].call(this, args);

            if (this["call context"].clone === true)
                return;

            var enclosing = this.enclosing,

                functions = this.arguments[0];

            for(var i=0,len=functions.length;i<len;i++) {

                var part = nameParameters(functions[i].toString(), true);

                functions[i] = close("i"+i, part, enclosing);
            }
            
        },
        "dø alone": function() {
            if (this.cued)
                return this.clone().apply(null, arguments);

            Do.prototype["dø alone"].apply(this, arguments);

            return this.do.call(this);
        }
    });

    var DoArray = extend(DoFunctionArray, { // Array
        construct: function() {

            this.iterate = this.arguments.splice(1,1).pop();

            return this.super.construct.call(this);
        },
        each: function(i, el, doing, did, died) {

            doing[i] = this.iterate.call(this, el, i, did, died);
        },
        clone: function() {
            var func = this.alone !== true && this["call context"].function,
                args = this.arguments;

            return dø((func || args[0]), this.iterate, args[1], this.next, {

                function: func || undefined,
                enclosure: this.enclosure,
                alone: this.alone,
                clone: true
            });
        },
        "stand alone": function(args) {
            Do.prototype["stand alone"].call(this, args);

            if (this["call context"].clone === true)
                return;

            var part = nameParameters(this.iterate.toString(), true);

            this.iterate = close("iterate", part, this.enclosing);
        }
    });

    var DoFunctionObject = extend(Do, { // Object with Functions

        construct: function(o, die, next, context) {
            this.cued = false;
            this.next = this.arguments[2] || this.arguments.splice(1,1,function(){}).pop();
            this.done = {};
            this["some died"] = false;
            this.dead = {};
            this.doing = {};
            this.count = 0;
            this.did = {};
            this.died = {};
            this.counts = [];
            this.contents = {};
            this.keys = {
                o: Object.keys(o),
                did: []
            };
            var context = this.bind(context),
                alone = this.alone,
                ops = this.ops = {},
                todo = this.todo = copy(this.keys.o),
                total = this.total = this.countdown = todo.length,
                to_cue = this["to cue"] = {},
                cached = this.cached = Boolean(context.orders || context.parts),
                orders = this.orders = context.orders || {},
                parts = this.parts = context.parts || {},
                primes = this.primes = {},
                cueing = this.cueing = {count: 0, _:{}},
                rests = this.rests = false,
                resting = {},

                keys = this.keys.o;
            for(var i = 0; i < total; i++) {
                var k = keys[i],
                func = o[k],

                part = parts[k] = parts[k] || nameParameters(func.toString(), alone),

                args = copy(part.list),

                last = part.count - 1,
                count = last,
                // (argument, ...rest) => {
                rest = 0 <= last && part.hash[args[last]] === "..." ? !!args.pop() : false;

                rests = rests || rest;

                var op = this["add op"](k, func, args);

                if (rest === false)
                    count++;
                else
                    op.rests = count;

                if (rest === true && count === 0)
                    resting[k] = op;

                if (rest === false && count === 0)
                    primes[k] = op;

                else for(var a = 0; a < count; a++)
                        this.does(args[a]);
                    ;
                this.does(k);

                if (cached === false)
                    intersect(args, keys, orders);
            }
            this.rests = rests;

            if (rests)
                this.record = [];

            for(var k in resting)
                resting[k].arguments.need(except(k, this.keys.o));

            for(var k in o)
                to_cue[k] = copy(ops[k].arguments["get keys"]());

            this.proxy();

            this.refresh();

            return context.invoke !== true ?
                this.dø:
                this.dø();
        },
        refresh: function() {
            if (dø.Proxy === false || (
                dø.Proxy === true && !ES6Proxy
            ))
                this["refresh ops"]();
            
            this["refresh API"]();
        },
        "refresh ops": function() {
            var ops = this.ops,
                enclosed = this.enclosed,
                context = this.context,
                done = this.done,
                doing = this.doing,
                dead = this.dead;
            for(var k in ops) {
                var that = ops[k].this;
                that.done = done;
                that.doing = doing;
                that.dead = dead;
                that.context = context;
                if (enclosed !== undefined)
                    that.enclosed = enclosed;
            }
        },
        "refresh API": function() {
            if (this.alone !== true && 
                this["call context"].function !== undefined)

                API(this["call context"], this);

            API(this.contents, this, true);
            API(this.dø, this);
        },
        proxy: function() {
            if (dø.Proxy === false || (
                dø.Proxy === true && !ES6Proxy
            ))
                this["assign this"]();
            else
                this["proxy this"]();
        },
        "assign this": function() {
            var ops = this.ops,
                todo = this.todo,
                each = this["assign each"];
            for(var i=0,len=todo.length;i<len;i++) {
                var k = todo[i];
                each.call(this, ops[k], k, i);
            }
            var did = this.did,
                keys = this.keys.did;
            for(var i=0,len=keys.length;i<len;i++) {
                var k = keys[i];
                did[k] = bind1(did[k], this);
            }
            for(var i=0,len=todo.length;i<len;i++) {
                var k = todo[i];
                each.call(this, ops[k], k, i);
            }
        },
        "assign each": function(op, k, i) {
            var that = op.this = op.this || API({
                    i: i
                }, this),
                keys = this.keys.did,
                does = that.did,
                did = this.did;
            if (did === does)
                return that.did = defineObject([[
                    k, bind1(did[k], that)
                ]]);
            for(var j=0,len=keys.length;j<len;j++) {
                var jk = keys[j];

                if (k !== jk)
                    does[jk] = did[jk];
            }
        },
        "proxy this": function() {
            var ops = this.ops,
                todo = this.todo,
                each = this["proxy each"];
            for(var i=0,len=todo.length;i<len;i++) {
                var k = todo[i];
                each.call(this, ops[k], k, i);
            }
            var did = this.did,
                keys = this.keys.did;
            for(var i=0,len=keys.length;i<len;i++) {
                var k = keys[i];
                if (ops[k] === undefined)
                    did[k] = bind1(did[k], this);
            }
        },
        "proxy each": function(op, k, i) {
            var proxy = typeof dø.Proxy !== "function"? Proxy: dø.Proxy,
                did = this.did,
                that = op.this = new proxy(this, {
                get: function(o, k) {
                    return k === "i" ? i:
                        k !== "did" ?
                        o[k]:
                        does;
                },
                set: function(o, k, val) {
                    if (k === "i")
                        i = val;
                    else
                        o[k] = val;

                    return true;
                }
            }),
            i = i,
            does = new proxy(this.did, {
                get: function(o, jk) {
                    return k !== jk ?
                        o[jk]:
                        bound;
                }
            }),
            bound = bind1(did[k], that);

            did[k] = bind1(did[k], this);
        },
        does: function(k) {
            var did = this.did;
            if (did[k] !== undefined)
                return;
            var that = this;

            did[k] = function(val) {
                that.do.call(this, that, k, val);
                return this.did;
            };
            this.dies(k);

            this.keys.did.push(k);
        },
        dies: function(k) {
            var died = this.died;
            if (died[k] !== undefined)
                return;
            var that = this;
            died[k] = function(val) {
                that.do.call(that["died without context"], that, k, val);
                return died;
            };
        },
        "died without context": "died",

        store: function(that, k, val) {
            var op = this.ops[k],
                self = op === undefined ? undefined : op.this;

            if (self !== undefined && self.i === -1)
                return false;

            var died = that == "died";

            this[!died ? "done" : "dead"][k] = val;

            if (died === true)
                this["some died"] = true;

            else if (this.rests === true)
                this.record.push(defineObject([
                    [k, val]
                ]));
            var die = this.doing[k];

            if (that !== self && typeof die === "function")
                die();

            return true;
        },
        propagate: function(countdown, k, val, i) {
            var count = this.count;

            if (this.trigger(this.todo[i], k, val) !== true)
                return countdown;

            var count_now = this.count;

            if (count_now === count)
                return countdown;

            countdown -= count_now - count;

            if (countdown <= i)
                return countdown;

            var counts = this.counts;

            do if (counts[count] <= i)
                countdown = this.propagate(
                    countdown, k, val, counts[count]
                );
            while (countdown > i && count_now > (count += 1));

            return countdown;
        },
        "count down": function(k) {
            var countdown = this.countdown -= 1;

            if (countdown <= 0)
                return this.finish(false);

            var ops = this.ops,
                self = ops[k].this,

                I = self.i; self.i = -1;

            var todo = this.todo,
                end = todo.pop();

            if (end !== k)
                ops[(todo[I] = end)].this.i = I;

            this.count = this.counts.push(I);

            return countdown;
        },
        do: function(dø, k, val) {
            if (dø.active === false ||

                dø.store(this, k, val) === false)
                return;

            var countdown = !dø.ops.hasOwnProperty(k) ?
                dø.countdown:
                dø["count down"](k);

            if (this == "died" || countdown === 0)
                return;

            var propagate = dø.propagate;

            for(var i = 0; i < countdown; i++)
                countdown = propagate.call(dø,
                    countdown, k, val, i
                );
        },
        trigger: function(K, k, val) {
            var op = this.ops[K],
                args = op.arguments;

            if (args["get isset"]() === true ||
                
                args.set(k, val) === undefined ||

                args["get isset"]() === false)

                return false;

            if (op.rests === 0)
                args.replace(this.record);

            else if (op.rests !== undefined)
                args.replace(append(args["get defined"](), this.record));

            this.each.call(this, K, op, args);

            return true;
        },
        "add op": function(k, func, args) {
            var op = this.ops[k] = {
                arguments: new Net(args),
                function: func
            };
            return op;
        },
        "cue primes": function() {
            var primes = this.primes,
                each = this.each;

            for(var k in primes) {
                var op = primes[k];
                if (op.this.i > -1)
                    // if not done
                    each.call(this, k, op);
            }
        },
        cue: function() {
            if (this.total === 0)
                return;

            this["set active"](true);

            this["cue primes"]();

            if((this.cued = this.cued || !this.active))
                return;

            this["cue primary"]();
        },
        "cue primary": function() {
            var ops = this.ops,
                to_cue = this["to cue"],
                cueing = this.cueing._,
                orders = this.orders,
                count = 0,
                oops = [],
                each = this.each;

            for(var k in to_cue) {
                if (cueing[k] !== undefined)
                    continue;
                var args = ops[k].arguments["get keys"](),
                    in_ops = 0;
                for(var i=0,all=args.length;i<all;i++) {
                    if (ops[args[i]] !== undefined)
                        in_ops++;
                }
                if (all === in_ops || 0 === in_ops)
                    count = oops.push({

                        order: orders[k] || 0,
                        k: k
                    });
            }
            var primary = oops.sort(function(a, b) {
                return a.order === b.order ? 0:
                    a.order < b.order ? 1 : -1;
            });
            for(var i = 0; i < count; i++) {
                var k = primary[i].k,
                    op = ops[k];

                if (op.this.i > -1 && // not done
                
                    op.arguments["get isset"]() === false)
                    // not begun

                    each.call(this, k, op, op.rests === undefined ? undefined:

                        append(new Array(op.rests), this.record)
                    );
                if((this.cued = this.cued || !this.active))
                    return;
            }
        },
        dø: function(context) {
            if (this.cueing.count !== 0)
                return this.clone().apply(null, arguments);

            this.context = context;

            this.refresh();

            this.cue();

            return this.dø;
        },
        "de-cue": function(K) {
            var de_cue = this["de-cue"],
                to_cue = this["to cue"],
                cueing = this.cueing;

            for(var k in to_cue) {
                if (cueing._[k] !== undefined)
                    continue;
                var args = to_cue[k],
                    i = args.indexOf(K),
                    count = args.length;
                if (i > -1 && 1 < count-- && i !== count)
                    args[i] = args.pop();
                else if (i > -1)
                    args.pop();
                if (count !== 0)
                    continue;
                cueing._[k] = true;
                cueing.count++;

                de_cue.call(this, k);
            }
            if (this.total === cueing.count)
                this.cued = true;
        },
        each: function(k, op) {
            if (this.cued === false)
                this["de-cue"](k);

            this.doing[k] = op.function.apply(op.this, op.arguments["get defined"]());
        },
        "add op alone": function(k, func, args) {

            var part = this.parts[k],
                
                op = this.ops[k] = {
                arguments: new Net(args),

                function: this.cached !== true ?
                    
                    close(k, part, this.enclosing):

                    this["call context"].functions[k]
            };
            return op;
        },
        "stand alone": function(args) {
            this.super["stand alone"].call(this, args);

            this["add op"] = this["add op alone"];
        },
        "dø alone": function() {
            if (this.cueing.count !== 0)
                return this.clone().apply(null, arguments);

            this.super["dø alone"].apply(this, arguments);

            this.cue();

            return this.dø;
        },
        "get context": function() {
            var ops = this.ops,
                functions = {};

            for(var k in ops)
                functions[k] = ops[k].function;

            return {
                function: this["call context"].function || undefined,
                alone: this.alone,
                parts: this.parts,
                orders: this.orders,
                functions: functions,
                enclosure: this.enclosure
            };
        },
        clone: function() {
            var args = this.arguments;

            return dø((this["call context"].function || args[0]), args[1], this.next, undefined, this["get context"]());
        }
    });
    
    function nameParameters(js, deep) {
        // Remove anything between 'function' and '('
        var js = !js? "": js.slice(0, 8) === 'function'?
                ('function'+js.slice(js.indexOf('('))): js,
            count = 0,
            names = [],
            named = false,
            name = "",
            hash = {},
            resting = "",
            add = function() {
                if (name !== "" && !hash.hasOwnProperty(name)) {
                    count = names.push(name);
                    hash[name] = resting;
                }
                name = resting = "";
            },
            body = "",
            neck = "", // function `{`, => `(`, => ``
            comment = "", /*//*/
            bracket = 0, // []
            brace = 0, // {}
            paren = 0, // ()
            quote = "",
            def,
            colon = def = false,
            char = "",
            prev = "";
        for(var i=0,len=js.length;i<len;i++) {
            prev = char;
            char = js.charAt(i);

            if (quote !== "") {
                if (char === quote && prev !== "\\")
                    quote = "";
                continue;
            }
            if (comment === "") {
                if (char === "*" && prev === "/") {
                    comment = "/*";
                    continue;
                }
                if (char === "/") {
                    if (prev === "/")
                        comment = "//";
                    continue;
                }
            } else if ((
                comment === "/*" && prev === "*" && char === "/")||(
                comment === "//" && (char === "\n"||char ==="\r"))) {
                comment = "";
                continue;
            }

            if (comment!=="")
                continue;

            if (quote === "" && prev !== "\\" && (char === "'" || char === '"')) {
                quote = char;
                continue;
            }

            if (named && char !== "=" && char !== ">" && !whitespace.test(char))
                break;
            if (named)
                continue;

            if (def) { // Default value

                if (char === "," && paren === 1 && bracket === 0 && brace === 0)
                    def = false;
                else if (char === "(")
                    paren++;
                else if (char === ")")
                    paren--;
                else if (char === "[")
                    bracket++;
                else if (char === "]")
                    bracket--;
                else if (char === "{")
                    brace++;
                else if (char === "}")
                    brace--;

                if (paren === 0) {

                    if (deep !== true)
                        break;

                    named = true;
                    def = false;
                }
                continue;

            } else if (char === "=") {
                if (js.charAt(i + 1) === ">")
                    named = true;
                else
                    def = true;

                add();

                continue;

            } else if (char === "[" || char === "]")
                continue;

            // Parens
            if (char === "(") {

                if (paren === 0 && name.slice(-8) === "function")
                    name = "";

                paren++;

                continue;

            } else if (paren === 1 && char === ")") {

                add();

                if (deep !== true)
                    break;

                named = true;
                paren--;
                continue;
            }

            // Destructured
            if (char === "," || char === "{")
                colon = false;

            if (char === "{") {
                brace++;
                continue;
            } else if (char === ":") {
                if (brace > 0) {
                    colon = true;

                    name = "";
                    resting = "";
                }
                continue;
            } else if (char === "}") {
                brace--;
                continue;
            }
            if (char === "," && brace === 0) {
                add();
                continue;
            }
            if (whitespace.test(char) || char === ")")
                continue;

            if (char !== ".")
                name += char;
            else
                resting = "...";
        }

        if (char === "{" || char === "(")
            neck = char;
        else
            i--;

        if (deep === true)
            body = js.slice(i + 1);

        return {
            list: names,
            count: count,
            hash: hash,
            neck: neck,
            body: body
        };
    }
    var whitespace = /(\s)|(\r)/;

    function API(o, context, contents) {

        o.context = context.context;

        o['get context'] = context['get context'];

        if (context.todo)
            o.todo = context.todo
        ;
        if (contents === true)
            o.active = context.active;
        else
            o.contents = context.contents;

        var alone = context.alone;
        if (alone !== undefined)
            o.alone = alone;

        o.done = context.done;
        o.finish = context.finish;
        o.doing = context.doing;
        o.die = context.die;
        o.dead = context.dead;
        var did = context.did;
        if (did !== undefined)
            o.did = did;
        var died = context.died;
        if (died !== undefined)
            o.died = died;

        return o;
    }

    function close(name, part, outer) {
        var outer = outer || [],
            inner = part.list || [],
            inner_hash = part.hash || {},
            body = part.body || "",
            neck = part.neck || "",
            inner_length = inner.length,
            last = inner[inner_length - 1],
            args = "";

        for(var i = 0; i < inner_length - 1; i++)
            args = args + inner[i] + ", ";

        if (inner_length > 0)
            args = args + (inner_hash[last] === "..." ? "..." : "") + last;

        var outer_length = outer.length,
            pre = "'use strict';\n"+
            "return (function "+name+"("+args+") {\n\n    "+(
            
            outer_length > 0 ? "var " : "");

        for(var i=0,a=0;i<outer_length;i++) {

            var outer_name = outer[i];

            if (inner_hash.hasOwnProperty(outer_name))
                continue;
            
            if (a > 0)
                pre = pre + ",\n        ";

            pre = pre + outer_name + " = this.enclosed["+i+"]";

            a++;
        }
        if (outer_length > 0)
            pre = pre + ";\n\n";

        if (neck !== "{")
            body = "return (" + body;

        if (neck === "")
            body = body + ")";

        if (neck !== "{")
            body = body + "}";

        return (new Function(pre + body + ");"))();
    }
    function copy(arr) {
        var len = arr.length,
            ret = new Array(len);
        for(var i=0;i<len;i++) {
            ret[i] = arr[i];
        }
        return ret;
    }
    function bind(func, context) {
        return function() {
            return func.apply(context, arguments);
        };
    }
    function bind1(func, context) {
        return function(val) {
            return func.call(context, val);
        };
    }
    function NumberInArray(len) {
        var ret = [];
        for(var i=0;i<len;i++) {
            ret.push(i);
        }
        return ret;
    }
    function defineObject(arr) {
        var ret = {};
        for(var i=0,len=arr.length;i<len;i++) {
            ret[arr[i][0]] = arr[i][1];
        }
        return ret;
    }
    function intersect(arr1, arr2, counts) {
        var len1 = arr1.length,
        len2 = arr2.length;
        
        len1 > len2 ?
            contain(arr1, arr2, counts):
            contain(arr2, arr1, counts);
    }
    function contain(arr, smallArr, counts) {
        var smallArr = copy(smallArr);

        for(var x=0,len=arr.length;x<len;x++) {
            var el = arr[x],
                y = smallArr.indexOf(el);
            if (y === -1)
                continue;

            var end = smallArr.pop();

            if (y !== smallArr.length)
                smallArr[y] = end;

            if (counts[el] === undefined)
                counts[el] = 1;
            else
                counts[el]++;
        }
    }
    function append(startArr, endArr) {
        startArr.push.apply(startArr, endArr);

        return startArr;
    }
    function except(el, arr) {
        var ret = [];
        for(var i=0,len=arr.length;i<len;i++) {
            if (arr[i] !== el)
                ret.push(arr[i]);
        }
        return ret;
    }
    function extend(sup, props) {
        var sub = new Function("return "+sup.toString())(),
            sup = sup.prototype || {},
            subproto = sub.prototype = sub.prototype || {};

        for(var bb in sup) Object.defineProperty(
            subproto,
            bb,
            Object.getOwnPropertyDescriptor(sup, bb))
        ;
        subproto.super = sup;

        for(var k in props) Object.defineProperty(
            subproto,
            k,
            Object.getOwnPropertyDescriptor(props, k))
        ;
        return sub;
    }

})(typeof window !== "undefined" ? window : undefined);