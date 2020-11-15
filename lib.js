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
		
		var marginX = 2;
		var marginY = 2; // empty space between rectangles
		
		var accWidth = 0;
		var idx = 0;
		var i = 0;
		var highestYinRow = 0;
		var rowY = parseInt(screenHeight / 2);
		var accHeight = 0;
		var whereToY = -1;
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
				
				var leftoverX = screenWidth - accWidth;
				var halfLeftoverX = parseInt(leftoverX / 2);
				var accRow = halfLeftoverX;
				
				// do a pass on the row, to calculate the position of the elements
				// using indexes 2 and 3 to store position X and position Y
				for(var j = 0; j < rowSorted.length; j++) {
					rowSorted[j][2] = accRow + marginX;
					rowSorted[j][3] = rowY - parseInt(rowSorted[j][1] / 2);
					accRow += rowSorted[j][0] + marginX;
				}
				
				// setup return data and data for next row
				
				idx = i;
				ret = ret.concat(rowSorted);
				
				accHeight += topYInRow + marginY;
				
				rowY += accHeight * whereToY;
				
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