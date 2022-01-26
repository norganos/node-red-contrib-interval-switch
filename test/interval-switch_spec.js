const helper = require("node-red-node-test-helper");
const timerNode = require("../interval-switch.js");

describe('interval-switch Node', function () {

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        const flow = [{ id: "n1", type: "interval-switch", name: "test name", duration: "5" }];
        helper.load(timerNode, flow, function () {
            const n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            n1.should.have.property('duration', 5);
            done();
        });
    });

    it('should initially be off', function (done) {
        const flow = [{ id: "n1", type: "interval-switch", name: "test name", duration: "5" }];
        helper.load(timerNode, flow, function () {
            const n1 = helper.getNode("n1");
            n1.should.have.property('state', 'off');
            done();
        });
    });

    for (let inMessage of ['on','start','1','true',1,true]) {
        it((typeof inMessage) + ' message "' + inMessage + '" while off should change state', function (done) {
            const flow = [
                { id: "n1", type: "interval-switch", name: "test name", duration: "2" }
            ];
            helper.load(timerNode, flow, function () {
                const n1 = helper.getNode("n1");
                n1.receive({ payload: inMessage });
                n1.should.have.property('state', 'on');
                done();
            });
        });
        it((typeof inMessage) + ' message "' + inMessage + '" while off should send a message immediately', function (done) {
            const flow = [
                { id: "n1", type: "interval-switch", name: "test name", duration: "2", payload: "tick", payloadType: "str", immediate: true, wires: [["n2"]] },
                { id: "n2", type: "helper" }
            ];
            helper.load(timerNode, flow, function () {
                const n2 = helper.getNode("n2");
                const n1 = helper.getNode("n1");
                n2.on("input", function (msg) {
                    msg.should.have.property('payload', 'tick');
                    done();
                });
                n1.receive({ payload: inMessage });
            });
        });
        it('node should emit 1 second after ' + (typeof inMessage) + ' message "'+ inMessage + '"', function (done) {
            this.timeout(3000);
            this.slow(1800);
            const flow = [
                { id: "n1", type: "interval-switch", name: "test name", duration: "1", immediate: false, payload: "tick", payloadType: "str", wires: [["n2"]] },
                { id: "n2", type: "helper" }
            ];
            helper.load(timerNode, flow, function () {
                const n2 = helper.getNode("n2");
                const n1 = helper.getNode("n1");
                const start = Date.now();
                n1.receive({ payload: inMessage });
                n2.on("input", function (msg) {
                    msg.should.have.property('payload', 'tick');
                    (Date.now()-start).should.aboveOrEqual(1000);
                    done();
                });
            });
        });
    }
    for (let inMessage of ['off','stop','0','false',0,false]) {
        it((typeof inMessage) + ' message "' + inMessage + '" while off should not change state', function (done) {
            const flow = [
                { id: "n1", type: "interval-switch", name: "test name", duration: "1" }
            ];
            helper.load(timerNode, flow, function () {
                const n1 = helper.getNode("n1");
                n1.receive({ payload: inMessage });
                n1.should.have.property('state', 'off');
                done();
            });
        });
        it((typeof inMessage) + ' message "' + inMessage + '" while on should change state', function (done) {
            const flow = [
                { id: "n1", type: "interval-switch", name: "test name", duration: "1" }
            ];
            helper.load(timerNode, flow, function () {
                const n1 = helper.getNode("n1");
                n1.receive({ payload: "start" });
                n1.receive({ payload: inMessage });
                n1.should.have.property('state', 'off');
                done();
            });
        });
    }
});