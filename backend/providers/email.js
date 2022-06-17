/*
 * @rpi1337
 */

const AWS_CONFIG = require('../config/aws');
const AWS = require('aws-sdk');

class EmailProvider {

	constructor( ) {
		const config = {
			apiVersion: '2010-12-01',
            region: 'eu-west-1',
            accessKeyId: AWS_CONFIG.API_KEY,
			secretAccessKey: AWS_CONFIG.API_SECRET
		};
		this.client = new AWS.SES( config );
	}

	sendEmail( emails, subject, body ) {
		console.log('SENDING FROM', AWS_CONFIG.SES_FROM);
		if( !Array.isArray( emails ) ) {
			emails = [ emails ];
		}
		return new Promise((resolve, reject) => {
			resolve();
			/*
			this.client.sendEmail(
				{ 
					Source: AWS_CONFIG.SES_FROM,
					Destination: {
						ToAddresses: emails
					},
					Message: {
						Subject: {
							Data: subject
						},
						Body: {
							Html: {
								Data: body
							}
						}
					}
				},
				(err, data) => {
					if(err) {
						reject( err );
						return;
					}
					resolve( data );
				}
			);*/
		});
	}

	static get instance() {
		if( !this.singleton ) {
			this.singleton = new EmailProvider();
		}
		return this.singleton;
	}

}

module.exports = EmailProvider;