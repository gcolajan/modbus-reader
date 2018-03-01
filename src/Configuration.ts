import { ControllerConfiguration } from './model/Controller';

/** Read frequency configuration as it should appear in JSON configuration */
export interface ReadFrequencyConfiguration {
	scheduled?: boolean | string;
	interval?: number;
	requiredOccurences?: number;
}
