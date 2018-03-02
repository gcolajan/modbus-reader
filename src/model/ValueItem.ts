import { SupportedType, TypeBufferHelper } from './TypeBufferHelper';
import { Controller } from './Controller';

/** One native register is 2 bytes */
export const REGISTER_LENGTH = 16;

/** Configuration of a register as it should be represented in JSON configuration */
export interface ValueItemInfo {
	id?: string | number;
	label: string;
	address: number;
	type: SupportedType;
	unit: string;
	coefficient: number;
	recurrence: string;
}

export class ValueItem implements ValueItemInfo {
	private _controller: Controller;
	private _id: string | number | undefined;
	private _label: string;
	private _address: number;
	private _type: SupportedType;
	private _unit: string;
	private _coefficient: number;
	private _recurrence: string;

	get controller(): Controller { return this._controller; }

	/** Mapping of the metric/register */
	get id(): string | number | undefined { return this._id; }
	set id(value: string | number | undefined) { this._id = value; }

	/** Label of the register */
	get label(): string { return this._label; }

	/** Address of the register */
	get address(): number { return this._address; }

	/** Type of the register for later buffer conversion */
	get type(): SupportedType { return this._type; }

	/** Dynamically calculated number of native registers */
	get nbNativeRegisters(): number { return TypeBufferHelper.getNbRegisters(this.type, REGISTER_LENGTH); }

	/** Units used to describe the value */
	get unit(): string { return this._unit; }

	/** Coefficient to apply after reading */
	get coefficient(): number { return this._coefficient; }

	/** Coefficient to apply after reading */
	get recurrence(): string { return this._recurrence; }

	constructor(conf: ValueItemInfo, controller: Controller) {
		this._controller = controller;
		this._id = conf.id;
		this._label = conf.label;
		this._address = conf.address;
		this._type = conf.type;
		this._unit = conf.unit;
		this._coefficient = conf.coefficient;
		this._recurrence = conf.recurrence;
	}

	/**
	 * Convert the value with the provided coefficient
	 * @param {number} rawValue Value as read from the controller
	 * @returns {number} 
	 */
	convertValue(rawValue: number): number {
		return rawValue * this.coefficient;
	}
}
