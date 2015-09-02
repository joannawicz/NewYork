//1. document.ready function
//2. init function
//3. inside init --> when user clicks on submit: prevent default,  store values for both dates as 2 different variables to be used for date_range & scroll page down to the next input section (with map)
//4. when user clicks on search after filling in 2nd input form: store user inputs in variables (neighborhoods, activities, other paramaters (i.e. kid-friendly, free etc.) - also have option for 'any' in neighborhoods)
//5. use all user input values in ajax request 
	//5A. Parameters: api-key, version, response-format, ne/sw (for neighborhood coordinates), date_range, limit (# of results returned), offset (to show more results)
	//5B. Facets: category (activity type - i.e. theater), subcategory (i.e. off broadway), neighborhood, free, kid_friendly, times_pick, event_detail_url
//6. success function for ajax request: display results --> create html elements dynamically using $('<div>')
//7. define how many results we want to show and add  "Show More" & "Search Again" buttons
//8. Allow user to save events into a variable called "myEvents"
	//8A. Save user's events in an array that is displayed in a modal by clicking on "My Events" in top right corner of nav bar
	//8B. Allow user to select events from their list of saved events to print off/email information about (format print versions)

var app = {};
app.neighborhood = '';
app.category = '';
app.saved = [];

app.init = function () {
	$('.start-date').on('change', function() {
		$('.start-date-bottom').val($(this).val());
	});
	$('.end-date').on('change', function() {
		$('.end-date-bottom').val($(this).val());
	});

	$('.date-submit').on('click', function (e) {
		e.preventDefault();
		if($('.start-date').val() === "" || $('.end-date').val() === "" ) {
			alert("Sorry, please enter a date range to complete your request.");
		} else {
			$('section.hide').removeClass('hide');
			$('.form-section.hide').removeClass('hide'); //we want to remove the class of hide and then have the screen smooth scroll down to this section
			$('.myevents.hide').removeClass('hide');
			$('header').addClass('hide');
			map.invalidateSize();
		}	
		});

	$('.datepicker').each(function () {
    	$(this).datepicker();
    });


	$('form').on('submit', function (e) {
		e.preventDefault(); 
		$('footer').removeClass('hide');
		$('.neighborhood-question input[type=checkbox]:checked').each(function(){
		    app.neighborhood = app.neighborhood + ' ' + $(this).val();
		  });
		$('.category-question input[type=checkbox]:checked').each(function() {
			app.category = app.category + ' ' + $(this).val();
		});
		app.startDate = $('.start-date-bottom').datepicker('getDate');
		app.endDate = $('.end-date-bottom').datepicker('getDate');
		app.dateRange = moment(app.startDate).format('YYYY-MM-DD') + ':' + moment(app.endDate).format('YYYY-MM-DD');
		app.getInfo(app.dateRange, app.category, app.neighborhood);
	});
};
$('.show-modal').on ('click', function (e) {
	e.preventDefault();
	$('.modal').removeClass('hide');
	$(document.body).addClass('scrollStop');
});
$('.events i').on('click', function () {
	$('.modal').addClass('hide');
	$(document.body).removeClass('scrollStop');
});
L.mapbox.accessToken = 'pk.eyJ1Ijoiam9hbm5hc3RlY2V3aWN6IiwiYSI6IjIzNmNhNjJmNzgxMjhkMzI3M2ZhYjU2Yjk1YmNlZWZmIn0.rA-ceyz6zzzlwCw0Hv0CMQ';
var map = L.mapbox.map('map', 'mapbox.emerald')
    .setView([40.73, -74.0], 13);
map.scrollWheelZoom.disable();

app.getInfo = function(dateRange, category, neighborhood) {
	$.ajax({
		url: 'http://api.nytimes.com/svc/events/v2/listings.jsonp',
		type: 'GET',
		dataType: 'jsonp',
	    data: {
	      'api-key': 'e6a25b3f20881562c56e3247ecd6335d:3:72623857',
	      'facets': 1,
	      'filters': 'category:' + app.category + ',neighborhood:' + app.neighborhood,
	      'limit': 20,
	      'date_range': app.dateRange
	  },
	  	success: function (res) {
	  		// console.log(res);
			app.displayResults(res);
			app.displayResults(app.MuseumInfo);
			app.displayResults(app.EventsInfo);
		}
	});
};

$('#Museums').on ('click', function() {
	$.ajax({
		url: 'http://api.nytimes.com/svc/events/v2/listings.jsonp?',
		type: 'GET',
		dataType: 'jsonp',
	    data: {
	      'api-key': 'e6a25b3f20881562c56e3247ecd6335d:3:72623857',
	      'facets': 1,
	      'filters': 'subcategory: Museums',
	      'limit': 20,
	      'date_range': app.dateRange
	  },
	  	success: function (museumResults) {
			app.MuseumInfo = museumResults;
		}
	});
});

$('#Events').on ('click', function() {
	$.ajax({
		url: 'http://api.nytimes.com/svc/events/v2/listings.jsonp?',
		type: 'GET',
		dataType: 'jsonp',
	    data: {
	      'api-key': 'e6a25b3f20881562c56e3247ecd6335d:3:72623857',
	      'facets': 1,
	      'filters': 'subcategory: Events',
	      'limit': 20,
	      'date_range': app.dateRange
	  },
	  	success: function (eventResults) {
			app.EventsInfo = eventResults;
		}
	});
});

$('.question').on ('click', 'label', function() {
	$(this).toggleClass('choose');
	$(this).find('i').toggleClass('fa-check-square-o fa-square-o');
	$(this).find('input[type=checkbox]').attr('checked','checked');
});	

	app.displayResults = function(res) {
		// $('#results').empty();
		var results = res.results;
		if (results.length===0) {
			var noResults = $('<h3>');
			noResults.text('Sorry, we couldn\'t find any results in your area. Try expanding your search.').addClass('sorry');
			$('#results').append(noResults);
			app.applyMasonry();
		} else {
			// loop over results array to get & display info
			$.each(results, function(index, value) {
				// console.log(index, value);
				app.resultContainer = $('<div>').addClass('result-container');
				var title = $('<p>').text(value.event_name).addClass('title');
				var venue = $('<p>').text(value.venue_name).addClass('venue');
				var address = $('<p>').text(value.street_address).addClass('address');
				var neighborhood = $('<p>').text(value.neighborhood).addClass('neighborhood');
				var description = $('<p>').html(value.web_description).addClass('description');
				var saveContainer = $('<div>').addClass('save-container');
				var save = $('<p>').text('Save to My Activities').addClass('save');
				saveContainer.append(save);
				app.resultContainer.append(title, venue, address, neighborhood, description, saveContainer);
				$('#results').append(app.resultContainer);
				app.applyMasonry();
				L.marker([value.geocode_latitude,value.geocode_longitude]).addTo(map).bindPopup(value.event_name + ":" + "<br>" + value.street_address);
			});
		}
		

	};

app.applyMasonry = function (){
	setTimeout(function() {
		$('#results').masonry({
			itemSelector:'.result-container',
			columnWidth: '.result-container'
		});
		// console.log('working');
	}, 1000);
};

app.displayEverything = function (){
	app.displayResults(app.MuseumInfo); 
	app.displayResults(app.EventsInfo);	
};


$(function () {
	app.init();
	$('#results').on('click', 'p.save', function () {
		var saveItem = $(this).parent().parent();
		var title = saveItem.find('p.title').text();
		var venue = saveItem.find('p.venue').text();
		var address = saveItem.find('p.address').text();
		var description = saveItem.find('p.description').text();
		var savedEvent = {
			saveTitle: title,
			saveDescription: description,
			saveVenue: venue,
			saveAddress: address
		};
		app.saved.push(savedEvent);
		console.log(app.saved);
		var modalTitle = $('<h2>').text(savedEvent.saveTitle).addClass('modalTitle');
		var modalVenue = $('<p>').text(savedEvent.saveVenue).addClass('modalVenue');
		var modalAddress = $('<p>').text(savedEvent.saveAddress).addClass('modalAddress');
		var modalDescription = $('<p>').text(savedEvent.saveDescription).addClass('modalDescription');
		$('.saved-activities').append(modalTitle, modalVenue, modalAddress, modalDescription);
	});
});



//add save to my events
//tooltips show up on map when you hover on that result on the left?
//make modal printable
//show more button (offset somehow?)
//slider images possibly?
//smooth scroll animation when you click submit








