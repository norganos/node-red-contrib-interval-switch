module.exports = function(RED) {
    "use strict";

    const noopAction = function(node) {
    };

    const getTypedVal = function(type, strVal) {
        if (type === 'num') {
            return parseFloat(strVal);
        }
        if (type === 'bool') {
            return strVal === 'true';
        }
        if (type === 'json') {
            return JSON.parse(strVal);
        }
        return strVal;
    }

    const setProp = function(context, path, val) {
        if (!path || typeof path !== 'string' || typeof context !== 'object') {
            return;
        }
        const dot = path.indexOf('.');
        if (dot > -1) {
            const head = path.substring(0, dot);
            const tail = path.substring(dot+1);
            if (head) {
                if (!context.hasOwnProperty(head)) {
                    context[head] = {};
                }
                context = context[head];
            }
            setProp(context[head], tail, val);
        } else {
            context[path] = val;
        }
    }

    function IntervalSwitch(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.duration = parseInt(config.duration);
        node.payload = getTypedVal(config.payloadType, config.payload) || {};
        node.counterPath = config.counterPath;
        node.immediate = config.immediate || false;
        node.state = 'off';
        node.interval = null;
        node.count = 0;

        const emit = function() {
            node.count += 1;
            const msg = {
                payload: node.payload
            };
            if (node.counterPath) {
                setProp(msg, node.counterPath, node.count);
            }
            node.send(msg);
        }

        const startAction = function() {
            node.log("start");
            node.state = 'on';
            node.count = 0;
            if (node.immediate) {
                emit();
            }
            node.interval = setInterval(emit, node.duration * 1000);
            node.status({fill:"green", shape:"dot", text:"on"});
        }

        const stopAction = function() {
            node.log("stop");
            node.state = 'off';
            if (node.interval) {
                clearInterval(node.interval);
                node.interval = null;
            }
            node.status({fill:"grey", shape:"dot", text:"off"});
        }

        const stateMachine = {
            on: {
                on: noopAction,
                start: noopAction,
                "1": noopAction,
                "true": noopAction,
                toggle: stopAction,
                off: stopAction,
                stop: stopAction,
                "0": stopAction,
                "false": stopAction
            },
            off: {
                on: startAction,
                start: startAction,
                "1": startAction,
                "true": startAction,
                toggle: startAction,
                off: noopAction,
                stop: noopAction,
                "0": noopAction,
                "false": noopAction
            }
        }

        node.on('input', function(msg, send, done) {
            node.log("received " + JSON.stringify(msg));
            send = send || function() { node.send.apply(node,arguments) }
            if (stateMachine[node.state]) {
                const action = stateMachine[node.state]['' + msg.payload];
                if (action) {
                    action(node, msg, send);
                    if (done) {
                        done();
                    }
                } else {
                    if (done) {
                        // Node-RED 1.0 compatible
                        done("don't know what to do with payload '" + msg.payload + "' in state '" + node.state + "'");
                    } else {
                        // Node-RED 0.x compatible
                        node.error("don't know what to do with payload '" + msg.payload + "' in state '" + node.state + "'", msg);
                    }
                }
            } else {
                if (done) {
                    // Node-RED 1.0 compatible
                    done("no actions found for state '" + node.state + "'");
                } else {
                    // Node-RED 0.x compatible
                    node.error("no actions found for state '" + node.state + "'", msg);
                }
            }
        });
    }
    RED.nodes.registerType("interval-switch", IntervalSwitch);
}