const dirty = require("dirty");
const {Ok, Fail} = require("r-result");
const hour = 3600e3;

const KarmaChangeHistory = function () {
    const lastChangeHistory = new Map(); // Map<String, Time>

    return {
        canChange(changer, topic) {
            const now = Date.now();
            const key = `${changer.toLowerCase()}\u{0}${topic.toLowerCase()}`;
            const lastChange = lastChangeHistory.get(key);

            const canChange = !(lastChange && ((now - lastChange) < hour));

            if (canChange) {
                lastChangeHistory.set(key, now);
            }

            return canChange;
        }
    }
};

const KarmaDb = function (databaseLocation) {
    const db = dirty.Dirty(databaseLocation);

    return {
        increment (topic) {
            db.update(topic, function (entry) {
                return {score: entry ? entry.score + 1 : 1};
            });
        },

        decrement (topic) {
            db.update(topic, function (entry) {
                return {score: entry ? entry.score - 1 : -1};
            });
        },

        get (topic) {
            const entry = db.get(topic);

            return entry ? Ok(entry.score) : Fail();
        },

        top (limit) {
            // Inline impl of .entries().
            const entries = [];
            db.forEach(function (topic, {score}) {
                entries.push({topic, score});
            });

            return entries.sort(function ({score: lhs_score}, {score: rhs_score}) {
                return rhs_score - lhs_score;
            }).slice(0, limit);
        }
    };
};

const KarmaServer = function (databaseLocation) {
    const db = KarmaDb(databaseLocation);
    const changeHistory = KarmaChangeHistory();

    return {
        increment (changer, topic) {
            if (changeHistory.canChange(changer, topic)) {
                db.increment(topic);
            };
        },

        decrement (changer, topic) {
            if (changeHistory.canChange(changer, topic)) {
                db.decrement(topic);
            };
        },

        get (topic) {
            return db.get(topic);
        },

        top (limit) {
            return db.top(limit);
        }
    };
};

module.exports = KarmaServer;