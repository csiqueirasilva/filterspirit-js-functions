function fs_pickfile(cb, type) {
    var input = document.createElement('input');
    input.type = 'file';
    
    if(type) {
        input.accept = type;
    }
    
    input.addEventListener("change", function() {
        var file = this.files[0];
        var ret = null;
        var err = null;
        if(file) {
            var reader = new FileReader();
            reader.onload = function (evt) {
                ret = evt.target.result;
                cb(ret);
            }
            reader.onerror = function (evt) {
                err = 'error reading file';
                cb(ret, err);
            }
            reader.readAsText(file);
        }
    });
    
    input.dispatchEvent(new MouseEvent("click"));
}

function fs_pickurl(url, cb, type) {
    if(!type) {
        type = 'GET';
    }
    
    var ret = null;
    var err = null;
    
    var xhr = new XMLHttpRequest();
    xhr.open(type, 'https://cors-anywhere.herokuapp.com/' + url, true);
    xhr.responseType = 'blob';

    xhr.onload = function () {
        var reader = new FileReader();
        
        reader.onload = function (evt) {
            ret = evt.target.result;
            cb(ret);
        }
        reader.onerror = function (evt) {
            err = 'error after fetching url ' + url + '; error reading file contents';
            cb(ret, err);
        }

        reader.readAsText(this.response);
    };
    
    xhr.onerror = function () {
        err = 'error while fetching url ' + url + ' with method ' + type;
        cb(ret, err);
    };    
    
    xhr.send();
}

function fs_savecontents(contents, fname, extType) {
	var a = document.createElement("a");
	var type = 'application/octet-stream';
	var name = 'output.filter';
	if(extType) {
		type = extType;
	}
	if(fname) {
		name = fname;
	}
	var file = new Blob([contents], {type: type});
	a.href = URL.createObjectURL(file);
	a.download = name;
    a.dispatchEvent(new MouseEvent("click"));
}