import { expect } from 'chai';
import { Controller, ControllerConfiguration } from '../../src/model/Controller';
import { ValueItem } from '../../src/model/ValueItem';

describe('model.Controller', () => {
	const configuration: ControllerConfiguration = {
		address: 'address',
		name: 'name',
		port: 502,
		valueItemInfos: null,
		slaveId: 0
	};

	describe('new', () => {
		it('Should contains all configuration values expect registers at instanciation', () => {
			// Arrange && Act
			const controller = new Controller(configuration);

			// Assert
			expect(controller.address).to.equal(configuration.address);
			expect(controller.name).to.equal(configuration.name);
			expect(controller.port).to.equal(configuration.port);
			expect(controller.valueItems).to.deep.equal([]);
			expect(controller.slaveId).to.equal(configuration.slaveId);
		});

		it('Should instance has to be read to read at instance time', () => {
			// Arrange && Act
			const controller = new Controller(configuration);

			// Assert
			expect(controller.readingsReady).to.be.true;
		});
	});

	describe('addValueItem', () => {
		let controller: Controller;
		let valueItem: ValueItem;

		beforeEach(() => {
			controller =  new Controller(configuration);
			valueItem = new ValueItem({label: 'label', address: 0, type: 'INT32', unit: 'T', coefficient: -1, recurrence: "* * * * * *"}, controller);
		});

		it('Should add a new value item', () => {
			// Act
			controller.addValueItem(valueItem);

			// Assert
			expect(controller.valueItems).to.contain(valueItem);
			expect(controller.valueItems).to.have.lengthOf(1);
		});

		it('Should always made the controller not ready for read operation', () => {
			// Act
			controller.addValueItem(valueItem);

			// Assert
			expect(controller.readingsReady).to.be.false;
		});

		it('Should not add a register twice', () => {
			// Arrange
			controller.addValueItem(valueItem);

			// Act && Assert
			expect(() => controller.addValueItem(valueItem)).to.throw;
			expect(controller.valueItems).to.have.lengthOf(1);
			expect(controller.valueItems).to.contain(valueItem);
		});
	});

	describe('generateReadings', () => {
		it('Should', () => {
			// Arrange
			// Act
			// Assert
		});
	});
});
