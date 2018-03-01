# ModBus reader

This tool is dedicated to the reading of metrics from one or several controller via Modbus TCP.

It helps to:
 * optimize the reading of contiguous registers in one call (max. 123 registers)
 * use the same TCP connection if the reading occur on the same second
 * keep the number of TCP connections to maximum one per controller

Example of use:

```js
// Create your ModbusReader with initial configuration
const reader = new ModbusReader([{
    name: "main_ctrl",
    address: "127.0.0.1",
    port: 502,
    slaveId: 1,
    valueItemInfos: [
        { id: "M_001", label: "Vln_avg", address: 171, type: "UINT32", unit: "V", coefficient: 1, recurrence: "* * * * * *" },
        { id: "M_002", label: "kW_tot", address: 203, type: "INT32", unit: "kW", coefficient: 1, recurrence: "* * * * * *" },
    ]
}]);

// Set your listener for every single value
reader.addValueListener((v) => {
    console.log(`R${v.valueItem.address} = ${v.data} (${v.valueItem.controller.name} - ${v.time.toISOString()})`);
});

// Start reading
reader.start();

// Stop reading
reader.stop();
```

You would be able to switch the configuration on the fly:

```js
console.log("Ask for change");
await reader.restartWithNewConfiguration(/* new configuration */);
console.log("Changed");
```

## Create a configuration

The `ModbusReader` accept a list of controller with the following attributes:
```js
{
    name: "main_ctrl", // Name of your controller
    address: "127.0.0.1", // Address of your controller
    port: 502, // From which port you would read (refers to your Modbus device)
    slaveId: 1, // Refers to your Modbus device
    valueItemInfos: [] // List of metrics you want to read
}
```

Then you will need to fill the `valueItemInfos` attribute with a list of `ValueItem` objects:
```js
{
	id: "M_001", // Reference for your use
	label: "Vln_avg", // Name of the register
	address: 171, // Where the register is placed on the device
	type: "UINT32", // What should be read (INT16, UINT16, INT32, UINT32 or FLOAT32)
	unit: "V", // Unit of what is read
	coefficient: 1, // Coefficient adjustement applied to the value
	recurrence: "* * * * * *" // Cron-based recurrence syntax with seconds
}
```

## Current limitations

There is currently some limitations:

 * If two reading operation with different recurrence occur at the same time, no optimizations in reading operation will occur.
 * Reapply an heavy configuration can postpone some operations.
 * Debouncing used to restrict Modbus TCP connection usage will add at least 20ms (can't be configured currently) to the scheduled time. 
 * The theoretical limitations of 123 registers per call can't be tweaked currently.

## Contributions

This repository is open to pull requests. This project is using TypeScript, tests would be added in short future.

```
npm install
npm run build
```