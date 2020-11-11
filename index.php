<html>
<head>
    <title>Filter Spirit JS integration</title>
    <script src="lib.js?v=1604684913"></script>
</head>
<body>
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
    </script>
</body>
</html>