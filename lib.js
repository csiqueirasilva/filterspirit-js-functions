const filterspirit = (function(){

	class filterspirit_obj {
		
		constructor() {
		}
		
	}

	return new filterspirit_obj();
	
}());

filterspirit.network = (function(){
	
	class filterspirit_network_obj {
		
		constructor() {
			this.urlContents = null;
			this.urlError = null;
		}
		
		pickurl(url) {
			var o = this;
			fs_pickurl(url, (file, err) => {
				o.lastUrlContents = file;
				o.lastUrlError = err;
			});
		}
		
		set lastUrlError(v) {
			this.urlError = v;
		}

		set lastUrlContents(v) {
			this.urlContents = v;
		}

		get lastUrlError() {
			var ret = this.urlError;
			this.urlError = null;
			return ret;
		}

		get lastUrlContents() {
			var ret = this.urlContents;
			this.urlContents = null;
			return ret;
		}
	}

	return new filterspirit_network_obj();
	
}());

filterspirit.files = (function(){
	
	class filterspirit_files_obj {
		
		constructor() {
			this.fileContents = null;
			this.fileError = null;
		}
		
		pickfile(fileType) {
			var o = this;
			fs_pickfile((file, err) => {
				o.lastFileContents = file;
				o.lastFileError = err;
			}, fileType);
		}

		pickfilter() {
			var o = this;
			fs_pickfile((file, err) => {
				o.lastFileContents = file;
				o.lastFileError = err;
			}, '.filter');
		}
		
		set lastFileError(v) {
			this.fileError = v;
		}

		set lastFileContents(v) {
			this.fileContents = v;
		}

		get lastFileError() {
			var ret = this.lastFileError;
			this.lastFileError = null;
			return ret;
		}

		get lastFileContents() {
			var ret = this.fileContents;
			this.fileContents = null;
			return ret;
		}
	}

	return new filterspirit_files_obj();
	
}());

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

function fs_fillcanvas(inputData, screenWidth, screenHeight) {
	var ret = [];
	
	if(inputData.length !== 0) {
		
		inputData.sort((a, b) => b[1] - a[1]); // sort elements by Y size; descending
		
		var marginX = 1;
		var marginY = 1; // empty space between rectangles
		
		var accWidth = 0;
		var idx = 0;
		var i = 0;
		var highestYinRow = 0;
		var rowY = parseInt(screenHeight / 2);
		var accHeight = 0;
		var whereToY = -1;
		var iteratorY = 0;
		var lastRowAlone = false;

		do {
			// is the last element, which means it fits the last row or is alone in the row; or row cant have more elements.
			if(i >= inputData.length - 1 || (accWidth + inputData[i][0] + marginX) > screenWidth) {
				
				// if the last element, set the index so slice correctly calculates the subarray
				if(i >= inputData.length - 1) {
					if((accWidth + inputData[i][0] + marginX) <= screenWidth) { // last element can be added to row
						accWidth += inputData[i][0] + marginX; // add x of the last element to row and margins
						i++;
					} else {
						lastRowAlone = true;
					}
				}
				
				// start to sort the position of the elements in a row
				
				// means elements from idx to i - 1 form a row
				var row = inputData.slice(idx, i);
				// find the element with top x, add it to the center of the array
				row.sort((a, b) => b[0] - a[0]); // sort elements of the row by X size; descending
				var rowSorted = [];
				
				var mid = parseInt(row.length / 2);
				rowSorted[mid] = row[0];
				var topYInRow = rowSorted[mid][1];
				
				// get odd position elements as left side of the sort
				for(var j = 1, k = mid - 1; j < row.length; j = j + 2) {
					rowSorted[k--] = row[j];
					
					if(topYInRow < row[j][1]) {
						topYInRow = row[j][1];
					}
				}

				// get even position elements as right side of the sort
				for(var j = 2, k = mid + 1; j < row.length; j = j + 2) {
					rowSorted[k++] = row[j];
					
					if(topYInRow < row[j][1]) {
						topYInRow = row[j][1];
					}
				}
				
				// calculates how much space is left empty on the x axis of the row and starts an accumulator for the x position of the elements of the row
				var leftoverX = screenWidth - accWidth;
				var halfLeftoverX = parseInt(leftoverX / 2);
				var accRow = halfLeftoverX;
				
				// if not the first, adjust rowY to the center of the biggest Y element, creating a "line height"
				var rowYdiff = 0;
				if(iteratorY !== 0) {
					rowYdiff = -whereToY * parseInt(topYInRow / 2 + marginY);
				}
				
				// do a pass on the row, to calculate the position of the elements
				// using indexes 2 and 3 to store position X and position Y
				// spawns elements from left to right in the row
				for(var j = 0; j < rowSorted.length; j++) {
					rowSorted[j][2] = accRow + marginX;
					rowSorted[j][3] = rowY + rowYdiff - parseInt(rowSorted[j][1] / 2);
					accRow += rowSorted[j][0] + marginX;
				}
				
				// setup return data and data for next row
				
				idx = i;
				ret = ret.concat(rowSorted);
				
				// if its the first row there is a special rule to calculate the next position; as it always starts in the center Y of the screen and the next iterations will start relative to the bottom or top of the cumulative height of the previous rows
				// the position Y of the row is calculated as following:
				// first at the center of the screen,
				// then 1 to top, 1 to bottom, 2 to top, 2 to bottom, and so on.
				// the numbers to top and to bottom arent coordinates that are easily calculated, because it needs to take in cosideration the center of the line height of the row that is being created. thats why the iterations after the first starts at the bottom or top of the last row.
				if(iteratorY++ === 0) {
					accHeight += topYInRow;
					rowY += parseInt((topYInRow / 2)) * whereToY;
				} else {
					rowY += accHeight * whereToY;
					accHeight += topYInRow + marginY;
				}
				
				// change direction for next row spawn
				whereToY *= -1;
				
				// decrement iterator if it needs to create a new row for the last element
				if(lastRowAlone) {
					i--;
				}
				
				// if not the last element, initiate a new row
				if(i < inputData.length - 1) {
					accWidth = inputData[i][0] + marginX;
				}
				
			} else {
				accWidth += inputData[i][0] + marginX; // add x of element to row and margins
			}
			
		} while (++i < inputData.length);
		
	}

	return ret;
}