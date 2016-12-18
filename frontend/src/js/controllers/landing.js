/*
 * @rpi1337
 */

import Validator from '../helpers/validator';

class LandingController {

	static get $inject() {
		return [
			'UserService',
			'ModalService'
		];
	}

	constructor( userService, modalService ) {
		this._email = '';
		this._name = '';
		this.userService = userService;
		this.modalService = modalService;
	}

	set email( value ) {
		this._email = value;
	}

	get email() {
		return this._email;
	}

	set name( value ) {
		this._name = value;
	}

	get name() {
		return this._name;
	}

	async submit() {
		if( Validator.validateEmail( this._email ) && !Validator.isFieldEmpty( this._name ) ) {
			let result = await this.userService.subscribeToNewsletter( this._name, this._email );
			if( result ) {
				this.modalService.openDialog( this.modalService.DIALOG_TYPE.SUBSCRIPTION_SUCCESFUL );
			}
			this._email = '';
			this._name = '';
		}
	}

}

export default LandingController;