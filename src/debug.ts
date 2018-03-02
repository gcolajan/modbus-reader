import { ModbusReader } from './ModbusReader';
export { ModbusReader };


const reader = new ModbusReader([{
    address: "fake",
    name: "Test",
    port: 521,
    slaveId: 1,
    valueItemInfos: [
        { id: "_001", label: "label", address: 100, type: "INT16", unit: "L", coefficient: 1, recurrence: "* * * * * *" },
        { id: "_001", label: "label", address: 104, type: "INT16", unit: "L", coefficient: 1, recurrence: "* * * * * *" },
    ]
}], true);

reader.addValueListener((v) => {
    console.log(`${v.valueItem.address} = ${v.data} @${v.valueItem.controller.name}:${v.time.getSeconds()}.${v.time.getMilliseconds()}s`);
});

reader.start();

// Triggered externally
setTimeout(async () => {
    console.log("Ask for change");
    await reader.restartWithNewConfiguration([{
        address: "fake",
        name: "Test",
        port: 521,
        slaveId: 1,
        valueItemInfos: [
            { id: "_001", label: "label", address: 200, type: "INT16", unit: "L", coefficient: 1, recurrence: "* * * * * *" },
            { id: "_001", label: "label", address: 204, type: "INT16", unit: "L", coefficient: 1, recurrence: "* * * * * *" },
        ]
    }]);
    console.log("Changed");
}, 1000);

