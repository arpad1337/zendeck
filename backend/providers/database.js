/*
 * @rpi1337 
 */

const Sequelize = require('sequelize');
const StoreProviderAbstract = require('../util/store-provider-abstract');

class DatabaseProvider extends StoreProviderAbstract  {

	constructor( config ) {
		super( Object.assign({
			define: {
		    	timestamps: false,
				underscored: true,
				underscoredAll: true,
				freezeTableName: true
		    },
		    pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
            logging: console.log.bind(console)
		}, config) );

		this._modelCache = new Map();

		this.Sequelize = Sequelize;
		this._databaseConnection = new Sequelize( this.config );
	}

	get connection() {
		return this._databaseConnection;
	}

	getModelByName( name ) {
		if( !this._modelCache.has( name ) ) {
			const model = require('../models/' + name);
			this._modelCache.set( name, model );
		}
		return this._modelCache.get( name );
	}

	connect() {
		let self = this;
		return new Promise((resolve, reject) => {
			let timer = setTimeout( reject, 10 * 1000 );
			this._databaseConnection.authenticate().then(( p ) => {
				clearTimeout( timer );
				self.onConnected();
				console.log('DatabaseProvider->connect Connected to database');
				resolve( p );
			});
		}); 
	}

	disconnect() {
		if( this._connected ) {
			return this._databaseConnection.close(); 
		}
		return Promise.resolve(true);
	}

	static get instance() {
		if( !this.singleton ) {
			const CONFIG = require('../config/environment').DATABASE;
			this.singleton = new DatabaseProvider( CONFIG );
			this.singleton.connect();
		}
		return this.singleton;
	}

};

module.exports = DatabaseProvider;