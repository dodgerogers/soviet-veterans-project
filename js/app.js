// Global Ember
window.App = Ember.Application.create({
	LOG_TRANSITIONS: true,
});

// Global var for the title tag
var titleTag = " | Soviet Jewish Veterans";


// regex for cleaning up content
// ((<span\b[^>]*\s\bstyle=(["'])([^"]*)\3[^>]*>))

// OPEN THE APPLICATION IN THE TERMINAL WITH: 
// for mac: (Make sure chrome is closed)
// 	open "/Applications/Google Chrome.app" --args --allow-file-access-from-files
//
// for windows
//	"C:\Program Files (x86)\Google\Chrome\Application\Chrome.exe" --allow-file-access-from-files
	
// ------------------------------------------- APPLICATION CONTROLLER ------------------------------------------//

App.ApplicationController = Ember.Controller.extend({
	currentPathChanged: function () {
    	window.scrollTo(0, 0);
  	}.observes('currentPath')
});

//----------------- WE USE FIXTURES ----------------//

App.ApplicationAdapter = DS.FixtureAdapter.extend();

DS.FixtureAdapter.reopen({
	latency: 100,
    queryFixtures: function(records, query, type) {        
        return records.filter(function(record) {
            for(var key in query) {
                if (!query.hasOwnProperty(key)) { continue; }
                var value = query[key];
                if (record[key] !== value) { return false; }
            }
            return true;
        });
    }
});

// --------------------------------------------------- ROUTER --------------------------------------------------//

App.Router.map(function() {
	this.resource("veterans");
	this.resource("veteran", { path: "/veterans/:veteran_id" });
	this.resource("medals");
	this.resource("medal", { path: "/medals/:medal_id" });
	this.resource("battles");
	this.resource("battle", { path: "/battles/:battle_id" });
	this.resource("films");
	this.resource("film", { path: "/films/:film_id" });
	this.resource("stories");
	this.resource("story", { path: "/stories/:story_id" });
	this.route("about");
	this.resource("sitemap");
	this.route("references");
	this.resource("post-war-climate");
	this.resource("soviet-history");
	this.route("fourOhFour", { path: "*path"});
});


// ------------------------------------------ SECTIONS & STATIC PAGES ------------------------------------------//

//---------------- APPLICATION --------------------//

App.ApplicationRoute = Ember.Route.extend({});

//-------------------- INDEX --------------------//

App.IndexController = Ember.ObjectController.extend({
	veterans: function(){
		// We want to fetch 16 records but no "Leaders"
		// Leaders occur near end of veterans, so we make sure the random number
		// doesn't start when these records begin
		var start = Math.floor(Math.random() * (this.get("veteran").get("length")-28) ) + 1;
		var finish = start + 16;
		
    	return this.get("veteran").slice(start,finish);
	}.property("veteran"),
	medals: function(){
    	return this.get('medal').slice(0,4);
	}.property(),
	battles: function(){
    	return this.get('battle').slice(0,8);
	}.property(),
	films: function(){
    	return this.get('film').slice(0,4);
	}.property(),
});

App.IndexRoute = Ember.Route.extend({
	model: function(){
		return Ember.RSVP.hash({
			veteran: this.store.find("veteran"),
			medal: this.store.find("medal"),
			battle: this.store.find("battle"),
			film: this.store.find("film")
		});
	},
	activate: function() {
		$(document).attr('title', 'Soviet Jewish Veterans Project');
	}
});

// ------------------------------------------- DYNAMIC PAGES --------------------------------------------//

//---------------- POST WAR CLIMATE ----------------//

App.PostWarClimateController = Ember.ObjectController.extend({
	history: function(){
    	return this.get('stories').filterBy("category", "jews-in-russia");
	}.property(),
	worldWar2: function(){
		var events = [];
		var solomon = this.get("veteran");
		var story = this.get('stories').filterBy("category", "ww2");
		
		events.pushObjects(story);
		events.pushObject(solomon);

		return events;
	}.property(),
	postWar: function(){
    	return this.get('stories').filterBy("category", "post-ww2");
	}.property(),
});

App.PostWarClimateRoute = Ember.Route.extend({
	model: function(){
		return Ember.RSVP.hash({
			veteran: this.store.find("veteran", 55), // SOLOMON MIKHOELS
			stories: this.store.find("story"),
		});
	},
	activate: function() {
		$(document).attr('title', 'Post War Climate' + titleTag);
	}
});

//---------------- SOVIET HISTORY ----------------//

App.SovietHistoryController = Ember.ObjectController.extend({
	easternFront: function(){
    	return this.get('battles').filterBy("category", "eastern-front");
	}.property(),
	partisans: function(){
    	return this.get('stories').filterBy("category", "partisans");
	}.property(),
	leaders: function(){
    	return this.get('veterans').filterBy("leader", true);
	}.property(),
	forces: function(){
		return this.get("stories").filterBy("category", "military-unit");
	}.property(),
});

App.SovietHistoryRoute = Ember.Route.extend({
	model: function(){
		return Ember.RSVP.hash({
			veterans: this.store.find("veteran"),
			stories: this.store.find("story"),
			battles: this.store.find("battle"),
		});
	},
	activate: function() {
		$(document).attr('title', 'Soviet History' + titleTag);
	}
});

//------------------- VETERANS -------------------//

App.VeteransController = Ember.ArrayController.extend({
	//sortProperties: ["lastName"],
	sortAscending: true,
	veterans: function() {
		var vets = this.get("model").filterBy("leader", false);
		
		results = Em.ArrayProxy.createWithMixins(Ember.SortableMixin, {
			content: vets, sortProperties: ["lastName"]
		});
		return results
	}.property(),
});

App.VeteransRoute = Ember.Route.extend({
	model: function(){
		return this.store.find("veteran");
	},
	activate: function() {
		$(document).attr('title', 'The Veterans' + titleTag);
	}
});

App.VeteranRoute = Ember.Route.extend({
	model: function(params){
		return this.store.find("veteran", params.veteran_id);
	},
	setupController: function(controller, model) {
		this._super(controller, model);
	    $(document).attr('title',  model.get('name') + titleTag);
	}
});

//--------------------- MEDALS ---------------------//

App.MedalsController = Ember.ArrayController.extend({
	sortProperties: ['name']
});

App.MedalsRoute = Ember.Route.extend({
	model: function(){
		return this.store.find("medal");
	},
	activate: function() {
		$(document).attr('title',  'The Medals' + titleTag);
	}
});

App.MedalRoute = Ember.Route.extend({
	model: function(params){
		return this.store.find('medal', params.medal_id);
	},
	setupController: function(controller, model) {
		this._super(controller, model);
	    $(document).attr('title',  model.get('name') + titleTag);
	}
});

//--------------------- BATTLES ---------------------//

App.BattlesController = Ember.ArrayController.extend({
	sortProperties: ['name']
});

App.BattlesRoute = Ember.Route.extend({
	model: function(){
		return this.store.find("battle");
	},
	activate: function() {
		$(document).attr('title',  'The Battles' + titleTag);
	}
});

App.BattleRoute = Ember.Route.extend({
	model: function(params){
		return this.store.find("battle", params.battle_id);
	},
	setupController: function(controller, model) {
		this._super(controller, model);
	    $(document).attr('title',  model.get('name') + titleTag);
	}
});

//--------------------- FILMS ---------------------//

App.FilmsController = Ember.ArrayController.extend({
	sortProperties: ['name']
});

App.FilmsRoute = Ember.Route.extend({
	model: function(){
		return this.store.find("film");
	},
	activate: function() {
		$(document).attr('title',  'Films Vs Reality' + titleTag);
	}
});

App.FilmRoute = Ember.Route.extend({
	model: function(params){
		return this.store.find("film", params.film_id);
	},
	setupController: function(controller, model) {
		this._super(controller, model);
	    $(document).attr('title',  model.get('name') + titleTag);
	}
});

//--------------------- STORIES ---------------------//

App.StoryRoute = Ember.Route.extend({
	model: function(params){
		return this.store.find("story", params.story_id);
	},
	setupController: function(controller, model) {
		this._super(controller, model);
	    $(document).attr('title',  model.get('name') + titleTag);
	}
});

//-------------------- SITEMAP --------------------//

App.SitemapController = Ember.ObjectController.extend({
	veterans: function(){
    	return this.get('veteran');
	}.property(),
	medals: function(){
    	return this.get('medal');
	}.property(),
	battles: function(){
    	return this.get('battle');
	}.property(),
	films: function(){
    	return this.get('film');
	}.property(),
	stories: function(){
		return this.get("story");
	}.property(),
});

App.SitemapRoute = Ember.Route.extend({
	model: function(){
		return Ember.RSVP.hash({
			veteran: this.store.find("veteran"),
			medal: this.store.find("medal"),
			battle: this.store.find("battle"),
			film: this.store.find("film"),
			story: this.store.find("story"),
		});
	},
	activate: function() {
		$(document).attr('title',  'Sitemap' + titleTag);
	}
});

//-------------------- STATIC PAGES ----------------//

App.AboutController = Ember.ObjectController.extend({});

// Copy in template for about page
App.AboutRoute = Ember.Route.extend({
	activate: function() {
		$(document).attr('title',  'About' + titleTag);
	}
});

// References Page, copy in copy/page/references.html
App.ReferencesRoute = Ember.Route.extend({
	activate: function() {
		$(document).attr('title',  'References' + titleTag);
	}
});

// 404 Error page
App.FourOhFourROute = Ember.Route.extend({});

// -------------------------------------------- VIEWS & COMPONENTS ---------------------------------------------//

//------------------ APPLICATION VIEW --------------//

App.ApplicationView = Ember.View.extend({
	didInsertElement: function(){
		$(document).ready(function() {
			$("#wrap").parent().css("height", "100%");
		});
	}
});

//------------------- VETERAN VIEW ------------------//

App.VeteranView = Ember.View.extend({
	watch: function(){
		Ember.run.later(this, this.ajaxLoad);
	}.observes("controller"),
	
	ajaxLoad: function(){
		// Here we fetch the URL provided in the veteran model in the copy-url div
		// we'll load this into the page if it exists
		
		// First the variables
		var profileDiv = $(".profile-info");
		var attrDiv = profileDiv.find(".attr");
       	var url = profileDiv.find(".copy-url").text();
		var loading = $("<div class='text-center'><h2><i class='fa fa-spinner fa-spin text-muted'></i></h2></div>");
		
		// Only proceed if we find the URL
		if (url) {
			// Clear the .attr div from old content
			attrDiv.html("");
			
			// Insert loading div after this
			loading.insertAfter( attrDiv );
			
			// Log what URL we are going to fetch
			console.log("Rendering: " + url);
			
			setTimeout(function(){
				$.ajax({
		            url: url,
		            type: 'GET',
					timeout: 4000,
		            success: function(data) {
		                // First, hide the loading animation
						loading.remove();

						// Second, load the data into the DOM
						attrDiv.html(data);

						// Now check if IE and browser width
						var ua = window.navigator.userAgent;
						var msie = ua.indexOf("MSIE ");

						if ($(window).width() >= 767 && msie > 0) {
							profileDiv.find('.columnizer').columnize({ columns: 2 });
						}
		            },
					error: function(){
						loading.remove();
						attrDiv.html("Something went wrong, please refresh the page and try again.");
					}
		        });
			}, 300);
		}	
	}
});

App.BattleView = App.VeteranView.extend({});
App.FilmView = App.VeteranView.extend({});
App.StoryView = App.VeteranView.extend({});

App.ReferencesView = Ember.View.extend({
	didInsertElement: function(){
		Ember.run.scheduleOnce('afterRender', this, function(){
			$.get("copy/page/references.html", function(data){
				$(".attr").html(data);
			});
		});
	}
});

// --------------------------------------------- MODELS & FIXTURES ---------------------------------------------//

//--------------------- MODELS ---------------------//

App.BasicRecord = DS.Model.extend({
	name: DS.attr("string"),
	copyright: DS.attr("string"),
	date: DS.attr("string"),
	
	// Dynamically set the page attribute to the model's className
	// So we can use one template, send it multiple objects from different
	// models and then link to them
	page: function(){
		var arr = this.constructor.toString().split(".");
		return arr[arr.length-1].toLowerCase();
	}.property(),
	
	// Copy files get placed in copy/veteran/Firstname-Lastname.jpg
	// This constructs the filename automatically based on the above contraints
	// Any model with lots of html copy will inherit from this
	copy: function() {
		var model = this.get("page");
		if (model) {
			var name = this.get("name").split(" ").join("-");
			return "copy/" + model + "/" + name + ".html";
		}
	}.property("page", "name"),
	
	// We'll follow the same precedence set by the dynamic copy naming.
	// image names are the name of the object, caps and all separated by commas
	image: function(){
		var model = this.get("page");
		if (model) {
			var name = this.get("name").split(" ").join("-");
			return "images/" + model + "/" + name + ".jpg";
		}
	}.property("page", "name"),
	
	formattedURL: function(){
		name = this.get("name");
		return encodeURIComponent(name.split(" ").join("-"));
	}.property("name"),
});

App.Veteran = App.BasicRecord.extend({
	info: DS.attr("string"),
	leader: DS.attr("boolean", { defaultValue: false }),
	medals: DS.hasMany("medal", { async: true }),
	youtube_id: DS.attr("string"),
	
	// Here we override Copy and grab the youtube id from the interview video
	// and fetch the full size thumnail from youtube
	// if that doesn't exist we'll pull and image based off their name
	image: function(){
		var id = this.get("youtube_id");
		var name = this.get("name").split(" ").join("-");
		if (id) {
			return "http://img.youtube.com/vi/" + id + "/0.jpg";
		} else if (name) {
			var model = this.get("page");
			return "images/" + model + "/" + name + ".jpg";
		}
	}.property("youtube_id", "name"),
	lastName: function(){
		return this.get("name").split(" ")[1];	
	}.property("name"),
});

App.Medal = App.BasicRecord.extend({
	name: DS.attr("string"),
	copy: DS.attr("string"),
	copyright: DS.attr("string", { defaultValue: "wikipedia.org" }),
	battles: DS.hasMany("battle", { async: true }),
	veterans: DS.hasMany("veteran", { async: true }),
});

App.Battle = App.BasicRecord.extend({
	category: DS.attr("string"),
	medals: DS.hasMany("medal", { async: true } ),
	veterans: DS.hasMany("veteran", { async: true }),
});

App.Film = App.BasicRecord.extend({
});

App.Story = App.BasicRecord.extend({
	category: DS.attr("string"),
});

// ------------------------------------------------- FIXTURES --------------------------------------------------//

// Fixture data can now be found in js/models/MODELNAME.js
