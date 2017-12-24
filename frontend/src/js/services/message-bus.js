/*
 * @rpi1337 
 */

import MESSAGES from '../config/messages';

const EventEmitter = require('events').EventEmitter;

class MessageBusService extends EventEmitter {

	static get $inject() {
		return [

		];
	}

	constructor() {
		super();
		window.messageBus = this;

		let originalEmit = this.emit;
		let self = this;
		this.emit =function() {
			console.log('MessageBusService->emit Broadcasting event: ', arguments[0], 'with payload', Array.prototype.slice.call( arguments, 1 ));
			originalEmit.apply( self, arguments );
		};
	}

	get MESSAGES() {
		return MESSAGES;
	}

}

export default MessageBusService;