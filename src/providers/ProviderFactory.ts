import { IProvider, ProviderOptions } from "./IProvider";
import { FakeProvider } from "./FakeProvider";
import { ModBusProvider } from "./ModBusProvider";

export class ProviderFactory {
    static create(options: ProviderOptions, fake: boolean = false): IProvider {
        const Provider = fake ? FakeProvider : ModBusProvider;
        return new Provider(options);
    }
}