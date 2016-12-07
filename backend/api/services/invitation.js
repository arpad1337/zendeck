/*
 * @rpi1337
 */

const Util = require('../../util/util');

class InivationService {

	createInvitation( userId, type, payload ) {
		const late = new Date();
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
					$lt: (new Date()).toISOString()
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
			this.singleton = new InivationService();
		}
		return this.singleton;
	}

}

module.exports = InivationService;