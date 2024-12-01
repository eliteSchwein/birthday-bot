"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = readConfig;
exports.getConfig = getConfig;
const js_conf_parser_1 = require("js-conf-parser");
let config = {};
function readConfig() {
    config = (0, js_conf_parser_1.default)(`${__dirname}/../../..`, ".env.conf");
}
function getConfig(filter = undefined, asObject = false) {
    if (!filter)
        return config;
    const result = [];
    for (const key in config) {
        if (!key.match(filter)) {
            continue;
        }
        if (asObject) {
            const realKey = key.replace(filter, '');
            result[realKey] = config[key];
        }
        else {
            result.push(config[key]);
        }
    }
    return result;
}
