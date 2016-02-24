var fs = require('fs');
var http = require('http');
var cheerio = require('cheerio');
var sys = require('sys'); 
var iconv = require('iconv-lite'); 
var BufferHelper = require('bufferhelper');
var outStream = fs.WriteStream('url.txt');

var originalURL = 'http://www.dytt8.net';

var urlList = [];
var nums = 0;
var Tools = {};
var thisURL;
Tools.addURL = function(url) {
	if (urlList.indexOf(url) === -1) {
		urlList.push(url);
		return true;
	} else {
		return false;
	}
}
fetchNextURLs(originalURL);
function fetchNextURLs(url) {
	process.stdout.write("#");
	nums++;
	http.get(url,function(res){
	  var bufferHelper = new BufferHelper();
	  res.on('data', function (chunk) {
	    bufferHelper.concat(chunk);
	  });
	  res.on('end',function(){ 
	    var resStr = iconv.decode(bufferHelper.toBuffer(),'GBK');
	    var $ = cheerio.load(resStr);
	    if (/<font color="#ff0000" size="4">(.*)<\/font>/.test(resStr)) {
			var reg = /<a\s+href="(ftp:\/\/[^>]+)"/;
			if (resStr.match(reg)) {
				process.stdout.write("(*.*)");
				outStream.write(resStr.match(reg)[1] + "\r\n");
			}
		}
		$("a").each(function(index, element) {
			thisURL = element.attribs.href;
			if (Tools.addURL(thisURL)) {
				if (/^\/\w+/.test(element.attribs.href)) {
					fetchNextURLs(originalURL + element.attribs.href);
				}
			}
		});
	  });
	}).on('error', function(e) {
		// console.log(e);
	})
}