import { ValueItem, ValueItemInfo } from './ValueItem';
import { ReadingOperation } from './ReadingOperation';

export const MAX_DEFER = 20;

/** Determines what should be found inside the controller configuration from JSON file */
export interface ControllerConfiguration {
	name: string;
	address: string;
	port: number;
	slaveId: number;
	valueItemInfos: ValueItemInfo[];
	maxDefer?: number;
}

export class Controller {
	private readonly _name: string;
	private readonly _address: string;
	private readonly _port: number;
	private readonly _slaveId: number;
	private readonly _valueItems: Array<ValueItem>;
	private readonly _maxDefer: number;
	private readonly _readingsByRecurrence: Map<string, ReadingOperation[]>;
	private _readings: Array<ReadingOperation>;
	private _readingsReady: boolean;
	
	/** */
	get name(): string { return this._name; }

	/** */
	get address(): string { return this._address; }

	/** */
	get port(): number { return this._port; }

	/** */
	get slaveId(): number { return this._slaveId; }

	/** */
	get valueItems(): Array<ValueItem> { return this._valueItems; }

	/** */
	get readingsReady(): boolean { return this._readingsReady; }

	/** */
	get readings(): Array<ReadingOperation> { return this._readings; }

	/** */
	get maxDefer(): number { return this._maxDefer; }

	/** */
	get readingsByRecurrence(): Map<string, ReadingOperation[]> { return this._readingsByRecurrence; }

	/**
	 * Creates an instance of Controller.
	 * @param {ControllerConfiguration} conf Configuration obtained from JSON file
	 */
	constructor(conf: ControllerConfiguration) {
		this._name = conf.name;
		this._address = conf.address;
		this._port = conf.port;
		this._slaveId = conf.slaveId;
		this._valueItems = new Array();
		this._readingsReady = true;
		this._maxDefer = conf.maxDefer | MAX_DEFER;
		this._readingsByRecurrence = new Map();
	}

	/** Adds the register to the list if not already present */
	addRegister(register: ValueItem): void {
		if (this.valueItems.indexOf(register) !== -1) {
			throw new Error('Register already bound to current controller');
		}

		this.valueItems.push(register);
		this._readingsReady = false;
	}

	/** Build the readings if any register in the list */
	generateReadings(): void {
		if (this._valueItems.length > 0) {
			this.optimizeReading();
		}
		this._readingsReady = true;
	}

	/** Optimizes the operations of reading to the controller by concatenating contiguous registers of same recurrence */
	protected optimizeReading(): void {
		const valueItemByrecurrence = new Map<string, ValueItem[]>();
		const recurrences = [...new Set(this._valueItems.map(v => v.recurrence))];
		recurrences.forEach(r => valueItemByrecurrence.set(r, []));
		this._valueItems.forEach(v => valueItemByrecurrence.get(v.recurrence).push(v));

		this._readings = [];
		for (let [rec, valueItems] of valueItemByrecurrence) {
			valueItems.sort((a, b) => a.address > b.address ? 1 : -1);
			const readingOperation = new ReadingOperation(valueItems[0]);
			this._readings.push(readingOperation);
			const currentGroup = [readingOperation];
			this._readingsByRecurrence.set(readingOperation.recurrence, currentGroup);
			for (let i = 1; i < valueItems.length; i++) {
				const currentReadingOperation = this._readings[this._readings.length - 1];
				const curValueItem = valueItems[i];
				if (currentReadingOperation.isMergeable(curValueItem)) {
					currentReadingOperation.addValueItem(curValueItem);
				} else {
					const readingOperation = new ReadingOperation(curValueItem);
					this._readings.push(readingOperation);
					currentGroup.push(readingOperation);
				}
			}
		}
	}
}
