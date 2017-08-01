const heartsGive = ["<3", "❤"];
const heartsTake = ["</3"];

const heartsGiveRegexpGroup = `(${heartsGive.join("|")})`;
const heartsTakeRegexpGroup = `(${heartsTake.join("|")})`;

// Accepts: "❤ <nickname>", "<nickname>: ❤" and "<nickname>, ❤"
const makeRegexps = function (action, matchesList) {
    const matches = `(${matchesList.join("|")})`
    return {
        action,
        regexps: [
            {group: 2, regexp: new RegExp(`^\\s*${matches}\\s+(\\S+)`)},
            {group: 1, regexp: new RegExp(`^\\s*(\\S+)[:,]\\s+${matches}`)}
        ]
    };
};

const queries = [
    makeRegexps("give", heartsGive),
    makeRegexps("take", heartsTake)
];

const query = function (message) {
    for (const {action, regexps} of queries) {
        for (const {group, regexp} of regexps) {
            const found = message.match(regexp);

            if (found !== null) {
                return {
                    action,
                    target: found[group]
                };
            }
        }
    }

    return {
        action: "none",
        target: ""
    };
};

module.exports = query;