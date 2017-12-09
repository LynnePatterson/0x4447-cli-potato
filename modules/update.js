let term = require('terminal-kit').terminal;
let upload = require('../helpers/upload');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		get_s3_buckets(container)
			.then(function(container) {

				return pick_a_bucket(container);

			}).then(function(container) {

				return upload(container);

			}).then(function(container) {

				return list_cloudfront_distributions(container);

			}).then(function(container) {

				return look_for_distribution_id(container);

			}).then(function(container) {

				return invalidate_cloudfront(container);

			}).then(function(container) {

				return resolve(container);

			}).catch(function(error) {

				return reject(error);

			});

	});
}

//  _____    _____     ____    __  __   _____    _____   ______    _____
// |  __ \  |  __ \   / __ \  |  \/  | |_   _|  / ____| |  ____|  / ____|
// | |__) | | |__) | | |  | | | \  / |   | |   | (___   | |__    | (___
// |  ___/  |  _  /  | |  | | | |\/| |   | |    \___ \  |  __|    \___ \
// | |      | | \ \  | |__| | | |  | |  _| |_   ____) | | |____   ____) |
// |_|      |_|  \_\  \____/  |_|  |_| |_____| |_____/  |______| |_____/
//


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
//	Upload the file to the S3 bucket so we can deliver something
//
//	.upload();

function list_cloudfront_distributions(container)
{
	return new Promise(function(resolve, reject) {

		container.cloudfront.listDistributions({}, function(error, data) {

			//
			//	1.	Check if there was no error
			//
			if(error)
			{
				return reject(new Error(error.message));
			}

			//
			//	2.	Save the response as is for the next chain
			//
			container.distributions = data.DistributionList.Items

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});

	});
}

function look_for_distribution_id(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Make a variable that will hold the Distribution ID
		//
		let distribution_id = null;

		//
		//	2.	Loop over the result and look for the domain
		//
		for(let key in container.distributions)
		{
			//
			//	1.	See if the distribution contains the domain that we
			//		care about
			//
			if(container.distributions[key].Aliases.Items[0] == container.bucket)
			{
				//
				//	1.	Save the Distribution ID once we found the domain
				//
				distribution_id = container.distributions[key].Id

				//
				//	->	Stop the loop to preserve CPU cycles
				//
				break;
			}
		}

		//
		//	3.	Save the distribution ID for the next chain
		//
		container.distribution_id = distribution_id

		//
		//	->	Move to the next step once the animation finishes drawing
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
			DistributionId: container.distribution_id,
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

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}