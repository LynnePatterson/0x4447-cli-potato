let npm = require('./package.json');
let term = require('terminal-kit').terminal;
let program = require('commander');
let request = require('request');

//   _____   ______   _______   _______   _____   _   _    _____    _____
//  / ____| |  ____| |__   __| |__   __| |_   _| | \ | |  / ____|  / ____|
// | (___   | |__       | |       | |      | |   |  \| | | |  __  | (___
//  \___ \  |  __|      | |       | |      | |   | . ` | | | |_ |  \___ \
//  ____) | | |____     | |       | |     _| |_  | |\  | | |__| |  ____) |
// |_____/  |______|    |_|       |_|    |_____| |_| \_|  \_____| |_____/
//

//
//	The CLI options for this app. At this moment we just support Version
//
program
	.version(npm.version);

//
//	Just add an empty line at the end of the help to make the text more clear
//	to the user
//
program.on('--help', function() {
	console.log("");
});

//
//	Pass the user input to the module
//
program.parse(process.argv);

//
//	Listen for key preses
//
term.on('key', function(name, matches, data ) {

	//
	//	1.	If we detect CTR+C we kill the app
	//
	if(name === 'CTRL_C' )
	{
		//
		//	1. 	Lets make a nice user experience and clean the terminal window
		//		before closing the app
		//
		term.clear();

		//
		//	->	Kill the app
		//
		process.exit();
	}

});

//	 __  __              _____   _   _
//	|  \/  |     /\     |_   _| | \ | |
//	| \  / |    /  \      | |   |  \| |
//	| |\/| |   / /\ \     | |   | . ` |
//	| |  | |  / ____ \   _| |_  | |\  |
//	|_|  |_| /_/    \_\ |_____| |_| \_|
//

//
//	Before we start working, we clean the terminal window
//
term.clear();

//
//	The main container that will be passed around in each chain to collect
//	all the data and keep it in one place
//
let container = {};


//
//	Lets make a nice first impression
//
display_the_welcome_message(container)
	.then(function(container) {

		return container;

	}).then(function(container) {

		term("\n");

		//
		//	->	Exit the app
		//
		process.exit();

	}).catch(function(error) {

		term.clear();

		term("\n\n");

		//
		//	1.	Show the error message
		//
		term.red("\t" + error.message)

		term("\n\n");

		//
		//	->	Exit the app
		//
		process.exit();

	});


//  _____    _____     ____    __  __   _____    _____   ______    _____
// |  __ \  |  __ \   / __ \  |  \/  | |_   _|  / ____| |  ____|  / ____|
// | |__) | | |__) | | |  | | | \  / |   | |   | (___   | |__    | (___
// |  ___/  |  _  /  | |  | | | |\/| |   | |    \___ \  |  __|    \___ \
// | |      | | \ \  | |__| | | |  | |  _| |_   ____) | | |____   ____) |
// |_|      |_|  \_\  \____/  |_|  |_| |_____| |_____/  |______| |_____/
//

//
//	Draw on the screen a nice welcome message to show our user how
//	cool we are :)
//
function display_the_welcome_message(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		//
		//	1.	Set the options that will draw the banner
		//
		let options = {
			flashStyle: term.brightWhite,
			style: term.brightYellow,
			delay: 20
		}

		//
		//	2.	The text to be displayed on the screen
		//
		let text = "\tStarting S3 Hosting";

		//
		//	3.	Draw the text
		//
		term.slowTyping(text, options, function() {

			term("\n");

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});


	});
}

