/*
 * @rpi1337
 */

const crypto = require('crypto');
const PASSWORD_SALT = require('../config/secrets').PASSWORD_SALT;

const Util = {

	createSHA256Hash: ( key ) => {
		return crypto.createHmac( 'sha256', 'YOLO1389' ).update( key ).digest( 'hex' );
	},

	createSHA256HashForPassword: ( key ) => {
		return crypto.createHmac( 'sha256', PASSWORD_SALT ).update( key ).digest( 'hex' );
	},

	createSignatureForKey: ( key, secret ) => {
		if( !secret ) {
			throw new Error( 'Util::createSignatureForKey secret is undefined' );
		}
		return crypto.createHash( 'sha256' ).update( key + secret ).digest( 'hex' );
	},

	flattenArrayOfArrays: (a, r) => {
	    if(!r){ r = []}
	    for(var i=0; i<a.length; i++){
	        if(a[i].constructor == Array){
	            Util.flattenArrayOfArrays(a[i], r);
	        }else{
	            r.push(a[i]);
	        }
	    }
	    return r;
	},

	buildLaunchParamsFromObject: ( workerId, object ) => {
        let params = [];
        Object.keys( object ).forEach((key) => {
            params.push( key + '=' + object[ key ] );
        });
        params.push( 'workerId=' + workerId );
        return params;
    },

    collectRuntimeParams: () => {
        let params = {};
        for (let i = 2; i < process.argv.length; i++) {
            let key = process.argv[i].split('=')[0];
            params[key] = process.argv[i].split('=')[1];
        }
        return params;
    },

	findCommonElements: (arrs) => {
	    var resArr = [];
	    for (var i = arrs[0].length - 1; i > 0; i--) {


	        for (var j = arrs.length - 1; j > 0; j--) {
	            if (arrs[j].indexOf(arrs[0][i]) == -1) {
	                break;
	            }
	        }

	        if (j === 0) {
	            resArr.push(arrs[0][i]);
	        }


	    }
	    return resArr;
	},

	generateRandomColor: () => {
		var letters = '456789ABC';
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 9)];
	    }
	    return color;
	},

	collectRuntimeParams: () => {
		let params = {};
        for (let i = 2; i < process.argv.length; i++) {
            let key = process.argv[i].split('=')[0];
            params[key] = process.argv[i].split('=')[1];
        }
        return params;
	}

};

module.exports = Util;