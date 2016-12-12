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
			GROUP_TAGS: 'GROUP_TAGS',
			TEMP_FILTER_LIST: 'TEMP',
			TEMP_GROUP_FILTER_LIST: 'TEMP_GROUP'
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

	createFilterModel( userId, name, tags, groupId ) {
		const FilterModel = this.databaseProvider.getModelByName( 'filter' );
		return FilterModel.create({
			userId: userId,
			slug: Util.createSHA256Hash( userId + name + groupId ),
			name: name.trim(),
			tags: tags,
			groupId: groupId
		});
	}

	getUserFilters( userId ) {
		const FilterModel = this.databaseProvider.getModelByName( 'filter' );
		return FilterModel.findAll({
			where: {
				userId: userId
			}
		}).then((filters) => {
			if( !filters ) {
				return [];
			}
			return filters.map(( filter ) => {
				return filter.get();
			});
		});
	}

	getUserGroupFilters( userId, groupId ) {
		const FilterModel = this.databaseProvider.getModelByName( 'filter' );
		return FilterModel.findAll({
			where: {
				userId: userId,
				groupId: groupId
			}
		}).then((filters) => {
			if( !filters ) {
				return [];
			}
			return filters.map(( filter ) => {
				return filter.get();
			});
		});
	}

	getFilterModelBySlug( userId, slug ) {
		const FilterModel = this.databaseProvider.getModelByName( 'filter' );
		return FilterModel.findOne({
			where: {
				slug: slug
			}
		}).then(( model ) => {
			if( !model ) {
				throw new Error('Not found');
			}
			model = model.get();
			return model;
		});
	}

	updateFilterbySlug( userId, slug, payload ) {
		const FilterModel = this.databaseProvider.getModelByName( 'filter' );
		return FilterModel.findOne({
			where: {
				slug: slug,
				userId: userId
			}
		}).then(( model ) => {
			if( !model ) {
				throw new Error('Not found');
			}
			let fields = {
				name: payload.name,
				tags: payload.tags
			};
			return FilterModel.update( fields, {
				where: {
					id: model.get('id')
				}
			}).then(() => {
				return FilterModel.findOne({
					where: {
						slug: slug,
						userId: userId
					}
				});
			}).then((result) => {
				return result.get();
			});
		});
	}

	deleteFilterBySlug( userId, slug ) {
		const FilterModel = this.databaseProvider.getModelByName( 'filter' );
		return FilterModel.findOne({
			where: {
				slug: slug,
				userId: userId
			}
		}).then(( model ) => {
			if( !model ) {
				throw new Error('Not found');
			}
			return FilterModel.destroy({
				where: {
					id: model.get('id')
				}
			}).then( _ => true);
		});
	}

	createTagKey( tag, groupId ) {
		if( !groupId ) {
			return [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TAGS, tag ].join(':');
		}
		return [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.GROUP_TAGS, groupId, tag ].join(':');
	}

	createTempFilterKey( tags, groupId ) {
		let tagsKey = this._createCacheKeyFromTags( tags );
		if( !groupId ) {
			return [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TEMP_FILTER_LIST, tagsKey ].join(':');
		}
		return [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TEMP_GROUP_FILTER_LIST, groupId, tagsKey ].join(':');
	}

	storeTagsByPostId( postId, tags, groupId ) {
		let uniqueTags = new Set( tags );
		let transaction = this.cacheProvider.multi();
		uniqueTags.forEach((tag) => {
			tag = tag.trim().toLowerCase();
			transaction.lpush( this.createTagKey( tag, groupId ), postId );
			// transaction.ltrim( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.TAGS, tag ].join(':'), FilterService.CACHE_SIZE_LIMIT );
			transaction.lpush( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.POSTS, postId ].join(':'), tag );
		});
		// transaction.expire( [ FilterService.NAMESPACE.ROOT, FilterService.NAMESPACE.POSTS, postId ].join(':'), 60 * 60 * 24 * 7 * 4 ); // four week
		return transaction.exec();
	}

	isFilterExists( tags , groupId ) {
		let filterKey = this.createTempFilterKey( tags );
		return this.cacheProvider.exists( filterKey ).then(( isExists ) => {
			return !!isExists;
		});
	}

	createFilterWithTags( tags, groupId, force ) {
		let tagsKey = this._createCacheKeyFromTags( tags );
		let filterKey = this.createTempFilterKey( tags, groupId );
		return this.cacheProvider.exists( filterKey ).then(( isExists ) => {
			if( isExists && !force ) {
				if( !groupId ) {
					return this.getFilterPostIdsByTagsAndPage( tags, 1 );
				}
				return this.getGroupFilterPostIdsByTagsAndPage( tags, groupId, 1 );
			}
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
				key = this.createTagKey( tag, groupId );
				transaction.push(
					this.cacheProvider.llen( key ),
					this.cacheProvider.lrange( key, 0, FilterService.CACHE_SIZE_LIMIT - 1 )
				);
			});
			return this.cacheProvider.del( filterKey ).then(() => {
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

					transaction.length = 0;

					flattenedPosts.forEach((postId) => {
						let key = this.createTagKey( tag, groupId );
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
							insert = this.cacheProvider.rpush( filterKey, post.id );
							if( index < FilterService.LIMIT ) {
								transaction.push(insert);
							}
						});
						transaction.push(this.cacheProvider.expire( filterKey, 100 ));
						return Promise.all(transaction);
					});

				}).then(() => {
					return this.cacheProvider.lrange( filterKey, 0, FilterService.LIMIT - 1 );
				});
			});
		});
	}

	getGroupFilterPostIdsByTagsAndPage( tags, groupId, page ) {
		let tagsKey = this._createCacheKeyFromTags( tags );
		page = isNaN( page ) ? 1 : 0;
		let key = this.createTempFilterKey( tags, groupId );
		this.cacheProvider.expire( key, 100 ); // extend expiration
		return this.cacheProvider.lrange( key, ( page - 1 ) * FilterService.LIMIT, FilterService.LIMIT - 1 );
	}

	getFilterPostIdsByTagsAndPage( tags, page ) {
		let tagsKey = this._createCacheKeyFromTags( tags );
		page = isNaN( page ) ? 1 : 0;
		let key = this.createTempFilterKey( tags );
		this.cacheProvider.expire( key, 100 ); // extend expiration
		return this.cacheProvider.lrange( key, ( page - 1 ) * FilterService.LIMIT, FilterService.LIMIT - 1 );
	}

	_createCacheKeyFromTags( tags ) {
		return tags.sort().join('_').replace(/\s+/g, '-');
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