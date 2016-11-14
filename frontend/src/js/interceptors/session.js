/*
 * @rpi1337
 */

class SessionInterceptor {

	static get $inject() {
		return [
			'$q',
			'MessageBusService'
		]
	}

	constructor( $q, messageBus ) {
		this.$q = $q;
		this.messageBus = messageBus;
		this.responseError = this.responseError.bind( this );
	}

	responseError( error ) {
		if( 
			error.status === 401 ||
			(
				error.data && 
				error.data.error &&
				error.data.error.status === 401
			)
		) {
			this.messageBus.emit( this.messageBus.MESSAGES.USER.LOGOUT );
		}
		return this.$q.reject( error );
	}

}

export default SessionInterceptor;