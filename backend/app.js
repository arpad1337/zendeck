/*
 * @rpi1337
 */

const koa = require('koa');
const compress = require('koa-compress');
const router = require('koa-router')();
const session = require('koa-session-redis');
const koaBody = require('koa-better-body');

const cacheProvider = require('./providers/cache').instance;

const routes = require('./config/routes');

const port = process.env.PORT || 1337;

const app = koa();

app.keys = [ require('./config/secrets').COOKIE_SECRET ];

app.use(
	session( cacheProvider.sessionStoreConfig )
);

const MB6 = 6 * 1024 * 1024;

app.use( koaBody({
    files: true,
    multipart: true,
    formLimit: MB6,
    jsonLimit: MB6,
    bufferLimit: MB6,
    jsonStrict: false,
}) );

app.use( compress() );

let controllers = {};
let middlewares = {};

routes.forEach((route) => {
    let controller = controllers[route.controller] || require('./api/controllers/' + route.controller).instance;
    controllers[route.controller] = controller;

    let middlewareFunctions = [];

    if( route.middlewares && route.middlewares.length > 0 ) {
    	route.middlewares.forEach((middleware) => {
    		middlewares[ middleware ] = middlewares[ middleware ] || require('./middlewares/' + middleware);
    		middlewareFunctions.push( middlewares[ middleware ] );
    	});
    }

    middlewareFunctions.push(function * () {
        yield *controller[route.action](this);
    });

    router[route.method]( route.path, ...middlewareFunctions);
});

app.use(router.routes());

if( !module.parent ) {
	app.listen(port, () => {
		console.log('App listening on port', port);
	});
}