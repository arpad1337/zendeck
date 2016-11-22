/*
 * @rpi1337
 */

class FileUploadService {

	static get $inject() {
		return [
			
		]
	}

	constructor() {
		this._idSequence = 1;
	}

	createUploadTargetWithCallback( callback ) {
		let targetId = 'upload_' + this._idSequence;
		this._idSequence++;
		let element = $('<input type="file">').attr('id', targetId);
		let value = null;
		let changeHandler = function() {
			value = $(this).val();
			if( value && value.length > 0 ) {
				callback( value[0] );
			}
			element.remove();
		};
		element.bind('change', changeHandler);
		$('body').append( element );
		setTimeout( function() {
			if(!value) {
				element.remove();
			}
		}, 10000 );
		element.trigger('click');
	}

}

export default FileUploadService;