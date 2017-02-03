//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' )
var port = 4000;
var MyData;
//creating a new express server
var app = express();

//creating a var for the url
var url = "https://www.leboncoin.fr/ventes_immobilieres/942365902.htm?ca=12_s"

request( url, function ( err, resp, body ) {
    var $ = cheerio.load( body );
    var ville = $( '*[itemprop = "address"]' );
    var villeText = ville.text().trim();

    villeTextsplit = villeText.split( " " );
    var PostalCode = villeTextsplit[villeTextsplit.length - 1];

    var prix = $( '.item_price' ).attr( "content" );

    var surface = $( '#adview > section > section > section.properties.lineNegative > div:nth-child(9) > h2 > span.value' );
    var surfaceText = surface.text().split( " " );

    var typeText = $( '#adview > section > section > section.properties.lineNegative > div:nth-child(7) > h2 > span.value' ).text();

    MyData = {
        type: typeText,
        city: villeText,
        postal_code: PostalCode,
        price: prix,
        surface: surfaceText[0],
    }
    console.log( MyData );


})
app.listen( port );
console.log( 'server is Listening on port' + port );

//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    res.render( 'home', {
        message: MyData
    });
});

//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});