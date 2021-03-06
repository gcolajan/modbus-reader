import { BaseProvider } from './BaseProvider';
import { REGISTER_LENGTH } from '../model/ValueItem';

export class FakeProvider extends BaseProvider {

	/** Gives a random reading */
	read(address: number, nbRegisters: number): Promise<any> {
		const nbBytesPerRegister = REGISTER_LENGTH / 8;
		return new Promise((resolve: any) => {
			const buffer = new Buffer(nbRegisters * nbBytesPerRegister);
			const offset = 0;
			let curAddr = address;
			for (let i = 0; i < nbRegisters; i++) {
				buffer.writeInt16BE(Math.floor(curAddr + Math.random() * (curAddr / 2)), i * 2);
				curAddr++;
			}
			return resolve({
				data: new Array(nbRegisters).fill(0),
				buffer: buffer
			});
		});
	}
}
