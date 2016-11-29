/*
 * @rpi1337
 */

const CacheService = require('../../providers/cache');
const DatabaseService = require('../../providers/database');
const Util = require('../../util/util');

class FilterService {
	
	static get NAMESPACE() {
		return {
			ROOT: 'FILTERS',
			POSTS: 'POSTS',
			TAGS: 'TAGS',
			TEMP_FILTER_LIST: 'TEMP'
		}
	}

	static get CACHE_SIZE_LIMIT() {
		return 500;
	}

	static get LIMIT() {
		return 20;
	}

	constructor( cacheProvider, databaseProvider ) {
		this.cacheProvider = cacheProvider;
		this.databaseProvider = databaseProvider;
	}

	storeTagsByPostId( postId, tags ) {
		let uniqueTags = new Set( tags );
		let transaction = this.cacheProvider.multi();
		uniqueTags.forEach((tag) => {
			tag = tag.trim().toLowerCase();
			transaction.lpush( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TAGS, tag ].join(':'), postId );
			transaction.lpush( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.POSTS, postId ].join(':'), tag );
		});
		return transaction.exec();
	}

	createFilterWithTags( tags, page ) {
		let tagsKey = tags.sort().join('_');
		let uniqueTagsMap = {};
		let uniqueTags = [];
		let transaction = [];
		let key;
		tags.forEach((tag) => {
			tag = tag.trim().toLowerCase();
			if( !tag || uniqueTagsMap[ tag ] ) {
				return;
			}
			uniqueTagsMap[ tag ] = true;
			uniqueTags.push( tag );
			key = [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TAGS, tag ].join(':');
			transaction.push(
				this.cacheProvider.llen( key ),
				this.cacheProvider.lrange( key, 0, FilterService.CACHE_SIZE_LIMIT - 1 )
			);
		});
		return this.cacheProvider.del( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TEMP_FILTER_LIST, tagsKey ].join(':') ).then(() => {
			return Promise.all(transaction).then((values) => {
				let posts = [];
				let tags = [];
				let tagIndex = 0;
				values.forEach((item, index) => {
					if( index % 2 == 0 ) {
						tags.push({
							tag: uniqueTags[ tagIndex ],
							length: item
						});
						tagIndex++;
					} else {
						posts.push(item);
					}
				});
				let flattenedPosts = Util.flattenArrayOfArrays( posts );
				let postsCount = Util.findCommonElements(posts).length;

				transaction.length = 0;;

				flattenedPosts.forEach((postId) => {
					let key = [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.POSTS, postId ].join(':');
					transaction.push(
						this.cacheProvider.llen( key )
					);
				});

				return Promise.all(transaction) .then((values) => {
					values.forEach((item, index) => {
						flattenedPosts[ index ] = {
							id: flattenedPosts[ index ],
							keywordCount: item
						}
					});

					let postScores = {};
					let idf, tf, score;

					uniqueTags.forEach((tag) => {
						idf = 1 / Math.log(postsCount / tag.length);
						flattenedPosts.forEach((post) => {
							tf = 0.5 + 0.5 * ( 1 / post.keywordCount );
							score = Math.abs( idf * tf );
							if( postScores[ post.id ] ) {
								postScores[ post.id ].score = postScores[ post.id ].score + score;
							} else {
								postScores[ post.id ] = {
									id: post.id,
									score: score
								};
							}
						});
					});

					posts.length = 0;;

					Object.keys( postScores ).forEach((key) => {
						postScores[ key ].score = postScores[ key ].score / uniqueTags.length;
						posts.push( postScores[key] )
					});

					posts = posts.sort((a, b) => {
						return a.score <= b.score;
					});

					//console.log('scores:', posts);

					transaction.length = 0;
					let insert;
					posts.forEach((post, index) => {
						insert = this.cacheProvider.rpush( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TEMP_FILTER_LIST, tagsKey ].join(':'), post.id );
						if( index < FilterService.LIMIT ) {
							transaction.push(insert);
						}
					});
					transaction.push(this.cacheProvider.expire( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TEMP_FILTER_LIST, tagsKey ].join(':'), 100 ));
					return Promise.all(transaction);
				});

			}).then(() => {
				return this.cacheProvider.lrange( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TEMP_FILTER_LIST, tagsKey ].join(':'), 0, FilterService.LIMIT );
			});
		});
	}



	static get instance() {
		if( !this.singleton ) {
			const cacheProvider = CacheService.instance;
			const databaseProvider = DatabaseService.instance;
			this.singleton = new FilterService( cacheProvider, databaseProvider )
		}
		return this.singleton;
	}

}

module.exports = FilterService;