/*
 * @rpi1337
 */

const renderingEngine = require('handlebars');
const fs = require('fs');
const path = require('path');

const TYPES = {
	FORGOT_PASSWORD: true
};

const HTMLEMailFactory = {

	createPasswordResetEmail: ( payload, languageKey ) => {
		languageKey = languageKey || 'EN';
		const type = 'FORGOT_PASSWORD';
		const variables = HTMLEMailFactory._prepareLanguageVariables( languageKey, type );
		const HTML = HTMLEMailFactory._renderEmailHTML( payload, variables );
		return {
			body: HTML,
			subject: variables.SUBJECT
		};
	},

	createPlatformInvitationEmail: ( payload, languageKey ) => {
		languageKey = languageKey || 'EN';
		const type = 'PLATFORM_INVITATION';
		const variables = HTMLEMailFactory._prepareLanguageVariables( languageKey, type );
		const HTML = HTMLEMailFactory._renderEmailHTML( payload, variables );
		return {
			body: HTML,
			subject: variables.SUBJECT
		};
	},

	createGroupInvitationEmail: ( payload, languageKey ) => {
		languageKey = languageKey || 'EN';
		const type = 'GROUP_INVITATION';
		const variables = HTMLEMailFactory._prepareLanguageVariables( languageKey, type );
		const HTML = HTMLEMailFactory._renderEmailHTML( payload, variables );
		return {
			body: HTML,
			subject: variables.SUBJECT
		};
	},

	_prepareLanguageVariables: ( languageKey, type ) => {
		const languageFile = JSON.parse( fs.readFileSync( path.resolve( [__dirname, '../languages/locale-' + ( languageKey.toLowerCase() ) + '.json' ].join('/') ) ) );
		const variables = Object.assign({}, languageFile.EMAIL.COMMON, languageFile.EMAIL[ type ]);
		return variables;
	},

	_renderEmailHTML: ( payload, variables ) => {
		variables = Object.assign( {}, variables, payload );
		variables.BODY = renderingEngine.compile( variables.BODY )( variables );
		variables.DESCIPTION = renderingEngine.compile( variables.DESCIPTION )( variables );
		variables.SUBJECT = renderingEngine.compile( variables.SUBJECT )( variables );
		const frameTemplate = renderingEngine.compile( fs.readFileSync( path.resolve( [ __dirname, '../templates/frame.hbs'].join('/') ) ).toString() );
		return frameTemplate( variables );
	}

};

module.exports = HTMLEMailFactory;