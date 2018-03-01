export interface ProviderOptions {
    host: string;
    port: number;
    deviceNumber: number;
};

export interface IProvider {
	/** Address IP of the host */
	host: string;
	/** Port to use for ModBus connection */
	port: number;
	/** Device number, or slave id for chained devices */
	deviceNumber: number;

	/** Establish connection to device */
	connect(): Promise<any>;

	/** Read the specified number of register from the address */
	read(address: number, nbRegisters: number): Promise<any>;

	/** Close the connection */
	close(): void;
}