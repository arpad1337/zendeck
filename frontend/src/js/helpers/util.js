/*
 * @rpi1337 
 */

const Util = {

	URL_PATTERN: () => {
		return /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
	},

	findUrlsInText: ( value, urls ) => {
		urls = urls || [];
		var matches = Util.URL_PATTERN().exec( value );
		if( matches ) {
			urls.push( matches[0] );
			return Util.findUrlsInText( value.substr( value.indexOf( matches[0] ) + matches[0].length, value.length ) , urls);
		} else {
			return urls;
		}
	},

	trim: ( string ) => {
		if( !string ) {
			return '';
		}
		return String(string).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ +/g,' ');
	},

	prepareContentHTML: ( source ) => {
		let content = " " + source + " ";
		content = content.replace(/\n/ig, "<br>")
						 .replace(Util.findUrlsInText( source ), '<a href="$&" target="_blank">$&</a>')
						 .replace(/@(\w{1,15})\b/g, '<a href="/$1">@$1</a>')
		return content.trim();
	},

	lineCount: ( source ) => {
		let matches = source.match(/\n|<br>/g);
		if( matches ) {
			return matches.length;
		}
		return 0;
	}

};

module.exports = Util;