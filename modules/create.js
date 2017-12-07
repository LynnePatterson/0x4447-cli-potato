let term = require('terminal-kit').terminal;
let upload = require('./helpers/upload');

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		ask_for_the_domain(container)
			.then(function(container) {

				return check_if_bucket_exists(container)

			}).then(function(container) {

				return create_a_bucket(container)

			}).then(function(container) {

				return convert_bucket_to_site(container)

			}).then(function(container) {

				return upload(container)

			}).then(function(container) {

				return create_a_distribution(container)

			}).then(function(container) {

				return check_route_53_for_domain(container)

			}).then(function(container) {

				return create_a_route_53_record(container)

			}).then(function(container) {

				return print_domain_configuration(container)

			}).then(function(container) {

				return resolve(container)

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
//	Make sure the Configuration file is actually available in the system
//
function ask_for_the_domain(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tType the domain name: ");

		//
		//	2.	Listen for the user input
		//
		term.inputField({}, function(error, bucket) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Save the URL
			//
			container.bucket = bucket;

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
function check_if_bucket_exists(container)
{
	return new Promise(function(resolve, reject) {

		//
		//
		//
		let params = {
			Bucket: container.bucket,
			Key: 'index.html'
		};

		//
		//
		//
		container.s3.getObject(params, function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(data)
			{
				return reject(new Error("Website already exists"));
			}

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
function create_a_bucket(container)
{
	return new Promise(function(resolve, reject) {

		//
		//
		//
		let params = {
			Bucket: container.bucket,
			CreateBucketConfiguration: {
				LocationConstraint: "us-west-1"
			}
		};

		//
		//
		//
		container.s3.createBucket(params, function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(error)
			{
				return reject(error);
			}

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
function convert_bucket_to_site(container)
{
	return new Promise(function(resolve, reject) {

		//
		//
		//
		let params = {
			Bucket: container.bucket,
			WebsiteConfiguration: {
				ErrorDocument: {
					Key: "error.html"
				},
				IndexDocument: {
					Suffix: "index.html"
				}
			}
		};

		//
		//
		//
		container.s3.putBucketWebsite(params, function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(error)
			{
				return reject(error);
			}

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Upload the file to the S3 bucket so we can deliver something
//
//	.upload();
//

//
//	Make sure the Configuration file is actually available in the system
//
function create_a_distribution(container)
{
	return new Promise(function(resolve, reject) {

		//
		//
		//
		let params = {
			DistributionConfig: {
				CallerReference: new Date().toString(),
				Comment: '-',
				DefaultCacheBehavior: {
					ForwardedValues: {
						Cookies: {
							Forward: 'none'
						},
						QueryString: false,
						Headers: {
							Quantity: 0
						},
						QueryStringCacheKeys: {
							Quantity: 0
						}
					},
					MinTTL: 0,
					TargetOriginId: 'gatti.pl.s3-website-us-west-1.amazonaws.com',
					TrustedSigners: {
						Enabled: false,
						Quantity: 0
					},
					ViewerProtocolPolicy: 'redirect-to-https',
					AllowedMethods: {
						Items: ['GET', 'HEAD'],
						Quantity: 2,
						CachedMethods: {
							Items: ['GET', 'HEAD'],
							Quantity: 2
						}
					},
					Compress: true,
					DefaultTTL: 86400,
					LambdaFunctionAssociations: {
						Quantity: 0,
					},
					MaxTTL: 31536000,
					SmoothStreaming: false
				},
				Enabled: true,
				Origins: {
					Quantity: 1,
					Items: [{
						DomainName: 'gatti.pl.s3-website-us-west-1.amazonaws.com',
						Id: 'gatti.pl.s3-website-us-west-1.amazonaws.com',
						CustomOriginConfig: {
							HTTPPort: 80,
							HTTPSPort: 443,
							OriginProtocolPolicy: 'http-only',
							OriginSslProtocols: {
								Quantity: 1,
								Items: ['TLSv1.1']
							}
						}
					}]
				},
				Aliases: {
					Quantity: 1,
					Items: [container.bucket]
				},
				CacheBehaviors: {
					Quantity: 0
				},
				CustomErrorResponses: {
					Quantity: 0
				},
				DefaultRootObject: 'index.html',
				HttpVersion: 'http2',
				IsIPV6Enabled: true,
				PriceClass: 'PriceClass_All',
				Restrictions: {
					GeoRestriction: {
						Quantity: 0,
						RestrictionType: 'none'
					}
				},
				ViewerCertificate: {
					ACMCertificateArn: 'arn:aws:acm:us-east-1:239748505547:certificate/f7534bb3-52a9-467a-b736-e2692308a816',
					CertificateSource: 'acm',
					CloudFrontDefaultCertificate: false,
					MinimumProtocolVersion: 'TLSv1.1_2016',
					SSLSupportMethod: 'sni-only'
				}
			}
		};

		//
		//
		//
		container.cloudfront.createDistribution(params, function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(error)
			{
				return reject(error);
			}

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Query route 53 to see if the domain entered by the users is present in
//	Route 53, if so we can automatically create a record
//
function check_route_53_for_domain(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	If the domain is held in our Route 53 just create the record
//	automatically
//
function create_a_route_53_record(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}

//
//	If we don't have the domain in ROute 53 then we just print out
//	what needs to be set in the domain to make sure all the traffic
//	goes to CloudFront
//
function print_domain_configuration(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}