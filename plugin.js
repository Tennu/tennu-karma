const KarmaServer = require("./karma");
const hearts = require("./give-take-regexp");

const KarmaPlugin = {
    name: "karma",

    init: function (client, imports) {
        const karma = KarmaServer(client.config("karma-database"));

        return {
            handlers: {
                "privmsg": function ({message, nickname}) {
                    const {action, target} = hearts(message);

                    switch (action) {
                        case "give":
                            karma.increment(nickname, target);
                            break;
                        case "take":
                            karma.decrement(nickname, target);
                            break;
                        case "none":
                            break;
                        default:
                            throw new Error(`Unknown action '${action}' returned by give-take-regexp.`);
                    }
                },

                "!karma": function ({args: [subcommand, target], nickname}) {
                    function showKarma (target) {
                        return karma.get(target).match({
                            Ok(n) {
                                return `${target} has ${String(n)} karma.`;
                            },

                            Fail(_) {
                                return `${target} has never been given or taken karma.`;
                            }
                        });
                    }

                    function topKarma () {
                        const top = karma
                        .top(5)
                        .map(function ({topic, score}) { return `${topic}: ${score}`; })
                        .join(", ");

                        return {
                            query: true,
                            message: [
                                "Top 5 with karma:",
                                top
                            ]
                        };
                    }

                    switch (subcommand) {
                        case undefined:
                            return "Karma command needs subcommand. Subcommands are `give`, `take`, `show`, and `top`.";
                        case "give":
                            karma.increment(nickname, target);
                            return;
                        case "take":
                            karma.decrement(nickname, target);
                            return;
                        case "show":
                            return showKarma(target);
                        case "top":
                            return topKarma();
                        default:
                            return "Unknown subcommand. Subcommands are `give`, `take`, `show`, and `top`."
                    }
                }
            },

            help: {
                "karma": [
                    "!karma &lt;subcommand&gt; [&lt;target&gt;]",
                    " ",
                    "Mess with the karma system."
                ]
            },

            commands: ["karma"]
        }
    }
};

module.exports = KarmaPlugin;