#!/usr/bin/env node

let npm = require('./package.json');
let aws = require('aws-sdk');
let term = require('terminal-kit').terminal;
let update = require('./modules/update');
let create = require('./modules/create');
let program = require('commander');

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
	.version(npm.version)
	.option('-s, --source', 'path to the folder to upload')
	.parse(process.argv);

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

//
//	Check if the user provided the dir source where to copy the file from
//
if(!program.source)
{
	console.log('Missing source');
	process.exit(0);
}

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
let container = {
	dir: process.cwd() + "/" + process.argv[3],
	region: 'us-east-1'
};

//
//	Start the chain
//
display_the_welcome_message(container)
	.then(function(container) {

		return ask_for_aws_key(container);

	}).then(function(container) {

		return ask_for_aws_secret(container);

	}).then(function(container) {

		return create_aws_objects(container);

	}).then(function(container) {

		return ask_what_to_do(container);

	}).then(function(container) {

		return crossroad(container);

	}).then(function(container) {

		term("\n");
		term("\n");

		//
		//	->	Exit the app
		//
		process.exit();

	}).catch(function(error) {

		//
		//	1.	Clear the screen of necessary text
		//
		term.clear();

		term("\n\n");

		//
		//	2.	Show the error message
		//
		term.red("\t" + error);

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
			delay: 10
		}

		//
		//	2.	The text to be displayed on the screen
		//
		let text = "\tStarting S3 Hosting";

		//
		//	3.	Draw the text
		//
		term.slowTyping(text, options, function() {

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});

	});
}

//
//	Make sure the Configuration file is actually available in the system
//
function ask_for_aws_key(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease paste your AWS Access Key ID: ");

		//
		//	2.	Listen for the user input
		//
		term.inputField({}, function(error, aws_access_key_id) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Save the URL
			//
			container.aws_access_key_id = aws_access_key_id;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Make sure the Credentials file is actually available in the system
//
function ask_for_aws_secret(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease paste your AWS Secret Access Key: ");

		//
		//	2.	Listen for the user input
		//
		term.inputField({}, function(error, aws_secret_access_key) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Save the URL
			//
			container.aws_secret_access_key = aws_secret_access_key;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	After we get all the necessary credentials we use them to create
//	all the AWS object used to programmatically make all the work
//
function create_aws_objects(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Create the AWS S3 object
		//
		container.s3 = new aws.S3({
			region: container.region,
			accessKeyId: container.aws_access_key_id,
			secretAccessKey: container.aws_secret_access_key
		});

		//
		//	2.	Create the AWS CloudFront object
		//
		container.cloudfront = new aws.CloudFront({
			region: container.region,
			accessKeyId: container.aws_access_key_id,
			secretAccessKey: container.aws_secret_access_key
		});

		//
		//	3.	Create the AWS Route 53 object
		//
		container.route53 = new aws.Route53({
			accessKeyId: container.aws_access_key_id,
			secretAccessKey: container.aws_secret_access_key
		});

		//
		//	4. Create the AWS Certificate Manager object
		//
		container.acm = new aws.ACM({
			region: container.region,
			accessKeyId: container.aws_access_key_id,
			secretAccessKey: container.aws_secret_access_key
		});

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Ask the user what to do, since this app can create or update a project
//
function ask_what_to_do(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		term.yellow("\tUpdate or create a new website?");

		term('\n');

		//
		//	1.	Default settings how to draw the ASCII menu
		//
		let options = {
			leftPadding: "\t"
		};

		//
		//	2.	The two options to show the user
		//
		let question = [
			'Update',
			'Create'
		];

		//
		//	3.	Draw the drop down menu
		//
		term.singleColumnMenu(question, options, function(error, res) {

			term("\n");
			term("\n");

			term.yellow("\tLoading...");

			term("\n");
			term("\n");

			//
			//	1.	Get the Property name based on the user selection
			//
			let selection = question[res.selectedIndex];

			//
			//	2.	Save the user selection
			//
			container.selection = selection;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//	 ______  _    _  _   _   _____  _______  _____  ____   _   _   _____
//	|  ____|| |  | || \ | | / ____||__   __||_   _|/ __ \ | \ | | / ____|
//	| |__   | |  | ||  \| || |        | |     | | | |  | ||  \| || (___
//	|  __|  | |  | || . ` || |        | |     | | | |  | || . ` | \___ \
//	| |     | |__| || |\  || |____    | |    _| |_| |__| || |\  | ____) |
//	|_|      \____/ |_| \_| \_____|   |_|   |_____|\____/ |_| \_||_____/
//

//
//	This is a function that depending on the option selected by the user
//	returns just one specific promises that will then perform the
//	action selected by the user.
//
function crossroad(container)
{
	if(container.selection == 'Update')
	{
		return update(container);
	}

	if(container.selection == 'Create')
	{
		return create(container);
	}
}
