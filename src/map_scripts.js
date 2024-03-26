const html_script = `

<!DOCTYPE html>
<html>
<head>
	
	<title>GTDrive Map</title>

	<meta charset="utf-8" />
	<meta name="viewport" content="initial-scale=1.0">
	
	<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew==" crossorigin=""></script>


	
</head>
<body style="padding: 0; margin: 0">



<div id="map" style="width: 100%; height: 100vh;"></div>

<script>

	var map = L.map('map').setView([56.822750, 60.617740], 15);

	L.marker([56.82349, 60.61703]).addTo(map);

	L.tileLayer('https://osm.gt-logistics.su/styles/basic-preview/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(map);
	
</script>



</body>
</html>

`;

export default html_script;
