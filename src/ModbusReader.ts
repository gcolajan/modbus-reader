import { Controller, ControllerConfiguration, MAX_DEFER } from './model/Controller';
import { ValueItem } from './model/ValueItem';
import { FakeProvider } from './providers/FakeProvider';
import { ModBusProvider } from './providers/ModBusProvider';
import { ReadingResult, ReadingOperation } from './model/ReadingOperation';
import { scheduleJob, Job } from 'node-schedule';
import { IProvider } from './providers/IProvider';
import { ProviderFactory } from './providers/ProviderFactory';

export type ValueListener = (r: ReadingResult) => void;

export class ModbusReader {
    private readonly _valueListeners: ValueListener[];
    private readonly _fake: boolean;
    private readonly _providers: Map<Controller, IProvider>;
    private readonly _deferredReadings: Map<Controller, ReadingOperation[]>;
    private readonly _deferredTasks: Map<Controller, NodeJS.Timer | null>;
    private _scheduledJobs: Job[];
    private _config: ReadonlyArray<ControllerConfiguration>;
    private _controllers!: Controller[];

    get fake(): boolean { return this._fake; }
    get started(): boolean { return this._scheduledJobs.length > 0; }

    constructor(controllersConfiguration: ControllerConfiguration[], fake: boolean = false) {
        this._valueListeners = [];
        this._scheduledJobs = [];
        this._config = controllersConfiguration;
        this._fake = fake;

        this._deferredReadings = new Map();
        this._deferredTasks = new Map();
        this._providers = new Map();

        this.init();
    }

    protected init(): void {
        this._controllers = ModbusReader.createControllers(this._config);
        this.clear();
    }

    protected clear(): void {
        for (const controller of this._controllers) {
            this._deferredReadings.set(controller, []);
            this._deferredTasks.set(controller, null);
            this._providers.set(controller, ProviderFactory.create({
                host: controller.address,
                port: controller.port,
                deviceNumber: controller.slaveId
            },
                this._fake));
        }
    }

    addValueListener(listener: ValueListener): void {
        this._valueListeners.push(listener);
    }

    restartWithNewConfiguration(config: ControllerConfiguration[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const controllers = ModbusReader.createControllers(config);
            const timeToApply = new Date();
            timeToApply.setSeconds(timeToApply.getSeconds() + 2);
            timeToApply.setMilliseconds(500);
            scheduleJob("new_conf", timeToApply, () => {
                this._config = config;
                this._controllers = controllers;
                this.stop();
                this.start();
                resolve();
            });
        });
    }

    start(): void {
        if (this.started) {
            throw new Error("Reader already started");
        }

        for (const controller of this._controllers) {
            for (const [recurrence, readings] of controller.readingsByRecurrence) {
                const job = scheduleJob(recurrence, () => this.fetch(controller, readings));
                this._scheduledJobs.push(job);
            }
        }
    }

    stop(): void {
        this._scheduledJobs.forEach(j => j.cancel());
        this._scheduledJobs = [];
        this.clear();
    }

    /** Fetching data with a debounce function to prevent establishing more than required TCP connections */
    private async fetch(controller: Controller, readingOperations: ReadingOperation[]): Promise<void> {
        // Bundling reading operation by controller
        const readings = this._deferredReadings.get(controller);
        if (!readings) {
            throw new Error("Deferred reading doesn't contains required controller");
        }

        readings.push(...readingOperations);

        // Fetching previous untriggered timer
        const previousTimer = this._deferredTasks.get(controller);
        if (previousTimer) {
            clearTimeout(previousTimer);
        }

        // Creating and referencing a deferred action to truly fetch the data 
        const timer = setTimeout(async () => {
            const provider = this._providers.get(controller);
            if (!provider) {
                throw new Error("No provider is instanciated for this controller");
            }
            await provider.connect();

            for (const reading of readings) {
                this.read(provider, reading);
            }

            this._deferredTasks.set(controller, null);
            this._deferredReadings.set(controller, []);
            provider.close();
        }, MAX_DEFER);

        this._deferredTasks.set(controller, timer);
    }

    private async read(provider: IProvider, readingOperation: ReadingOperation): Promise<void> {
        const date = new Date();
        const raw = await provider.read(readingOperation.address, readingOperation.nbRegisters);
        const readingResults = readingOperation.recompose(date, raw.buffer);
        for (const readingResult of readingResults) {
            for (const listener of this._valueListeners) {
                listener(readingResult);
            }
        }
    }

    protected static createControllers(config: ReadonlyArray<ControllerConfiguration>): Controller[] {
        return config.map(c => {
            const controller = new Controller(c);
            c.valueItemInfos.forEach(v => {
                const valueItem = new ValueItem(v, controller);
                controller.addValueItem(valueItem);
            });
            controller.generateReadings();
            return controller;
        });
    }
}