
// zooms
var zooms = {
	16:[1.2, 6],
	15:[1.6, 5],
	14:[2.0, 4],
	13:[2.0, 3],
	12:[2.5, 2],
	11:[3, 1],
};

// categories can be taken from the legend
var categories = {
	1:'#FFFF00',
	2:'#00CCFF',
	3:'#FF00FF',
	4:'#FFCCFF',
	5:'#FF3300',
	6:'#00FF00',
	7:'#0033FF',
	8:'#CCCCCC',
};

var popup = $('<div class="popup"><div>');

var w, h, body, header, footer;

// set size of map div
function setMapSize(){
	w = $(document).width();
	console.log( w );
	header = $('#header').outerHeight();
	footer = $('#footer').outerHeight();
	body = $(document).height();
	h = body - header - footer;
	$('#content').height( h )
		.width( w );
}
function drawLegend(){
	for (var i=0; i < 8; i++){
		var j = i + 1;
		var color = categories[j];
		$('#category-'+j+' .csquare').css(
				'background-color',
				color
		);
	}
}
setMapSize();
drawLegend();
$('html').css('overflow', 'hidden')

var mouse;
var map;

mapbox.load("bengolder.CDDP-Beijing",
	function (o){
		// make handlers
		var handlers = [
			new MM.DragHandler( map ),
			new MM.DoubleClickHandler( map)
		];
		var dimensions = new MM.Point( w - 18, h );
		// create map
		map = mapbox.map("content", o.layer, dimensions, handlers);
		var svg = d3.select("#content").append("div")
				.attr("class","overlay")
				.append("svg").attr("width",w)
				.attr("height", h);
		map.centerzoom({lat:39.93209999999997, lon:116.38219999999998}, 11);
		map.setZoomRange(11,16);
		map.interaction.auto();
		map.ui.zoomer.add();
		map.interaction.off();
		map.interaction.on({
			on: hoverCallback(map, svg),
			off: mouseoutCallback(map, svg),
		});
	}
);

function hoverCallback( map, svg ){
	return function (obj){
		zoom = map.getZoom();
		var data = obj.data;
		var e = obj.e;
		mouse = {"x": e.pageX, "y": e.pageY};
		// get coordinates
		var loc = new MM.Location(data['lat'], data['long']);
		var point = map.locationPoint(loc);
		var r = calcRadius( data['radius'], map.getZoom() )
		data['color'] = getColor( data['category_code'] );
		var circle = $('<circle class="highlight" />');
		data['x'] = point.x;
		data['y'] = point.y;
		data['r'] = r;
		svg.selectAll("circle").remove();
		svg.selectAll("circle")
			.data( [data,] )
			.enter()
			.append("circle")
			.attr("r", function(d){
				return d["r"] * 0.5;
			}).attr("cx",function(d){
				return d['x'];
			}).attr("cy",function(d){
				return d['y'];
			}).attr("stroke","white").attr("fill",function(d){
				return d.color;
			}).attr("stroke-width",2);
		// make div
		$(".overlay").append( popup );
		popup.css("border-left","2px solid white" )
		// popup.css("border-right","2px solid "+data.color )
		popup.html( $('<p><span class="name">'+data.name+'</span></p>') );
		popup.append( '<p class="address">'+data.address+'</p>');
		popup.append( '<p><span class="category">'+data.category+'</span></p>');
		var checkin  = $('<p class="checkin">\u7B7E\u5230: '+data.checkin+' \u4EBA\u6B21</p>');
		popup.append( checkin);
		pHeight = popup.outerHeight();
		var offset = {'top': point.y - (data.r * 0.5) - pHeight/1.6 + 3,
			'left': point.x}
		popup.offset( offset );
		$('span.category .clabel')
			.css('color', '#808080');
		$('span#category .csquare')
			.css('opacity', '0.6');
		$('span#category-'+data['category_code']+' .clabel')
			.css('color', '#FFFFFF');
		$('span#category-'+data['category_code']+' .csquare')
			.css('opacity', '1.0');
	}
}

function calcRadius( radius, zoom ){
	var factors = zooms[ zoom ];
	var r =  radius / factors[0] + factors[1];
	return r
}
function getColor( category ){
	if (category === 9){
		category = 7;
	}
	var color = $('#category-'+category+' .csquare').css("background-color");
	return color;
}

function mouseoutCallback( map, layer ){
	return function (obj){
		$('svg circle').remove();
		$('div.popup').remove();
		$('span.category .clabel')
			.css('color', '#808080');
		$('span#category .csquare')
			.css('opacity', '0.6');
	}
}

