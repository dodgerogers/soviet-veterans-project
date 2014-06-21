// Global Ember
App = Ember.Application.create({
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
	latency: 200,
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
	sortProperties: ["lastName"],
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

App.FilmsController = Ember.ArrayController.extend({});

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

App.AboutRoute = Ember.Route.extend({
	activate: function() {
		$(document).attr('title',  'About' + titleTag);
	}
});

App.ReferencesRoute = Ember.Route.extend({
	activate: function() {
		$(document).attr('title',  'References' + titleTag);
	}
});

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
		// Here we fetch the URL provided in the veteran model
		// load this data, which represents the main copy
		// of the particular vet into the attr div
       	var url = $(".profile-info").find(".copy-url").text();
		console.log("Rendering: " + url);
		$.get(url, function(data) {
			// First we'll load the data into the DOM
			$(".profile-info .attr").html(data);
			
			// Now check if IE and browser width
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf("MSIE ");
			
			if ($(window).width() >= 767 && msie > 0) {
				$('.profile-info .columnizer').columnize({ columns: 2 });
			}
		});
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

// ------------------------------------------------------------------------------------------------------------//
// ------------------------------------------------- VETERANS -------------------------------------------------//
// ------------------------------------------------------------------------------------------------------------//

App.Veteran.FIXTURES = [
//----------- VETERANS -----------------//
	{
		id: 1,
		name: "Alexi Litvachuk",
		date: "Born 1921 Vinnitsa, Ukraine.",
		info: "Communications - Eastern Front, Kishinev, Defense Of Moscow.",
		medals: [101],
	},
	{
		id: 2,
		name: "Alexi Shtern",
		date: "Born June 24th 1922 Odessa, Ukraine.",
		info: "Sergeant Major in tank unit: Battle Of Stalingrad, Danzig, And Capture Of Konigsberg",
		medals: [101,105, 109, 114, 125, 126, 122],
	},
	{
		id: 3,
		name: "Anna Khaliavskaya",
		date: "Born March 20th 1924 Minsk, Belarus.",
		info:  "Belarusian Partisan",
		medals: [107, 101],
	},
	{
		id: 4,
		name: "Arkadiy Novokolsky",
		date: "Born 1921 Odessa, Ukraine.",
		info: "Air Force Pilot And Engineer - Defense of Moscow",
		medals: [101,102, 106],
	},
	{
		id: 5,
		name: "Berta Tsirkina",
		date: "Born January 1935 Leningrad, Soviet Union.",
		info: "Siege Of Leningrad Survivor.",
		medals: [100, 101],
		youtube_id: "vcrMrF3BDXI",
	},
	{
		id: 6,
		name: "Boris Kravitz",
		date: "Born 1927 Noravlla, Belarus.",
		info: "Private In Border Detachment - Lithuania, Belarus, Konigsberg: One of 3 Jews to work at NKVD (precursor to KGB) investigating POWs for war crimes at a camp near Minsk",
		medals: [101,105, 114],
	},
	{
		id: 7,
		name: "Danil Zharnitsky",
		date: "Born May 19th 1927 Illyntsy, Ukraine.",
		info: "Partisan that became sniper in Red Army, served for 22 years working in SMERSH (Counter Intelligence Department) and Contruction Battalion",
		medals: [101,109, 107, 106],
	},
	{
		id: 8,
		name: "David Fisherman",
		date: "Born April 6th 1915 Tiraspol, Moldov.",
		indo: "Mechanic/Driver Light Tank Brigade - Defence Of Caucuses And Vitebsk Liberations Of Lithuania And Riga",
		medals: [101, 102],
		youtube_id: "LAn3DohZlgs",
	},
	{
		id: 9,
		name: "Efim Perlitch",
		date: "Born 1927 Malin, Ukraine.",
		info: "Infantry And Paratrooper - Stalingrad, Caucuses, Crimea",
		medals: [101,105,109],
		youtube_id: "xudC1nRvxSI",
	},
	{
		id: 10,
		name: "Eugene Kats",
		date: "Born January 6 1925 Desna, Poland.",
		info: "Polish Partisans, Heavy Machine Gun Division",
		medals: [101,107,105, 106, 114],
	},
	{
		id: 11,
		name: "Filipp Potievsky",
		date: "Born August 6th 1922 Malin, Ukraine.",
		info: "Wounded Near Moscow And Was Rescued By Famer Before Returning To Red Army",
		medals: [101,105,116,102],
		youtube_id: "_d4GtrR2WZk",
	},
	{
		id: 12,
		name: "Grigory Genin",
		date: "Born March 8th 1924 in Astrakhan, Soviet Union.",
		info: "Platoon Commander 550 Rifle Regiment Battle of Stalingrad, Fought near Odessa, in Romania, and Bulgaria, Liberations of Vienna and Budapest",
		medals: [101,109, 118, 113, 102, 104, 103],
	},
	{
		id: 13,
		name: "Grigory Svirsky",
		date: "Born September 29th 1921 Ufa, Soviet Union.",
		info: "Air Force Mechanic And Gunner Based Near Arctic Sea. Well Known In Russia For WWII Books And Social Criticism - Works Banned In 1968 And He Was Forced To Leave In 1972.",
		medals: [101,],
		youtube_id: "-qPek3t137o",
	},
	{
		id: 14,
		name: "Isaak Ashmian",
		date: "Born December 19th 1919 Kharkov, Ukraine (raised in Moscow).",
		info: "Volunteer Engineer Lieutenant Military Construction Corps, Moscow and Belarusian Front",
		medals: [101],
		youtube_id: "rJT-I-f2Wvg",
	},
	{
		id: 15,
		name: "Isaak Budnitsky",
		date: "Born April 29th 1918 Vasilkov, Ukraine.",
		info: "Sergeant Major 255th Aviation Service Regiment, Battle of Stalingrad, Crimea, Liberation Of Vienna",
		medals: [109, 101, 102, 123],
		youtube_id: "8CGypoTOzlQ",
	},
	{
		id: 16,
		name: "Isaak Kogan",
		date: "Born March 20th 1926 Rakitnoyeye, Ukraine",
		info: "Submachine gunner on 2nd Belorussian Front",
		medals: [101, 106],
	},
	{
		id: 17,
		name: "Isaak Zarembo",
		date: "Born on June 29th 1925 Kraslovo, Latvia",
		info: "Private 43rd Latvian Guards Division. Participated In Defense of Moscow and Liberation of Riga",
		medals: [101,105, 104],
	},
	{
		id: 18,
		name: "Lazar Chukhovich",
		date: "Born November 13th 1926 Tashkent, Uzbekistan.",
		info: "Sniper - 41st Guards Division. Ukrainian Front and Liberation Of Budapest",
		medals: [101,102],
		youtube_id: "9V27QtAJKe0",
	},
	{
		id: 19,
		name: "Leonid Feldman",
		date: "Born 1919 In Bershad Ukraine",
		info: "Master Sergeant Communications Platoon 5th Armoured Landing Division. Lieutenant Colonel By End Of The War: Leningrad, Konigsberg, Riga",
		medals: [102, 101, 106, 105],
	},
	{
		id: 20,
		name: "Leonid Sheinker",
		date: "Born March 6th 1920 in Tashkent, Uzbekistan",
		info: "Air Force Engineer and Gunner. Fought in Defense of Moscow and Capture of Berlin",
		medals: [101,112],
	},
	{
		id: 21,
		name: "Lev Pikus",
		date: "Born May 1st 1927 Minsk, Belarus",
		info: "Brest Partisans",
		medals: [101],
		youtube_id: "nV5JInaRMT4",
	},
	{
		id: 22,
		name: "Liya Liberova",
		date: "Born 1923 Novozybkov, Soviet Union",
		info: "Senior Sergeant - Anti air defense Leningrad",
		medals: [101,108],
	},
	{
		id: 23,
		name: "Losif Zibenberg",
		date: "Born April 30th 1922 Faleshty Bessarabia (present day Moldova)",
		info: "Private in communications platoon in armoured landing division (paratrooper). Stalingrad, Kursk, Liberation of Prague",
		medals: [101,115, 109],
		youtube_id: "fE_7MHPehis",
	},
	{
		id: 24,
		name: "Mark Bass",
		date: "Born December 25th 1922 Smolensk, Soviet Union.",
		info: "Member of The Moscow Motorcycle Battalion. Later served In Mongolia",
		medals: [101],
		youtube_id: "Q3pPGAILs6s",
	},
	{
		id: 25,
		name: "Mikhail Bass",
		date: "Born March 16th 1928 Mink, Belarus",
		info: "Belarusian Partisans, later joined Red Army. Fought in Poland and at Capture Of Konigsberg",
		medals: [101, 107],
		youtube_id: "HesaMLmmnGk",
	},
	{
		id: 26,
		name: "Moisei Chernoguz",
		date: "Born December 15th 1923 Sovran, Ukraine.",
		info: "Radio Operator 30th Attack Army. Placed in command of recently released convicts, fighting in war for reduced sentences",
		medals: [101,110, 106, 116],
		youtube_id: "FMfgxmCle_o",
	},
	{
		id: 27,
		name: "Nina Goldstein",
		info: "Siege Of Leningrad Survivor.",
		medals: [101,100,101],
	},
	{
		id: 28,
		name: "Noah Shneidman",
		date: "Born September 24th 1924 in Vilno, Poland (now Vilnus Lithuania).",
		info: "Front Line Infantry - Polish Partisans, Capture of Konigsberg and Berlin.",
		medals: [101,107, 114],
		youtube_id: "RGQMoxf8D0c",
	},
	{
		id: 29,
		name: "Semen Perlamutrov",
		date: "Born March 1 1920 Ukraine.",
		info: "Private in anti tank artillery - Siege Of Leningrad",
		medals: [101],
	},
	{
		id: 30,
		name: "Shelma Mushkat",
		date: "Born 1919 Sarkovshizno, Poland.",
		info: "Artillery Commander - Leningrad, Continuation War, Mongolia.",
		medals: [101,104],
	},
	{
		id: 31,
		name: "Shulim Grinberg",
		date: "Born February 21st 1922 Rybnitsa, Moldova.",
		info: "Air Force Gunner And Mechanic - Defence Of Moscow Battle Of Kursk.",
		medals: [102, 101, 106],
	},
	{
		id: 32,
		name: "Sima Vesoli",
		date: "Born January 1st 1923 Gomel, Belarus.",
		info: "Nurse - Germany And North Korea.",
		medals: [101,117, 122],
	},
	{
		id: 33,
		name: "Valentin Rabinovich",
		date: "Born December 25th 1922 in Riga, Latvia.",
		info: "Anti aircraft battalion helped break Siege Of Leningrad.",
		medals: [101,108],
		youtube_id: "FQ_ShgyQoJM",
	},
	{
		id: 34,
		name: "Venyamin Frumkin",
		date: "Born 1922 In Smolensk, Soviet Union.", 
		info: "Regiment Engineer - Defence Of Moscow, Capture Of Konigsberg, Advisor to North Korean Army.",
		medals: [110,114, 102, 101],
		youtube_id: "jEc7S6zeX2g",
	},
	{
		id: 35,
		name: "Yakov Gelfandbein",
		date: "Born 1922 Kherson, Ukraine.",
		info: "2nd Leningrad Artillery Corps And Later Paratrooper. Defence Of Leningrad, Battle Of Stalingrad, Ukrainian Front, Liberation Of Auschwitz",
		medals: [106,109, 110, 102, 101],
	},
	{
		id: 36,
		name: "Yakov Kreinin",
		info: "Katyusha (rockets) Platoon Commander 303 Guards Mortar Regiment: Ukraine, Poland, Kharkov, Capture of Berlin",
		medals: [102,101,112],
	},
	{
		id: 37,
		name: "Yakov Perlamutrov",
		info: "Machine Gunner: Ukrainian Front and Battle of Kursk.",
		medals: [101],
		youtube_id: "B-kaqE4-bKw",
	},
	{
		id: 38,
		name: "Yakov Rats",
		date: "Born May 28th 1923 Vitebsk, Belarus (moved to Leningrad as a baby).",
		info: "Tank Repair Instructor whose family survived Siege Of Leningrad.",
		medals: [101, 102],
	},
	{
		id: 40,
		name: "Yefim Feldman",
		date: "Born June 27 1923.",
		info: "Paramedic In Light Artillery Unit, Liberation of Riga",
		medals: [101,102, 106, 105,121],
	},
	{
		id: 41,
		name: "Yevgeniy Vesoli",
		date: "Born April 15th 1926 Rechista, Belarus.",
		info: "Mechanic Normandie-Nieman Regiment: Battle Of Berlin.",
		medals: [100,101, 122],
	},
	{
		id: 42,
		name: "Zinoviy Feygin",
		date: "Born April 3rd 1926 Sverdlovsk, Soviet Union.",
		info: "Radio Operator And Paratrooper Ukrainian Front, Leningrad, Liberation Of Vienna.",
		medals: [100,101,123],
	},
	{
		id: 43,
		name: "Zinoviy Rovner",
		medals: [101],
	},
	{
		id: 44,
		name: "Zinoviy Ofsei",
		date: "Born June 5th 1919 Yenakievo, Ukraine.",
		info: "Military Surgeon 13th Guards Division - Ukrainian Front.",
		medals: [101,111],
		youtube_id: "bsTXUP0Ja00",
	},
	{
		id: 45,
		name: "Zinoviy Rogov",
		date: "Born July 28th 1928 Leningrad, Soviet Union.",
		info: "Child During Siege Of Leningrad - Dug Defensive Trenches",
		medals: [100,101],
	},
	// SPECIAL CASES
	// Add a boolean column to vets to distinguish this group
	{
		id: 46,
		name: "Georgy Zhukov",
		info: "1896 - 1974 Marshal Of The Soviet Union",
		medals: [100],
		leader: true,
		copyright: "1945-2010info.com",
	},
	{
		id: 47,
		name: "Seymon Budyonny",
		date: "1883 - 1973",
		info: "Marshal Of The Soviet Union",
		medals: [100],
		leader: true,
		copyright: "wikipedia.org",
	},
	{
		id: 48,
		name: "Ivan Konev",
		date: "1897 - 1973",
		info: "Marshal Of The Soviet Union",
		medals: [100],
		leader: true,
		copyright: "wikipedia.org",
	},
	{
		id: 49,
		name: "Aleksandr Vasilevsky",
		info: "1895 - 1977 Red Army Chief Of General Staff.",
		medals: [100],
		leader: true,
		copyright: "ww2db.com",
	},
	{
		id: 50,
		name: "Joseph Stalin",
		date: "1878 - 1953",
		info: "General Secretary Of The Soviet Union.",
		medals: [100],
		leader: true,
		copyright: "biography.com",
	},
	{
		id: 54,
		name: "Andrey Vlasov",
		leader: true,
		info: "1901 - 1946 Soviet General Who Defected To Nazis",
		medals: [],
		copyright: "modern.az",
	},
	{
		id: 55,
		name: "Solomon Mikhoels",
		date: "1890 - 1948",
		info: "Director of the Jewish Anti Fascist Committe",
		medals: [120],
	},
];

// ---------------------------------------------------------------------------------------------------------//
// ------------------------------------------------- MEDALS ------------------------------------------------//
// ---------------------------------------------------------------------------------------------------------//

App.Medal.FIXTURES = [
	{
		id: 100,
		name: "Hero of the Soviet Union",
		copy: "The highest military or civilian honor awarded for a heroic act.*",
		battles: [],
		veterans: [5,27,41,42,46,49],
	},
	{
		id: 101,
		name: "Order of the Patriotic War (1st and 2nd Class)",
		copy: "Given to all members of the Soviet Armed Forces that participated in World War 2.",
		battles: [],
		// Use this line to include all veteran ids
		// Change Veteran to Medal to perform same action on the medal model
		veterans: App.Veteran.FIXTURES.map(function(object) { return object.id; }),
	},
	{
		id: 102,
		name: "Order of the Red Star",
		copy: "Awarded to Red Army personnel for exceptional service in defense of the Soviet Union in war or peace time.",
		battles: [],
		veterans: [15,18,8,35,9,4,40,19,38,12,36],
	},
	{
		id: 103,
		name: "Order of the Red Banner",
		copy: "Awarded in recognition of an extraordinary military deed.",
		battles: [],
		veterans: [12],
	},
	{
		id: 104,
		name: "Order of Glory",
		copy: "Awarded to soldiers for bravery. Recipients move from bronze, to silver, to gold with each heroic act.",
		battles: [],
		veterans: [12,17,30],
	},
	{
		id: 105,
		name: "Medal for Courage",
		copy: "Similar to the Order of Glory though slightly less prestigious and typically awarded in defensive situations.",
		battles: [],
		veterans: [6,2,9,10,11,17,19,40],
	},
	{
		id: 106,
		name: "Medal for Battle Merit",
		copy: "Awarded for combat action resulting in military success.",
		battles: [],
		veterans: [16,40,10,19,26,4,7],
	},
	{
		id: 107,
		name: "Medal for Partisan of the Patriotic War (1st and 2nd Class)",
		copy: "Given to all partisans who fought on the Soviet side without being official members of the armed forces.",
		battles: [],
		veterans: [3,7,10,25,28],
	},
	{
		id: 108,
		name: "Medal for Defense of Leningrad",
		copy: "Awarded to all personnel who contributed to the defense of Leningrad.",
		battles: [200],
		veterans: [22,33],
	},
	{
		id: 109,
		name: "Medal For Defense of Stalingrad",
		copy: "Awarded to all personnel who contributed to the defense of Stalingrad.",
		battles: [203],
		veterans: [23,2,12,35,15,9],
	},
	{
		id: 110,
		name: "Medal For Defense of Moscow",
		copy: "Awarded to all personnel who contributed to the defense of Moscow.",
		battles: [201],
		veterans: [26,34,35],
	},
	{
		id: 111,
		name: "Medal For Defense of Kiev",
		copy: "Awarded to all personnel who contributed to the defense of Kiev.",
		battles: [],
		veterans: [44],
	},
	{
		id: 112,
		name: "Medal For Capture of Berlin",
		copy: "Awarded to all personnel who contributed to the capture of Berlin.",
		battles: [202],
		veterans: [20,36],
	},
	{
		id: 113,
		name: "Medal For Capture of Budapest",
		copy: "Awarded to all personnel who contributed to the capture of Budapest.",
		battles: [207],
		veterans: [12],
	},
	{
		id: 114,
		name: "Medal For Capture of Konigsberg",
		copy: "Awarded to all personnel who contributed to the capture of Konigsberg.",
		battles: [204],
		veterans: [6,2,10,28,34],
	},
	{
		id: 115,
		name: "Medal For Capture of Prague",
		copy: "Awarded to all personnel who contributed to the capture of Prague.",
		battles: [206],
		veterans: [23],
	},
	{
		id: 116,
		name: "Medal For Liberation of Warsaw",
		copy: "Awarded to all personnel who contributed to the capture of Warsaw.",
		battles: [],
		veterans: [23,11],
	},
	{
		id: 117,
		name: "Medal For Victory over Japan",
		copy: "Awarded to all personnl who contributed to the soviet campaign in Asia.",
		battles: [209],
		veterans: [32,45],
	},
	{
		id: 118,
		name: "Medal For Victory over Vienna",
		copy: "Awarded to all personel who contributed to the capture of Vienna. ",
		battles: [],
		veterans: [12,18,15],
	},
	{
		id: 119,
		name: "Order of Victory",
		copy: "Awarded to Generals for orchestrating a 'radical change in situation in favour of The Red Army'. It is the rarest medal with only 20 recipients. Made with rubies, platinum, and 150 diamonds, the medal itself is priceless.",
		battles: [],
		veterans: [46,50,49,48],
	},
	{
		id: 120,
		name: "People's Artist Of The USSR",
		copy: "Awarded for outstanding contribution to the performing arts",
		battles: [],
		veterans: [55],
	},
	{
		id: 121,
		name: "Liberation of Riga",
		copy: "Awarded to all personel who contributed to the Liberation of Riga",
		battles: [],
		veterans: [26, 40],
	},
	{
		id: 122,
		name: "Victory over Germany",
		copy: "Awarded for victory over Germany",
		battles: [],
		veterans: [11, 32, 41],
	},
	{
		id: 123,
		name: "Liberation of Vienna",
		copy: "Awarded for the Liberation of Vienna",
		battles: [],
		veterans: [15, 42],
	},
	{
		id: 125,
		name: "Battle of Stalingrad",
		copy: "Awarded to all personel who contributed to the Battle of Stalingrad.",
		battles: [],
		veterans: [2],
	},
	{
		id: 126,
		name: "Battle of Danzig",
		copy: "Awarded to all personel who contributed to the Battle of Danzig.",
		battles: [],
		veterans: [2],
	},
	{
		id: 127,
		name: "Liberation Of Caucuses And Crimea",
		copy: "Awarded to all personel who contributed to the Battle of Danzig.",
		battles: [],
		veterans: [2, 15],
	},
	{
		id: 128,
		name: "Medal for the Capture Of New Lands",
		copy: "Awarded to all personel who contributed to the Battle of Danzig.",
		battles: [],
		veterans: [35],
	}
];

// ---------------------------------------------------------------------------------------------------------//
// ------------------------------------------------- BATTLES -------------------------------------------------//
// ---------------------------------------------------------------------------------------------------------//

App.Battle.FIXTURES = [
	{
		id: 200,
		name: "Siege of Leningrad",
		date: "July 5 - August 23 1943",
		medals: [108],
		veterans: [27,22,30,5,43],
		copyright: "Mentormob.com",
	},
	{
		id: 201,
		name: "Defense of Moscow",
		date: "September 30 1941 - April 20 1942",
		medals: [110],
		veterans: [26,34,4,11,20],
		copyright: "PBS.org",
	},
	{
		id: 202,
		name: "Battle of Berlin",
		date: "April 16 - May 2 1945",
		medals: [112],
		veterans: [36,20,28],
		copyright: "Kingsacademy.com",
	},
	{
		id: 203,
		name: "Battle of Stalingrad",
		date: "August 23 - February 2 1943",
		medals: [109],
		veterans: [15,12,9,2,723],
		copyright: "Theoldphotoalbum.com",
	},
	{
		id: 204,
		name: "Battle of Konigsberg",
		date: "July 5 - August 23 1943",
		medals: [114],
		veterans: [25,19,10,6,28],
		copyright: "Quintessentialruminations.com",
	},
	{
		id: 205,
		name: "Liberation of Vienna",
		date: "April 2 - 14 1945",
		medals: [],
		veterans: [15,18,42,12],
		copyright: "Albumwar2.com",
	},
	{
		id: 206,
		name: "Liberation of Prague",
		date: "May 6 - 11 1945",
		medals: [115],
		veterans: [14,27,23],
		copyright: "Militaryphotos.com",
	},
	{
		id: 207,
		name: "Liberation of Budapest",
		date: "December 29 1944 - February 13 1945",
		medals: [113],
		veterans: [18,35,12],
		copyright: "Ww2incolor.com",
	},
	{
		id: 208,
		name: "Liberation of Riga",
		date: "September 15 - 30 1944",
		medals: [],
		veterans: [26,19,20,8,17],
		copyright: "Mixnews.lv.com",
	},
	{
		id: 209,
		name: "War Against Japan",
		date: "1905 - 1939",
		medals: [117],
		veterans: [24,43,41],
		category: "eastern-front",
		copyright: "Englishrussia.com",
	},
	{
		id: 210,
		name: "Battle of Kursk",
		date: "July 5 - August 23 1943",
		medals: [],
		veterans: [37,23],
		copyright: "Warhistoryonline.com",
	},
	{
		id: 211,
		name: "Stalin's Great Purge",
		date: "1936 - 1939",
		medals: [],
		veterans: [],
		category: "eastern-front",
		copyright: "Conservapedia.com",
	},
	{
		id: 212,
		name: "War Against Germany",
		date: "1939 - 1942",
		medals: [],
		veterans: [25,35,10],
		category: "eastern-front",
		copyright: "Allworldwars.com",
	},
	{
		id: 213,
		name: "War Against Finland",
		date: "1939 - 1944",
		medals: [],
		veterans: [],
		category: "eastern-front",
		copyright: "Vilnews.com",
	}
];

// ---------------------------------------------------------------------------------------------------------//
// ------------------------------------------------- FILMS -------------------------------------------------//
// ---------------------------------------------------------------------------------------------------------//

App.Film.FIXTURES = [
	{
		id: 300,
		name: "Enemy at the Gates",
		copyright: "imdb.com",
	},
	{
		id: 301,
		name: "Defiance",
		copyright: "imdb.com",
	},
	{
		id: 302,
		name: "The Dirty Dozen",
		copyright: "imdb.com",
	},
	{
		id: 303,
		name: "Inglourious Basterds",
		copyright: "imdb.com",
	},
];

// ---------------------------------------------------------------------------------------------------------//
// ------------------------------------------------- STORIES -----------------------------------------------//
// ---------------------------------------------------------------------------------------------------------//

App.Story.FIXTURES = [
// --------------------------------------------- JEWS IN RUSSIA --------------------------------------------//
//Brief History Of Jews In Russia And The Soviet Union
	{
		id: 400,
		name: "Tsarist Period",
		date: "1700 - 1917",
		category: "jews-in-russia"
	},
	{
		id: 401,
		name: "Jews In The Russian Revolution",
		date: "1917 - 1920",
		category: "jews-in-russia"
	},
	{
		id: 402,
		name: "Jews In The Soviet Union 1920 - 1930",
		date: "1920 - 1930",
		category: "jews-in-russia"
	},
//World War II Period	
	{
		id: 403,
		name: "Jewish Anti Fascist Committee (JAC)",
		date: "1942 - 1948",
		category: "ww2"
	},
//Post World War II - Stalin's War Against The Jews 1948 - 1953
	{
		id: 404,
		name: "JAC Executions Crimean Affair and Night Of Murdered Poets",
		date: "1948 - 1952",
		category: "post-ww2"
	},
	{
		id: 405,
		name: "Doctor's Plot",
		date: "1952 - 1953",
		category: "post-ww2"
	},
// ------------------------------------------------ PARTISANS------------------------------------------------//
	{
		id: 410,
		name: "Underground resistance movements that fought the Nazis",
		date: "1941 - 1945",
		category: "partisans",
		copyright: "nme.com",
	},
// --------------------------------------------- FORCES + BADGES --------------------------------------------//
	{
		id: 411,
		name: "SMERSH",
		date: "1943 - 1946",
		category: "military-unit",
		copyright: "deviantart.com",
	},
	{
		id: 412,
		name: "NKVD",
		date: "1934 - 1945",
		category: "military-unit",
		copyright: "forum.szone-online.net",
	},
];