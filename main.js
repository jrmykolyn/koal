/* -------------------------------------------------- */
/* Koal Set Up
/* -------------------------------------------------- */
const ENV = require( './koal-env' );
const SERVER = ENV.SERVER;
const PATHS = ENV.PATHS;
const FILE_EXTENSIONS = ENV.FILE_EXTENSIONS;


/* -------------------------------------------------- */
/* Import Modules
/* -------------------------------------------------- */
var http = require( 'http' );
var fs = require( 'fs' );
var ejs = require( 'ejs' );

/* -------------------------------------------------- */
/* Declare Functions */
/* -------------------------------------------------- */
function handleRequest(request, response) {
    var route_arr = getRouteArr( request.url );
  
    if ( route_arr ) {

        if ( route_arr[route_arr.length - 1].indexOf('.') !== -1 ) {
            parseAssetRequest( route_arr, response );
        } else {
            parseRoute( route_arr, response );
        }

    } else {
        return404( response );
    } 
}


function getRouteArr(url) {
    if ( !url || typeof url !== 'string' ) { return null; }

    switch ( url ) {
    case '/':

        return ['/'];
    default:
        return url.substring( 1 ).split( '/' );
    }
}


function parseAssetRequest( routeArr, response ) {
    var asset_path = routeArr.slice( routeArr.length - 2 ).join( '/' );

    returnAsset( asset_path, response );
}


function parseRoute( routeArr, response ) {
    switch ( routeArr[0] ) {
    case '/':
    case 'index':
        returnPage( 'index', response );

        break;
    case 'pages':
        returnPage( routeArr[1], response );

        break;
    case 'projects':
        returnProject( routeArr[1], response );

        break;
    default:
        returnAsset( routeArr.join('/'), response );
    }
}


function returnPage( page, response ) {
    getFile( 
        PATHS.PAGES.PATH + page + FILE_EXTENSIONS.TEMPLATE,
        function( data ) {
            response.end( data );
        },
        function() {
            return404( response );
        }
  );
}


function returnAsset( asset, response ) {
    getFile(
    PATHS.PUBLIC.PATH + asset,
    function( data ) {
        response.end( data );
    },
    function() {
        return404( response );
    }
  );
}


function return404( response ) {
    response.writeHead( 404 );

    fs.readFile( PATHS.PAGES.PATH + '404' + FILE_EXTENSIONS.TEMPLATE, function(err, data) {
        if ( err ) {
            response.end( err );
        }

        response.end( data );
    });
}


// TODO:
// Update function to parse `config` && `public` data.
// Compile template and execute response.
function returnProject( project, response ) {  
    parseProjectConfig( project )
        .then( parseProjectData )
        .then( buildProjectTemplate )
        .then(
            function( data ) {
                response.end( data );
            }
        )
        .catch( function( err ) {
            return404( response );
        });
}


// TODO:
// Update function to:
// - Evaluate contents of project 'config' file;
// - Resolve with either well-formed 'config' options or framework defaults.
function parseProjectConfig( projectName ) {
    return new Promise(function( resolve ) {
        getFile(
            PATHS.PROJECTS.PATH + projectName + '/config.json',
            function( data ) {
                resolve( projectName, data );
            },
            function( err ) {
                resolve( projectName, null );
            }
        );
    });
}


// TODO:
// Update function to:
// - Scrape 'public' file for data and resolve if possible;
// - Otherwise, reject with contextual message.
function parseProjectData( projectName, configData ) {
    return new Promise(function( resolve, reject ) {
        getFile(
            PATHS.PROJECTS.PATH + projectName + '/public.json',
            function( data ) {
                resolve( { project_name: projectName, project_data: data } );
            },
            function( err ) {
                reject( err );
            }
        );
    });
}


// TODO:
// Update function to:
// - Rebuild logic for returning `view`';
// - Update logic to dynamically serve 'template' or 'page' file.
function buildProjectTemplate( data ) {
    // Parse properties on `data` obj. and assign to local vars.
    var layout_data = JSON.parse( data.project_data.toString() ),
        template_data = JSON.parse( data.project_data.toString() );

    // Build `opts` object.
    var opts = {
        partial: 'templates/demo-partial.ejs',
        layoutData: layout_data,
        templateData: template_data
    };

    return new Promise(function( resolve, reject ) {
        try {
            ejs.renderFile( PATHS.VIEWS.PATH + 'layout.ejs', opts, function( err, result ) {
                if (!err) {
                    resolve( result );
                }
                reject( err );
            });
        } catch ( err ) {
            reject( err );
        }
    });
}


function getFile( path, onSuccess, onFail ) {
    fs.readFile( path, function( err, data ) {
        if ( err ) {
            onFail( err );
            return;
        }

        onSuccess( data );
    });
}


/* -------------------------------------------------- */
// Declare Vars.
/* -------------------------------------------------- */
var server = http.createServer(handleRequest);


/* -------------------------------------------------- */
/* Initialize Server */
/* -------------------------------------------------- */
server.listen( SERVER.PORT, function() {
    console.log( `LISTENING ON PORT ${SERVER.PORT}` );
} );
