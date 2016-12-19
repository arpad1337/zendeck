/*
 * @rpi1337
 */

class FeedbackController {

	static get $inject() {
		return [
			'UserService',
			'ModalService'
		];
	}

	constructor( userService, modalService ) {
		this.userService = userService;
		this.modalService = modalService;
		this._message = '';
	}

	set message(v) {
		this._message = v.trim()
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.replace(/  +/g, ' ').substr(0,1000);
	}

	get message() {
		return this._message;
	}

	sendFeedback( error, ok ) {
		if( this._message.length == 0 ) {
			error.message = true;
			return;
		} else {
			error.message = false;
		}
		return this.userService.sendFeedback( this._message ).then(() => {
			ok();
			this.modalService.openDialog( this.modalService.DIALOG_TYPE.MESSAGE, {
				messageDialogTemplateKey: 'FEEDBACK_SENT'
			});
		}).catch((e) => {
			error.backend = e.data;
		});
	}

}

export default FeedbackController;