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

				return change_bucket_policy(container)

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

				return list_all_certificates(container);

			}).then(function(container) {

				return look_for_domain_certificate(container);

			}).then(function(container) {

				return create_a_certificate(container);

			}).then(function(container) {

				return get_certificate_metadata(container);

			}).then(function(container) {

				return update_route53_with_cert_validation(container);

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
//	Update the Bucket policy to make sure it is accessible by the public.
//	Otherwise CloudFront won't be able to publish the site.
//
function change_bucket_policy(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Set the parameters to change the Bucket policy
		//
		let params = {
			Bucket: container.bucket,
			Policy: JSON.stringify({
				Version: '2012-10-17',
				Statement: [
				{
					Sid: 'PublicReadGetObject',
					Effect: 'Allow',
					Principal: '*',
					Action: 's3:GetObject',
					Resource: 'arn:aws:s3:::' + counter.bucket + '/*'
				}
				]
			})
		};

		//
		//	2.	Replace the Policy
		//
		container.s3.putBucketPolicy(params, function(error, data) {

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
//	If we don't have the domain in Route 53 then we just print out
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

function list_all_certificates(container)
{
	return new Promise(function(resolve, reject) {

		container.acm.listCertificates({}, function(error, data) {

			//
			//	1.	Check if there was no error
			//
			if(error)
			{
				return reject(new Error(error.message));
			}

			//
			//	2.	Save an array of certs to the proceed
			//
			container.certificates = data.CertificateSummaryList

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});

	});
}

function look_for_domain_certificate(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Create a variable to store the ARN of the cert
		//
		let arn = null;

		//
		//	2.	Loop over all the certs that we got
		//
		for(let key in container.certificates)
		{
			//
			//	1.	Look for a match
			//
			if(container.certificates[key].DomainName == container.bucket)
			{
				//
				//	1.	Save the ARN once it is found
				//
				arn = container.certificates[key].CertificateArn

				//
				//	->	Stop the loop to preserve CPU
				//
				break;
			}
		}

		//
		//	3.	Save the ARN to be used in the next chain
		//
		console.arn = arn;

		//
		//	->	Move to the next step once the animation finishes drawing
		//
		return resolve(container);

	});
}

function create_a_certificate(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Skip this step if the ARN is found
		//
		if(container.arn)
		{
			//
			//	->	Move to the next chain
			//
			return resolve(container);
		}

		//
		//	2.	Prepare the data to create a certificate
		//
		//		Warning:
		//
		//			IdempotencyToken - is used by AWS to understand if you
		//			by mistake made the same request multiple times. This
		//			way you won't get a ton of cert that are the same.
		//
		let params = {
			DomainName: container.bucket,
			IdempotencyToken: 'rnd_0x4447',
			ValidationMethod: 'DNS'
		};

		//
		//	3.	Tell AWS that we want a new certificate
		//
		container.acm.requestCertificate(params, function(error, data) {

			//
			//	1.	Check if there was no error
			//
			if(error)
			{
				return reject(new Error(error.message));
			}

			//
			//	2.	Save an array of certs to the proceed
			//
			container.arn = data.CertificateArn;

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});

	});
}

function get_certificate_metadata(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Make a variable that will keep all the information to create
		//		a certificate
		//
		let params = {
			CertificateArn: container.arn
		};

		//
		//	2.	Start the main loop and set the counter at 0
		//
		main(0)

		//
		//	3.	The main function that will loop until it get the Resource
		//		record to then use to update the DNS setting of the domain
		//
		//		We need to do it this way because when you create a Cert
		//		AWS will take a moment before the cert set in stone.
		//
		//		This main will also timeout after 15 sec.
		//
		function main(count)
		{
			//
			//	1.	Get the full description of the cert
			//
			container.acm.describeCertificate(params, function(error, data) {

				//
				//	1.	Check if there was no error
				//
				if(error)
				{
					return reject(new Error(error.message));
				}

				//
				//	2. Save the information to validate the cert
				//
				let record = data.Certificate.DomainValidationOptions[0].ResourceRecord;

				//
				//	3.	Check if we reached the limits of retries
				//
				if(count >= 15)
				{
					//
					//	1.	If we reached the limit we stop the app because
					//		there is no point in stressing out AWS
					//
					return reject(new Error("Unable to get a cert ARN"));
				}

				//
				//	4.	Check if we got the data that we need from AWS
				//
				if(record)
				{
					//
					//	1.	Save the data for the next chain
					//
					container.cert_validation = record

					//
					//	->	Move to the next step once the animation finishes
					//		drawing
					//
					return resolve(container);
				}

				//
				//	5.	Set a timeout of 1 sec
				//
				setTimeout(function() {

					//
					//	1.	Increases the counter so we can keep track of how
					//		many loops did we do.
					//
					count++;

					//
					//	2.	Restart the main function to check if now we'll
					//		get what we need
					//
					main(count);

				}, 1000);

			});

		}

	});
}

function update_route53_with_cert_validation(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Create all the options to create a new record that will
		//		be used to confirm the ownership of the cert
		//
		let params = {
			ChangeBatch: {
				Changes: [
				{
					Action: "CREATE",
					ResourceRecordSet: {
						Name: container.cert_validation.Name,
						ResourceRecords: [{
							Value: container.cert_validation.Value
						}],
						TTL: 60,
						Type: container.cert_validation.Type
					}
				}
				],
				Comment: "Proof of ownership"
			},
			HostedZoneId: container.zone_id
		};

		//
		//	2.	Create a new DNS record
		//
		container.route53.changeResourceRecordSets(params, function(error, data) {

			//
			//	1.	Check if there was no error
			//
			if(error)
			{
				return reject(new Error(error.message));
			}

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});

	});
}

