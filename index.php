<html>
<head>
    <title>Filter Spirit JS integration</title>
    <script src="lib.js?v=<?= filemtime('lib.js'); ?>"></script>
	<style>
		#itemview input {
			width: 30px;
		}
		
		#itemview > div {
			margin-bottom: 5px;
		}
	</style>
</head>
<body>

    <div id="itemview">
		<div>
		<h3>Item preview</h3>
			<label>min X</label>
			<input type="text" id="itemview-minx" value="32">
			<label>max X</label>
			<input type="text" id="itemview-maxx" value="128">
			<label>min Y</label>
			<input type="text" id="itemview-miny" value="12">
			<label>max Y</label>
			<input type="text" id="itemview-maxy" value="30">
		</div>
		<div>
			<label>canvas width</label>
			<input type="text" id="itemview-canvasx" value="640">
			<label>canvas height</label>
			<input type="text" id="itemview-canvasy" value="384">
		</div>
		<div>
			<label>N elements to draw</label>
			<input type="text" id="itemview-nelements" value="100">
			<button onclick="itemviewredraw();">Clear and redraw</button>
		</div>
	</div>

	<canvas id="itemview-canvas" style="border: 1px solid black; margin-top: 5px; margin-bottom: 5px;">
	</canvas>

	<h3>I/O methods</h3>

    <div><button onclick="pickfile();">Pick any file demo</button></div>
    <br />
    <div><button onclick="pickfile('.filter');">Pick .filter file demo</button></div>
    <br />
    <div><input style="width: 300px; margin-bottom: 5px;" id="testurl" type="text" value="https://www.ccesp.puc-rio.br/img/logo.png"></div>
    <div><button onclick="pickurl();">Download from url above demo</button></div>
    <br />
	<div><input style="width: 300px; margin-bottom: 5px;" id="testfname" type="text" value="test.filter"></div>
    <div><button onclick="savecontents();">Download output below to a file, with above filename</button></div>
    <br />
    <h3>Output: </h3>
    <div id="output">nothing yet</div>
	
    <script>
        function pickfile(fileType) {
            fs_pickfile((file, err) => {
                document.getElementById('output').innerHTML = file;
                if(err) {
                    alert(err);
                }
            }, fileType);
        }
        
        function pickurl() {
            var url = document.getElementById('testurl').value;
            fs_pickurl(url, (file, err) => {
                document.getElementById('output').innerHTML = file;
                if(err) {
                    alert(err);
                }
            });
        }
		
        function savecontents() {
            var contents = document.getElementById('output').innerHTML;
            var fname = document.getElementById('testfname').value;
			fs_savecontents(contents, fname);
        }
		
		function itemviewredraw() {
		
			var canvas = document.getElementById('itemview-canvas');
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			var itensViewData = [];
			
			var maxX = parseInt(document.getElementById('itemview-maxx').value);
			var minX = parseInt(document.getElementById('itemview-minx').value);
			var maxY = parseInt(document.getElementById('itemview-maxy').value);
			var minY = parseInt(document.getElementById('itemview-miny').value);
			
			var nElements = parseInt(document.getElementById('itemview-nelements').value);
			
			var canvasWidth = parseInt(document.getElementById('itemview-canvasx').value);
			var canvasHeight = parseInt(document.getElementById('itemview-canvasy').value);
			
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			
			for(var i = 0; i < nElements; i++) {
				itensViewData.push([
					minX + parseInt(Math.random() * (maxX - minX)), 
					minY + parseInt(Math.random() * (maxY - minY))
				]);
			}
			
			var toDraw = fs_fillcanvas(itensViewData, canvasWidth, canvasHeight);
			
			toDraw.forEach((el) => {
				ctx.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
				ctx.fillRect(el[2], el[3], el[0], el[1]);
				ctx.lineWidth = 0.5;
				ctx.strokeStyle = 'black';				
				ctx.strokeRect(el[2], el[3], el[0], el[1]);
			});
		}
		
		window.addEventListener('load', itemviewredraw);
    </script>
</body>
</html>