const download = require('download');
const fs = require('fs');
const log = require('./log.js');
// const db = require('./db.js');
// const Image = db.Image;
module.exports = {
	async download_image(url,dir){
		await new Promise(function(resolve,reject){
			let name = url.replace(/\//g,'').replace(':','@');
			download(url).then(data => {
    			fs.writeFileSync(dir+name, data);
    			//db
    		// 	db.sequelize.sync()
				  // .then(() => Image.create({
				  //   name:name,
				  //   islike:false
				  // }));

    			resolve(url)
			}).catch(function(err){
				log(err);
				reject(url)
			});
		});
	}
}