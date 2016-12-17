/*
 * @rpi1337
 */

const Util = require('../../util/util');
const DatabaseProvider = require('../../providers/database');

class InivationService {

	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
	}

	createInvitation( userId, type, payload ) {
		const later = new Date();
		const now = new Date();
		const InvitationModel = this.databaseProvider.getModelByName('invitation');
		const KEY = Util.createSHA256Hash( userId + type + Date.now() + 'fing' );
		return InvitationModel.create({
			userId: userId,
			type: type,
			invitationKey: Util.createSignatureForKey( KEY, 'T1T0K' ),
			payload: payload,
			expiration: ( later.setHours( now.getHours() + 24 ) )
		}).then(() => {
			return KEY;
		});
	}

	resolveInvitation( KEY ) {
		const InvitationModel = this.databaseProvider.getModelByName('invitation');
		const signature = Util.createSignatureForKey( KEY, 'T1T0K' );
		return InvitationModel.findOne({
			where: {
				invitationKey: signature,
				expiration: {
					$gt: (new Date()).toISOString()
				}
			}
		}).then((model) => {
			if( !model ) {
				return null;
			}
			return model.get();
		})
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new InivationService( databaseProvider );
		}
		return this.singleton;
	}

}

module.exports = InivationService;