let fs = require('fs');
let read = require('fs-readdir-recursive')
let mime = require('mime-types')
let path = require('path');
let term = require('terminal-kit').terminal;

//
//	Make a variable for the progress bar to use across this code base
//
let progress_bar;

module.exports = function(container) {

	return new Promise(function(resolve, reject) {

		read_all_files(container)
			.then(function(container) {

				return proxy_uploader(container)

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
//	Read all the files in the directory
//
function read_all_files(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	Read all file recursively
		//
		let files = read(container.dir)
					.filter(function(name) {

						if(name[0] !== '.')
						{
							return true;
						}

					}).filter(function(name) {

						if(name !== 'README.md')
						{
							return true;
						}

					});

		//
		//	2.	Save all the files that we got
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

		//
		//	1.	Upload to S3 only if we actually have files to be uploaded.
		//
		if(container.files.length === 0)
		{
			//
			//	->	Move to the next chain
			//
			return resolve(container);
		}

		term.clear();

		term("\n");

		term.brightWhite("\tUpload process begun...");

		term("\n");

		term.brightWhite("\tFrom this point on, you won't be needed.");

		term("\n");

		term.brightWhite("\tTake a brake...");

		term("\n");
		term("\n");

		progress_bar = term.progressBar({
			width: 80,
			title: '\tUploading:',
			percent: true,
			eta: true,
			items: container.files.length
		});

		uploader(container, function() {

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

	let base_name = path.basename(file);

	progress_bar.startItem(base_name);

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

		progress_bar.itemDone(file);

		//
		//
		//
		uploader(container, callback)

	});
}