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
		const model = HTMLEMailFactory._renderEmailHTML( payload, variables );
		return {
			body: model.HTML,
			subject: model.SUBJECT
		};
	},

	createPlatformInvitationEmail: ( payload, languageKey ) => {
		languageKey = languageKey || 'EN';
		const type = 'PLATFORM_INVITATION';
		const variables = HTMLEMailFactory._prepareLanguageVariables( languageKey, type );
		const model = HTMLEMailFactory._renderEmailHTML( payload, variables );
		return {
			body: model.HTML,
			subject: model.SUBJECT
		};
	},

	createGroupInvitationEmail: ( payload, languageKey ) => {
		languageKey = languageKey || 'EN';
		const type = 'GROUP_INVITATION';
		const variables = HTMLEMailFactory._prepareLanguageVariables( languageKey, type );
		const model = HTMLEMailFactory._renderEmailHTML( payload, variables );
		return {
			body: model.HTML,
			subject: model.SUBJECT
		};
	},

	_prepareLanguageVariables: ( languageKey, type ) => {
		const languageFile = JSON.parse( fs.readFileSync( path.resolve( [__dirname, '../languages/locale-' + ( languageKey.toLowerCase() ) + '.json' ].join('/') ) ) );
		const variables = Object.assign({}, languageFile.EMAIL.COMMON, languageFile.EMAIL[ type ]);
		return variables;
	},

	_renderEmailHTML: ( payload, variables ) => {
		variables = Object.assign( {}, variables, payload );
		console.log(variables);
		variables.DESCRIPTION = renderingEngine.compile( variables.DESCRIPTION )( variables );
		variables.SUBJECT = renderingEngine.compile( variables.SUBJECT )( variables );
		variables.BODY = renderingEngine.compile( variables.BODY )( variables );
		const frameTemplate = renderingEngine.compile( fs.readFileSync( path.resolve( [ __dirname, '../templates/frame.hbs'].join('/') ) ).toString() );
		return {
			HTML: frameTemplate( variables ),
			SUBJECT: variables.SUBJECT
		};
	}

};

module.exports = HTMLEMailFactory;