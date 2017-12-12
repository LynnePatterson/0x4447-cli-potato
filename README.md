# 0x4447 Potato

The purpose of this CLI Tool is to streamline the process of hosting a static web page on S3 and delivering the content using CloudFront.

# What this CLI dose

This CLI has two options:

- Update
- Create

### Update

This option allows you to update the content of a site on S3 and automatically invalidate the CloudFront Distribution Cash. You just provide the path to the folder where the new content is located, and after that the CLI will do the rest for you automatically.

### Create

This is a more involved process that will save you a ton of time, and sanity. When you select this option you'll be asked for the name of the domain that you want to use for your domain, and after that everything will be done automatically for you, you just need to sit down and relax. This a a list of everything that will happen in the background:

- Check if a bucket of the domain provided is already on S3
- Create the bucket
- Convert it in to a website
- Chance Bucket policy
- Upload the files
- Create a SSL certificate
- Update the DNS with a SSL validation entry
- Wait until AWS validates the cert
- Create a CloudFront Distribution
- Update Route 53 with the right DNS entry

THere are smaller steps in between bu this is a good high level view of the whole process.

# How to Install

```
sudo npm install -g 0x4447-potato
```

# How to use

```
0x4447-potato -s PATH_TO_FOLDER

```

# The End

 If you've enjoyed this article/project, please consider giving it a 🌟. And check our GitHub account, where we have other articles and apps that you might find interesting.

# For Hire 👨‍💻

If you'd like us to help you, We are available for hire. Say hello@0x4447.com.