let fs = require('fs');
let npm = require('./package.json');
let aws = require('aws-sdk');
let term = require('terminal-kit').terminal;
let mime = require('mime-types')
let read = require('fs-readdir-recursive')
let program = require('commander');
let request = require('request');

//http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketWebsite-property

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
let container = {
	aws_config: process.env.HOME + '/.aws/config',
	aws_credentials: process.env.HOME + '/.aws/credentials',
	dir: '/home/dg/Documents/0x4447.com'
};

//
//	Start the chain
//
display_the_welcome_message(container)
	.then(function(container) {

		return ask_if_new_or_update(container);

	}).then(function(container) {

		return ask_for_aws_key(container);

	}).then(function(container) {

		return ask_for_aws_secret(container);

	}).then(function(container) {

		return create_aws_class(container);

	}).then(function(container) {

		return check_aws_permissions(container);

	}).then(function(container) {

		return get_s3_buckets(container);

	}).then(function(container) {

		return pick_a_bucket(container);

	}).then(function(container) {

		return read_all_files(container);

	}).then(function(container) {

		return container //proxy_uploader(container);

	}).then(function(container) {

		return list_cloudFront_distributions(container);

	}).then(function(container) {

		return get_distribution_id(container);

	}).then(function(container) {

		return container //invalidate_cloudfront(container);

	}).then(function(container) {

		term("\n");

		//
		//	->	Exit the app
		//
		process.exit();

	}).catch(function(error) {

		console.log(error)
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


			setTimeout(function() {

				//
				//	->	Move to the next step once the animation finishes drawing
				//
				return resolve(container);

			}, 1000)

		});


	});
}

//
//	Make sure the Configuration file is actually available in the system
//
function ask_if_new_or_update(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Draw the menu with one tab to the left to so the UI stay
		//		consistent
		//
		let options = {
			leftPadding: "\t"
		}

		//
		//
		//
		let question = [
			'Update',
			'Create'
		]

		//
		//	2.	Tell the user what we want from hi or her
		//
		term.yellow("\tUpdate or create a new website?");

		term('\n');

		//
		//	3.	Draw the drop down menu
		//
		term.singleColumnMenu(question, options, function(error, res) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Get the Property name based on the user selection
			//
			let selection = question[res.selectedIndex];

			//
			//	2.	Save the selection for other promises to use. It will
			//		be used in API calls
			//
			container.selection = selection;

			//
			//	->	Move to the next chain
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
//	Read the configuration file
//
function create_aws_class(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Create the AWS object
		//
		container.s3 = new aws.S3({
			region: 'us-east-1',
			accessKeyId: container.aws_access_key_id,
			secretAccessKey: container.aws_secret_access_key
		});

		//
		//	1.	Create the AWS object
		//
		container.cloudfront = new aws.CloudFront({
			region: 'us-east-1',
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
//	Read the configuration file
//
function check_aws_permissions(container)
{
	return new Promise(function(resolve, reject) {

		container.s3.listBuckets(function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(error)
			{
				return reject(error)
			}

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Read the configuration file
//
function get_s3_buckets(container)
{
	return new Promise(function(resolve, reject) {

		container.s3.listBuckets(function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(error)
			{
				return reject(error);
			}

			let buckets = []

			data.Buckets.forEach(function(bucket) {

				buckets.push(bucket.Name);

			});

			container.buckets = buckets;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});
	});
}

//
//	Make sure the Configuration file is actually available in the system
//
function pick_a_bucket(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Draw the menu with one tab to the left to so the UI stay
		//		consistent
		//
		let options = {
			leftPadding: "\t"
		}

		//
		//	2.	Tell the user what we want from hi or her
		//
		term.yellow("\tChoose the bucket that you want to update");

		term('\n');

		//
		//	3.	Draw the drop down menu
		//
		term.singleColumnMenu(container.buckets, options, function(error, res) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Get the Property name based on the user selection
			//
			let bucket = container.buckets[res.selectedIndex];

			//
			//	2.	Save the selection for other promises to use. It will
			//		be used in API calls
			//
			container.bucket = bucket;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Read all the files in the directory
//
function read_all_files(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	Read all file coercively
		//
		let files = read(container.dir)

		//
		//
		//
		container.files = files;

		//
		//	->	Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Read all the files in the directory
//
function proxy_uploader(container)
{
	return new Promise(function(resolve, reject) {

		uploader(container, function() {

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Read all the files in the directory
//
function list_cloudFront_distributions(container)
{
	return new Promise(function(resolve, reject) {

		container.cloudfront.listDistributions({}, function(error, data) {

			//
			//
			//
			if(error)
			{
				return reject(error);
			}

			//
			//	2.	Save all the distributions
			//
			container.distribution_list = data.DistributionList.Items;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Read all the files in the directory
//
function get_distribution_id(container)
{
	return new Promise(function(resolve, reject) {

		let size = container.distribution_list.length;

		for(i = 0; i < size; i++)
		{
			console.log(container.distribution_list[i].Origins.Items)
		}

		//
		//	->	Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Read all the files in the directory
//
function invalidate_cloudfront(container)
{
	return new Promise(function(resolve, reject) {

		var params = {
			DistributionId: 'E3KWY6RFS0FUFE',
			InvalidationBatch: {
				CallerReference: new Date().toString(),
				Paths: {
					Quantity: 1,
					Items: ["/*"]
				}
			}
		};

		container.cloudfront.createInvalidation(params, function(error, data) {

			if(error)
			{
				return reject(error);
			}

			console.log(data)

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Make sure the Configuration file is actually available in the system
//
function uploader(container, callback)
{

	let file = container.files.shift();

	if(!file)
	{
		return callback();
	}

	let full_path_file = container.dir + '/' + file

	let mime_type = mime.lookup(full_path_file)

	let params = {
		Bucket: container.bucket,
		Key: file,
		ContentType: mime_type,
		Body: fs.createReadStream(full_path_file)
	};

	container.s3.upload(params, function(error, data) {

		//
		//	1.	Check if there was an error
		//
		if(error)
		{
			return reject(error);
		}

		console.log(data.Location);

		//
		//
		//
		uploader(container, callback)

	});


}