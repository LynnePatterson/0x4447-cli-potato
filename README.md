# 0x4447 Potato 🥔

The purpose of this CLI Tool is to streamline the process of hosting a static web page on S3 and delivering it using CloudFront.

<div align="center">
	<img src="https://raw.githubusercontent.com/0x4447/0x4447-cli-potato/master/assets/main.png">
</div>

# How to Install

```
sudo npm install -g 0x4447-potato
```

# IAM Programmatic Credentials

To use this CLI you'll need to create a Programmatic user with the following Permissions:

- AmazonS3FullAccess
- CloudFrontFullAccess
- AmazonRoute53FullAccess
- AWSCertificateManagerFullAccess

# How to Use

```
potato -s PATH_TO_FOLDER
```

# What this CLI dose

This CLI has two options:

- Update
- Create

### Update

This option allows you to update the content of a site on S3 and automatically invalidate the CloudFront Distribution Cash. You just provide the path to the folder where the new content is located, and after that the CLI will do the rest for you automatically. Just follow the steps on the screen.

### Create

This is a more involved process that will save you a quite some time, and sanity. When you select this option you'll be asked for the name of the domain that you want to use for your website, and after that everything will be done automatically for you, you just need to sit down and relax. This a a list of everything that will happen in the background:

- list_all_certificates
- look_for_domain_certificate
- create_a_certificate
- get_certificate_metadata
- list_hosted_zones
- look_for_domain
- update_route53_with_cert_validation
- check_certificate_validity
- check_if_bucket_exists
- create_a_bucket
- convert_bucket_to_site
- change_bucket_policy
- upload
- create_a_distribution
- get_all_domain_records
- look_for_domain_entry
- delete_domain_entry
- create_a_route_53_record
- print_domain_configuration

**WARNING**: what if the cert will take to long to validate? After 30 sec the app will quite and print out a detailed explanation what to do next, take your time to go over the print out, and you'll be good.

# Is the deployment instant?

No, it is not. THere are two things that are not instant:

- SSL Certificate confirmation
- CloudFront Distribution

### SSL Certificate confirmation

This is a process that can take from 10 sec to 24h, it is a quite unknown and there is no way to speed up this process. For this reason if within 30 sec the cert is not confirmed, the app will quit. And you'll have to monitor the cert on the AWS Console.

### CloudFront Distribution

This will take up to 15 to 20 min to finish, but at least once you reach this point, you know that everything is configured correctly, and you just need to wait until the process is done. Only then the domain will deliver the website.

# Why this name?

Because why not, we had to call it something, and a nice side effect is that once you see it you won't forget it 😃.

# The End

 If you've enjoyed this article/project, please consider giving it a 🌟. And check our our [0x4447 GitHub account](https://github.com/0x4447), where we have other articles and tools that you might find interesting.

# For Hire 👨‍💻

If you'd like us to help you in something, fell free to say hello@0x4447.com, and share whats on your mind, we'll take a look and see if we can help you.



