//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

// Creating variables
var price = 0;
var city = ' ';
var type = ' ';
var surface = 0;
var code_postal = 0;
var prixMoyLBC = 0;
var prixMoy_MA_Appartement = 0;
var prixMoy_MA_Maison = 0;
var prixMens_MA_Loyer = 0;
var prixMoyMA = 0;
var msg = '';


app.set( 'view engine', 'ejs' );
app.use( '/assets', express.static( 'assets' ) );

// Creating a function which take the needed values 
// However it's not automatic 
function callLeboncoin( url ) {
    //creating a var for the url

    request( url, function ( error, response, html ) {
        if ( !error && response.statusCode == 200 ) {
            var $ = cheerio.load( html )
            var lbcDataArray = $( 'section.properties span.value' )

            var lbcData = {
                PriceLBC: parseInt( $( lbcDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),
                CityLBC: $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ),
                CodePostal: $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().split( ' ' )[1],
                TypeLBC: $( lbcDataArray.get( 2 ) ).text().trim().toLowerCase(),
                SurfaceLBC: parseInt( $( lbcDataArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )
            }
            // I retrieve the data 
            price = lbcData.PriceLBC;
            city = lbcData.CityLBC;
            type = lbcData.TypeLBC;
            surface = lbcData.SurfaceLBC;
            code_postal = lbcData.CodePostal;
            prixMoyLBC = ( lbcData.PriceLBC ) / ( lbcData.SurfaceLBC );
            console.log( 'Data', lbcData )
        }
        else {
            console.log( error )
        }
    })
}

// Creating a function which take the needed values 
// However it's not automatic 
function CallMA( urlMA ) {

    request( urlMA, function ( error, response, html ) {
        if ( !error && response.statusCode == 200 ) {
            var $ = cheerio.load( html )
            var PriceDataArray = $( 'div.small-4.medium-2.columns.prices-summary__cell--median' )

            var priceData = {
                PriceFlatMA: parseInt( $( PriceDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),
                PriceHouseMA: parseInt( $( PriceDataArray.get( 1 ) ).text().replace( /\s/g, '' ), 10 ),
                MediumPriceMA: parseInt( $( PriceDataArray.get( 2 ) ).text().replace( /\s/g, '' ), 10 )
            }
            // I retrieve the data 
            prixMoy_MA_Appartement = priceData.PriceFlatMA;
            prixMoy_MA_Maison = priceData.PriceHouseMA;
            prixMens_MA_Loyer = priceData.MediumPriceMA;
            console.log( 'data_ma', priceData )
            //return prixMoy_MA_Appartement, prixMoy_MA_Maison, prixMens_MA_Loyer;
            return this;
        }
    });

};

// Creating a function that compares the different price, and return the conclusion
function Compare( urlMA ) {
    request( urlMA, function ( error, response, html ) {
        if ( !error && response.statusCode == 200 ) {

            if ( type = 'Appartment' ) {
                if ( prixMoyLBC < prixMoy_MA_Appartement ) {
                    msg = 'moins'
                }
                else {
                    msg = 'plus'
                }
            }

            if ( type = 'Maison' ) {
                if ( prixMoyLBC < prixMoy_MA_Maison ) {
                    msg = 'moins'
                }
                else {
                    msg = 'plus'
                }
            }
            console.log( 'Message', msg )
        }
    });
};


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {

    var url = req.query.urlLBC
    url = callLeboncoin( url );

    var urlMA = 'https://www.meilleursagents.com/prix-immobilier/' + city + '/'
    CallMA( urlMA );
    Compare( urlMA );

    res.render( 'home', {
        message: url,
        price: price,
        city: city,
        code_postal: code_postal,
        type: type,
        surface: surface,
        prixMoyLBC: prixMoyLBC,
        prixMoyMA: prixMoyMA,
        prixMoy_MA_Appartement: prixMoy_MA_Appartement,
        prixMoy_MA_Maison: prixMoy_MA_Maison,
        prixMens_MA_Loyer: prixMens_MA_Loyer,
        msg: msg,
    });
});

//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});   