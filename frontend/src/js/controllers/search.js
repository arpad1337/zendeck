/*
 * @rpi1337
 */

class SearchController {

	static get $inject() {
		return [
		];
	}

	constructor() {
		this.currentSearchTerm = '';
		this.opened = false;
	}

	toggleVisibility() {
		this.opened = !this._opened;
	}

}

export default SearchController;