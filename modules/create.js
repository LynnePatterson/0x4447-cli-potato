let url = require('url');
let term = require('terminal-kit').terminal;
let upload = require('../helpers/upload');

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

				return list_hosted_zones(container)

			}).then(function(container) {

				return look_for_domain(container)

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
			//	1.	Save the URL while getting the base domain, for example:
			//
			//		subdomain.0x4447.com
			//
			//		becomes
			//
			//		0x4447.com
			//
			//		No matter how deep the sobdomain goes.
			//
			container.bucket = bucket.split('.').slice(-2).join('.');

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
			//	2.	Pares the S3 Bucket URL
			//
			let bucket_url = url.parse(data.Location);

			//
			//	3.	Get and save only the hostname part
			//
			container.bucket_url_path = bucket_url.hostname

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
					TargetOriginId: container.bucket_url_path,
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
						DomainName: container.bucket_url_path,
						Id: container.bucket_url_path,
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
				PriceClass: 'PriceClass_100',
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
			//	2.	Save the unique domain name of CloudFront
			//
			container.cloudfront_domain_name = data.Distribution.DomainName

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Query route 53 to get all the domains that are available
//
function list_hosted_zones(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.
		//
		container.route53.listHostedZones({}, function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(error)
			{
				return reject(error);
			}

			//
			//	3.	Save the result for the next chain
			//
			container.zones = data.HostedZones;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Query route 53 to get all the domains that are available
//
function look_for_domain(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Create a variable that will store the Zone ID
		//
		let zone_id = '';

		//
		//	2.	Loop over all the Zones that we got to look for the
		//		domain and grab the Zone ID
		//
		for(let key in container.zones)
		{
			//
			//	1.	Compare the domains
			//
			if(container.zones[key].Name == container.bucket + '.')
			{
				//
				//	1.	Save the Zone ID
				//
				zone_id = container.zones[key].Id.split("/")[2]

				//
				//	->	Brake to preserve CPU cycles
				//
				break;
			}
		}

		//
		//	3.	Save the zone ID for later
		//
		container.zone_id = zone_id;

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
		//	1.	Update a record only if we have the domain in ROute 53
		//
		if(!container.zone_id)
		{
			//
			//	-> Move to the next chain
			//
			return resolve(container);
		}

		//
		//	2.	All the options to add a new record
		//
		let options = {
			ChangeBatch: {
				Changes: [{
					Action: "CREATE",
					ResourceRecordSet: {
						AliasTarget: {
							DNSName: container.cloudfront_domain_name,
							EvaluateTargetHealth: false,
							HostedZoneId: 'Z2FDTNDATAQYW2' // Fixed ID CloudFront distribution
						},
						Name: container.bucket,
						Type: "A"
					}
				}],
				Comment: "S3 Hosted Site"
			},
			HostedZoneId: container.zone_id
		};

		//
		//	3.	Execute the change on Route 53
		//
		container.route53.changeResourceRecordSets(options, function(error, data) {

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
//	If we don't have the domain in ROute 53 then we just print out
//	what needs to be set in the domain to make sure all the traffic
//	goes to CloudFront
//
function print_domain_configuration(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Skip this step if we have the domain in Route 53 because
		//		it means that we were able to automatically update
		//		the record
		//
		if(container.zone_id)
		{
			//
			//	-> Move to the next chain
			//
			return resolve(container);
		}

		term.clear();

		term("\n");

		term.brightWhite("\tPlease update your DNS record with the following...");

		term("\n");

		term.brightWhite("\tPoint your domain name " + container.bucket + " to the following A record");

		term("\n");

		term.brightWhite("\t" + container.cloudfront_domain_name);

		term("\n");
		term("\n");

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}