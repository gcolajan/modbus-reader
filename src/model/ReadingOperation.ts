import { ValueItem } from './ValueItem';
import { TypeBufferHelper } from './TypeBufferHelper';

/** Maximum theoric of register that could be read at once */
export const MAX_REGISTERS = 123;

export type ReadingResult = { time: Date, valueItem: ValueItem, data: number };

export class ReadingOperation {
	private _valueItems: ValueItem[];
	private _nbRegisters: number;

	/** Stores the address of the register */
	get address(): number { return this._valueItems[0].address; }

	/** Stores the recurrence of reading */
	get recurrence(): string { return this._valueItems[0].recurrence; }

	/** Gets the number of registers inside the reading operation */
	get nbRegisters(): number { return this._nbRegisters; }

	constructor(valueItem: ValueItem) {
		this._nbRegisters = 0;
		this._valueItems = [];
		this.addValueItem(valueItem);
	}

	/** Adds the register to the list for further data recomposition */
	addValueItem(valueItem: ValueItem): void {
		if (!this.isMergeable(valueItem)) {
			throw new Error('Can\'t merge discontinuous registers in one reading operation');
		}

		this._valueItems.push(valueItem);
		this._nbRegisters += valueItem.nbNativeRegisters;
	}

	/** Checks if register is contiguous */
	isMergeable(valueItem: ValueItem): boolean {
		if (this._valueItems.length === 0) {
			return true;
		}

		if (this._valueItems[0].recurrence !== valueItem.recurrence) {
			throw new Error('You shouldn\'t try to add a register to a reading operation with different recurrence');
		}

		if (this._nbRegisters + valueItem.nbNativeRegisters > MAX_REGISTERS) {
			return false;
		}

		return this.address + this.nbRegisters === valueItem.address;
	}

	/** From buffer received, recomposes the values from previously added registers */
	recompose(time: Date, buffer: Buffer): ReadingResult[] {
		let bufferOffset = 0;
		const results = this._valueItems.map(v => {
			const readValue = TypeBufferHelper.read(v.type, buffer, bufferOffset);
			bufferOffset += TypeBufferHelper.getLength(v.type) / 8;
			return {
				time,
				valueItem: v,
				data: v.convertValue(readValue)
			};
		});

		if (bufferOffset !== buffer.length) {
			throw new Error(`Mismatch during recomposition, buffer size was ${buffer.length} bytes but trying to read ${bufferOffset} bytes`);
		}

		return results;
	}
}
