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
		this.userService = userService;
		this.modalService = modalService;
	}

	set email( value ) {
		this._email = value;
	}

	get email() {
		return this._email;
	}

	async submit() {
		if( Validator.validateEmail( this._email ) ) {
			let result = await this.userService.subscribeToNewsletter( this._email );
			if( result ) {
				this.modalService.openDialog( this.modalService.DIALOG_TYPE.SUBSCRIPTION_SUCCESFUL );
			}
		}
	}

}

export default LandingController;