/*
 * @rpi1337
 */

const TYPES = require('sequelize');

/// helpers
 
const PATCHED_GETTER = function( prop ) {
    if( prop && this.dataValues.hasOwnProperty( prop ) ) {
        return this.dataValues[ prop ];
    }
    delete this.dataValues.deletedAt;
    delete this.dataValues.created_at;
    delete this.dataValues.updated_at;
    return this.dataValues;
};

const buildSettings = ( table, settings ) => {
    if( !Array.isArray( settings ) ) {
        return DEFAULT_SETTINGS;
    }

    let newSettings = Object.assign( { tableName: table }, DEFAULT_SETTINGS );
    settings.forEach(( set ) => {
        newSettings = extendSettings( newSettings, set );
    });
    return newSettings;
}

const buildSchema = ( attributes, attributeCollections ) => {
    if( !Array.isArray( attributeCollections ) ) {
        return attributes;
    }
    return Object.assign( attributes, ...attributeCollections );
};

const buildModel = ( table, attributes, settings ) => {
    const attributeCollections = [];
    if( settings.indexOf( TIMESTAMPS_SETTINGS ) > -1 ) {
        attributeCollections.push( TIMESTAMPS_COLLECTION );
    }
    if( settings.indexOf( PARANOID_MODEL_SETTINGS ) > -1 ) {
        attributeCollections.push( PARANOID_COLLECTION );
    }
    const model = {
        schema: buildSchema( attributes, attributeCollections ),
        settings: buildSettings( table, settings )
    };
    return model;
}

const _mergeObjectsByKey = ( child, parent ) => {
    Object.keys( parent ).forEach((key) => {
        if( !child.hasOwnProperty( key ) ) {
            if( parent.hasOwnProperty(key) && typeof parent[ key ] === 'object' ) {
                child[ key ] =  _mergeObjectsByKey({}, parent[ key ]); 
            } else {
                child[ key ] = parent[ key ]; 
            }
        } else {
            if( parent.hasOwnProperty(key) && typeof parent[ key ] === 'object' ) {
                child[ key ] =  _mergeObjectsByKey(child[ key ], parent[ key ]); 
            }
        }
    });
    return child;
};

const extendSettings = ( child, parent ) => {
    if( typeof parent != 'object' || typeof child != 'object' ) {
        throw new Error('invalid params');
    }
    const patchedSettings = Object.assign({}, parent);
    return _mergeObjectsByKey( patchedSettings, child );
};

/// settings

const DEFAULT_SETTINGS = {
    underscored: true
};

const TIMESTAMPS_SETTINGS = {
    // createdAt: 'createdAt',
    // updatedAt: 'updatedAt',
    timestamps: true
};

const PARANOID_MODEL_SETTINGS = {
    deletedAt: 'deletedAt',
    paranoid: true,
	instanceMethods: {
        get: PATCHED_GETTER
    }
};

/// attribute collections

const TIMESTAMPS_COLLECTION = {
    createdAt: {
        type: TYPES.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: TYPES.DATE,
        field: 'updated_at'
    }
};

const PARANOID_COLLECTION = {
    deletedAt: {
        field: 'deleted_at',
        type: TYPES.DATE
    }
}

// exports

module.exports = {
    extendSettings: extendSettings,
    buildModel: buildModel,
    buildSettings: buildSettings,
    buildSchema: buildSchema,
    TIMESTAMPS_SETTINGS: TIMESTAMPS_SETTINGS,
    PATCHED_GETTER: PATCHED_GETTER,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    PARANOID_MODEL_SETTINGS: PARANOID_MODEL_SETTINGS,
    TIMESTAMPS_COLLECTION: TIMESTAMPS_COLLECTION
};
