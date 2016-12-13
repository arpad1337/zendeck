/*
 * @rpi1337
 */

const crypto = require('crypto');
const PASSWORD_SALT = require('../config/secrets').PASSWORD_SALT;
const fs = require('fs');

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

	trim: ( string ) => {
		if( !string ) {
			return '';
		}
		return String(string).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ +/g,' ');
	},

	buildLaunchParamsFromObject: ( workerId, object ) => {
        let params = [];
        Object.keys( object ).forEach((key) => {
            params.push( key + '=' + object[ key ] );
        });
        params.push( 'workerId=' + workerId );
        return params;
    },

    decodeBase64Image: (dataString) => {
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

		if (matches.length !== 3) {
		return new Error('Invalid input string');
		}

		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');

		return response;
	},

	createTempFileFromImageBuffer: ( name, imageBuffer ) => {
		return new Promise((resolve, reject) => {
			let tmpFilename = Util.createSHA256Hash([ Date.now(), name ].join('')) + '_' + Util.createSHA256Hash( String(Math.random() * 9999999) );
			fs.writeFile('/tmp/' + tmpFilename, imageBuffer.data, function(err) {
				if( err ) {
					reject(err);
					return;
				}
				resolve({
					name: name,
					path: '/tmp/' + tmpFilename,
					type: imageBuffer.type
				});
			});
		});
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
	    for (var i = arrs[0].length - 1; i >= 0; i--) {
	        for (var j = arrs.length - 1; j > 0; j--) {
	        	console.log('c',arrs[j],'a',arrs[0][i])
	            if (arrs[j].indexOf(arrs[0][i]) != -1) {
	                resArr.push(arrs[0][i]);
	            }
	        }
	    }
	    console.log(resArr);
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