/*
 * @rpi1337
 */

const DatabaseProvider = require('../../providers/database');

class AttachmentService {
	
	constructor( databaseProvider ) {
		this.databaseProvider = databaseProvider;
	}

	getAttachmentById( id ) {
		const AttachmentModel = this.databaseProvider.getModelByName( 'attachment' );
		return AttachmentModel.findOne({
			where: {
				id: id
			}
		}).then((model) => {
			if( model ) {
				return model.get();
			}
			return null;
		});
	}

	getAttachmentsByIds( ids ) {
		const AttachmentModel = this.databaseProvider.getModelByName( 'attachment' );
		return AttachmentModel.findAll({
			where: {
				id: ids
			}
		}).then((models) => {
			if( models ) {
				return models.map( m => m.get() );
			}
			return [];
		});
	}

	getAttachmentByUrl( url ) {
		url = url.trim();
		const AttachmentModel = this.databaseProvider.getModelByName( 'attachment' );
		return AttachmentModel.findOne({
			where: {
				url: url
			}
		}).then((model) => {
			if( model ) {
				return model.get();
			}
			return null;
		});
	}

	createAttachment( payload ) {
		const AttachmentModel = this.databaseProvider.getModelByName( 'attachment' );
		payload.tags = payload.tags ? payload.tags.map( tag => tag.trim().toLowerCase() ) : [];
		let model = {
			url: payload.url,
			preview: payload.preview,
			title: payload.title,
			description: payload.description,
			source: payload.source,
			tags: payload.tags
		};
		return AttachmentModel.create( model ).then(() => {
			return this.getAttachmentByUrl( model.url ).then(( attachment ) => {
				return attachment.id;
			});
		}).catch(() => {
			// exists
			return this.getAttachmentByUrl( model.url ).then((attachment) => {
				let id = attachment.id
				let tags = new Set( attachment.tags );
				model.tags.forEach(( tag ) => {
					tags.add( tag );
				});
				return this.updateAttachment( id, {
					tags: Array.from( tags )
				}).then(() => {
					return id;
				});
			});
		});
	}

	updateAttachment( id, payload ) {
		const AttachmentModel = this.databaseProvider.getModelByName( 'attachment' );
		return AttachmentModel.update( payload, {
			where: {
				id: id
			}
		});
	}

	scrapeUrl( url ) {
		/*
		 
			utm_source
			utm_medium
			utm_campaign
			utm_term
			utm_content

		 */

		url = url.replace(/(\&|\?)utm([_a-z0-9=]+)/g, ""); // no tracking, okthxbye

		let model = {
			meta: {
				preview: '/img/avatar.jpg',
				title: 'Metamind has been acquired by Salesforce',
				description: 'MetaMind, a Palo Alto-based AI startup founded in July 2014, is being acquired by Salesforce. According to a new post published at the company\'s website by CEO Richard Socher -- a Stanford PhD who stu',
				source: 'TechCrunch',
				url: 'http://techcrunch.com'
			},
			tags: ['article', 'techcrunch', 'startup', 'metamind', 'salesforce']
		};
		return new Promise((resolve, reject) => {
			resolve(model);
		});
	}

	static get instance() {
		if( !this.singleton ) {
			const databaseProvider = DatabaseProvider.instance;
			this.singleton = new AttachmentService( databaseProvider );
		}
		return this.singleton;
	}

}

module.exports = AttachmentService;