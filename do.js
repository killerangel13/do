/*
 * # dø - 1.0.3
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
    typeof define === "function" && define.amd ? define(dø) :
    global.dø = dø;

    function dø(o, one, two, three, context) {

        if (typeof o !== "function")
            context = undefined;
        else
            o = o.call(context = { js: o.toString() });

        return deem(o, one, two, three, context);
    }

    function deem(o, one, two, three, context) {
        if (o !== undefined)
            return Array.isArray(o) ?
                typeof o[0] !== "function" ?
                        new DoArray (o, one, two, three, context):
                new DoFunctionArray (o, one, two, context):
                new DoFunctionObject(o, one, two, context);
    }

    var ES6Proxy = (function() { // does VM work with Proxy?
        return (
            typeof Proxy === "function" && 
            dø === (new Proxy({},{ get: function(){ return dø }}))[Math.random()]
        );
    })();

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
        for(var i=0,len=arguments.length;i<len;i++) {
            args.push(arguments[i]);
        }
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
            if (typeof active === "boolean" &&
                this["some died"] === true)
                return this.die();

            if (typeof active === "boolean")
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
                    done.hasOwnProperty(k) === false &&
                    dead.hasOwnProperty(k) === false)
                    returned();
            }
            this["set active"](false);
        },
        "set active": function(boolean) {
            return this.active = this.contents.active = boolean;
        },
        bind: function(context) {
            this.context = context;

            this.finish = bind(this.finish, this);
            this.die = bind(this.die, this);

            if (context.js === undefined)
                return context;

            var args = nameParameters(context.js),
                alone = context.alone = Boolean(args.length);

            context.js = ES6Proxy !== true ? "no proxy" : "ES6 proxy";

            if (alone !== true)
                return context;

            this.alone = true;

            for(var i=0,len=args.length;i<len;i++) {

                // pass on ...rest arguments
                args[i] = args[i].replace("...", "");
            }
            this["stand alone"](args);

            return context;
        }
    };

    var DoFunctionArray = extend(Do, { // Array of Functions
        construct: function() {
            var context = this.arguments[3],

                no_context = context === undefined,

                context = this.context = this.bind(no_context ? {} : context);

            this.next = this.arguments[2] || this.arguments.splice(1,1,undefined).pop();

            this.init();

            return context.alone === true || no_context ?
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

            this.net = this.net ?
                this.net.empty():
                 new Net(NumberInArray(this.arguments[0].length));

            this.countdown = this.net.counts[0];
            this.done = this.done||this.net._[1];
            this.doing = {};

            this.contents = API(this.context, this, true);
            this.dø = API(this.dø||function() {
                return that.do.apply(that, arguments);
            }, this);
        },
        do: function(anArg) {
            if (anArg !== undefined)
                for(var args=[],i=0,len=arguments.length;i<len;i++) // inlined slice
                    /* "Ray, a drop of golden sun." */
                    args[i] = arguments[i];
            else
                var args;

            if (this.cued)
                this.init.apply(this, args);

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
                each.call(this, i, functions[i], doing, it.call(this, i, did), it.call(this, i, died), args);
            }
            return this.dø;
        },
        each: function(i, func, doing, did, died) {
            doing[i] = func
                .call(this, i, did, died);
        },
        "each alone": function(i, func, doing, did, died, args) {
            doing[i] = func
                .apply(null, args)
                .call(this, i, did, died);
        },
        "stand alone": function(args) {
            this.each = this["each alone"];

            var functions = this.arguments[0];
            for(var i=0,len=functions.length;i<len;i++) {
                var func = functions[i];
                functions[i] = close(func.toString(), args, this);
            }
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
        "stand alone": function(args) {
            this.init = this["init alone"];

            this["iterate alone"] = close(this.iterate.toString(), args, this);
        },
        "init alone": function() {
            this.iterate = this["iterate alone"].apply(null, arguments);

            return this.super.init.apply(this, arguments);
        }
    });

    var DoFunctionObject = (function() { // Object with Functions

        var dø = extend(Do, {
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
                this.keys = {
                    o: Object.keys(o),
                    did: []
                };
                var no_context = context === undefined,
                    context = this.context = this.bind(no_context ? {} : context),

                    ops = this.ops = {},
                    todo = this.todo = copy(this.keys.o),
                    total = this.total = this.countdown = todo.length,
                    to_cue = this["to cue"] = {},
                    primes = this.primes = {},
                    orders = this.orders = {},
                    cueing = this.cueing = {count: 0, _:{}},
                    rests = this.rests = false,
                    resting = {},

                    keys = this.keys.o;
                for(var i = 0; i < total; i++) {
                    var k = keys[i],

                    func = o[k],

                    js = func.toString(),

                    args = nameParameters(js),

                    last = args.length - 1,
                    count = last,
                    // (argument, ...rest) => {
                    rest = 0 <= last && args[last][0] === "." ? !!args.pop() : false;

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

                    intersect(args, keys, orders);
                }
                this.rests = rests;

                if (rests)
                    this.record = [];

                for(var k in resting)
                    resting[k].arguments.need(except(k, this.keys.o));

                for(var k in o)
                    to_cue[k] = copy(ops[k].arguments["get keys"]());

                this.contents = context;

                this.proxy();

                API(context, this, true);

                var dø = this.dø = API(bind(this.dø, this), this);

                return context.alone === true || no_context ?
                    dø:
                    dø();
            },
            reset: function() {
                this["end active"]();
                this.cued = false;
                var keys = this.keys.o,
                    ops = this.ops,
                    total = this.countdown = this.total,
                    to_cue = this["to cue"];

                for(var i=0; i < total; i++) {
                    var k = keys[i],
                        op = ops[k],
                        args = op.arguments;

                    to_cue[k] = copy(args["get keys"]());
                    args.empty();
                    op.this.i = i;
                }
                this.todo = copy(this.keys.o);
                this.counts.length = this.count = 0;
                this.done = {};
                this.dead = {};
                this.doing = {};
                this.cueing._ = {};
                this.cueing.count = 0;
                this["set active"](false);
                this["some died"] = false;
                if (this.record !== undefined)
                    this.record = [];

                this.refresh();
            },
            refresh: !ES6Proxy ? function() {
                var ops = this.ops;
                for(var k in ops) {
                    var that = ops[k].this;
                    that.done = this.done;
                    that.dead = this.dead;
                    that.doing = this.doing;
                }
                API(this.contents, this);
                API(this.dø, this);
            }:
            function() {
                API(this.contents, this);
                API(this.dø, this);
            },
            proxy: !ES6Proxy ? function() {
                var ops = this.ops,
                    todo = this.todo,
                    each = this["each proxy"];
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
            }:
            function() {
                var ops = this.ops,
                    todo = this.todo,
                    each = this["each proxy"];
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
            "each proxy": !ES6Proxy ? function(op, k, i) {
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
            }:
            function(op, k, i) {
                var did = this.did,
                    that = op.this = new Proxy(this, {
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
                does = new Proxy(this.did, {
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
                    arguments: new Net(copy(args)),
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
            dø: function() {
                if (this.cueing.count !== 0)
                    this.reset();

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
                var op = this.ops[k] = {
                    arguments: new Net(copy(args)),
                    function: close(func.toString(), this.enclosing, this)
                };
                return op;
            },
            "each alone": function(k, op) {
                if (this.cued === false)
                    this["de-cue"](k);

                this.doing[k] = op.function.apply(null, this.enclosed).apply(op.this, op.arguments["get defined"]());
            },
            "dø alone": function() {
                if (this.cued)
                    this.reset();

                var args = this.enclosed = [];
                for(var i=0,len=arguments.length;i<len;i++) // inlined slice
                    args[i] = arguments[i];

                this.cue();

                return this.dø;
            },
            "stand alone": function(args) {
                this.each = this["each alone"];
                this["add op"] = this["add op alone"];
                this.dø = this["dø alone"];
                this.enclosing = args;
                this["set active"] = this["set active alone"];
            },
            "set active alone": function(boolean) {
                if (boolean === false)
                    this.enclosed = undefined;
                this.active = this.contents.active = boolean;
            }
        });
        return dø;
    })();
    
    function nameParameters(js) {

        var args = [],
            comment = "", /*//*/
            bracket = 0, // []
            brace = 0, // {}
            paren = 0, // ()
            quote = "",
            def,
            colon = def = false,
            arg = "",
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

                if (paren === 0)
                    break;

                continue;
            
            } else if (char === "=") {
                def = true;

                args.push(arg);
                arg = "";
                continue;

            } else if (char === "[" || char === "]")
                continue;

            // Parens
            if (char === "(") {
                paren++;

                continue;

            } else if (paren === 1 && char === ")") {

                if (arg !== "" && args.indexOf(arg) === -1)
                    args.push(arg);

                break;
            }

            if (paren === 0)
                continue;

            // Destructured
            if (char === "," || char === "{")
                colon = false;

            if (char === "{") {
                brace++;
                continue;
            } else if (char === ":") {
                if (brace > 0)
                    colon = true;

                continue;
            } else if (char === "}") {
                brace--;
                continue;
            }
            if (brace > 0 && char !== "," && colon === false)
                continue;

            if (char === ",") {
                if (arg.length && args.indexOf(arg) === -1)
                    args.push(arg);

                arg = "";
                continue;
            }

            if (whitespace.test(char) || char === ")")
                continue;

            arg += char;
        }
        return args;
    }
    var whitespace = /(\s)|(\r)/;

    function API(o, context, contents) {
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
    function close(js, args, context) {
        var js = "'use strict';\nreturn {\n"+
                
                "function: ("+js+"),\n"+

                "setters: [";

        for(var i=0,len=args.length;i<len;i++)
            js += (
                "\nfunction(val) {"+

                args[i]+" = val}"+

                (i < len-1 ? "," : "]}")
            )
        ;
        var func = (new ApplyFunction(args.concat([js]))).call(context);
        return function() {
            for(var i=0,len=func.setters.length;i<len;i++) {
                func.setters[i](arguments[i]);
            }
            return func.function;
        };
    }
    function ApplyFunction(args) {
        return Function.apply(this, args);
    }
    ApplyFunction.prototype = Function.prototype;

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