import * as ModbusRTU from 'modbus-serial';
import { BaseProvider } from './BaseProvider';
import { ProviderOptions } from './IProvider';

export class ModBusProvider extends BaseProvider {
	private _client: ModbusRTU.IModbusRTU;

	constructor(options: ProviderOptions) {
		super(options);
		this._client = new ModbusRTU();
		this._client.setID(this.deviceNumber);
	}

	/** Establish a TCP connection to device */
	connect(): Promise<any> {
		return new Promise((resolve, reject) => {
			try{   
				this._client.connectTCP(this.host, {port: this.port}, resolve);
			} catch(e) {
				reject(e);
			}
		});
	}

	/** Read the specified number of register from the address */
	read(address: number, nbRegisters: number): Promise<ModbusRTU.ReadRegisterResult> {
		return this._client.readHoldingRegisters(address, nbRegisters);
	}

	/** Close the connection */
	close(): void {
		return this._client.close(() => {});
	}
}
