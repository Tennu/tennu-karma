const assert = require("assert");

const equals = require("deep-eql");

const hearts = require ("../give-take-regexp");

const debug = Boolean(false || process.env.VERBOSE);
const logfn = debug ? console.log.bind(console) : function () {};

const give = "give";
const take = "take";
const none = "none";

describe("Give or take privmsg regexps", function () {
    it("give x for '<3 x'", function () {
        assert(equals(hearts("<3 x"), {action: give, target: "x"}));
    });

    it("give x for '<3 x for y'", function () {
        assert(equals(hearts("<3 x for y"), {action: give, target: "x"}));
    });

    it("take x for '</3 x'", function () {
        assert(equals(hearts("</3 x"), {action: take, target: "x"}));
    });

    it("give x for '❤ x'", function () {
        assert(equals(hearts("❤ x"), {action: give, target: "x"}));
    });
});