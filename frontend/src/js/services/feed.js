/*
 * @ri1337
 */

class FeedService {

	static get $inject() {
		return [
			'$q',
			'$http'
		]
	}

	constructor( $q, $http ) {
		this.$q = $q;
		this.$http = $http;
	}

	getFeedByPage() {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve([])
		}, Math.random() * 1000);
		return promise.promise;
	}

	scrapeUrl( url ) {
		let promise = this.$q.defer();
		setTimeout(() => {
			promise.resolve({
				title: 'Metamind has been acquired by Salesforce',
				shortContent: 'MetaMind, a Palo Alto-based AI startup founded in July 2014, is being acquired by Salesforce. According to a new post published at the company\'s website by CEO Richard Socher -- a Stanford PhD who stu',
				picture: {
					large: 'img/avatar.jpg'
				},
				medium: 'TechCrunch',
				author: 'John Doe',
				tags: ['article', 'techcrunch', 'startup', 'metamind', 'salesforce']
			});
		}, Math.random() * 1000);
		return promise.promise;
	}

}

export default FeedService;