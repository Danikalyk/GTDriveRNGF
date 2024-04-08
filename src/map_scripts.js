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
			let map;

			var iconStock = L.divIcon({
				className: "my-div-icon",
				iconSize: 25,
				html: '<div class="my-div-icon_inner"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="-4 0 36 36"><g fill="none" fill-rule="evenodd"><path fill="#000000" d="M14 0c7.732 0 14 5.641 14 12.6C28 23.963 14 36 14 36S0 24.064 0 12.6C0 5.641 6.268 0 14 0Z"/></g><g fill="#fff" transform="scale(0.6) translate(8, 6)"><path d="m15.16 24.73h4.27v6.27h-4.27z"/><path d="m1.98999 13.14001c.15002.39996.52002.66998.94.66998h1.37v16.19001c0 .54999.45001 1 1 1h7.85999v-7.27002c0-.54999.45001-1 1-1h5.27002v-5.27002c0-.54999.45001-1 1-1h7.27002v-2.64996h1.37c.41998 0 .78998-.27002.94-.66998.14001-.39001.02002-.84003-.31-1.10004l-13.06-10.81c-.37-.31-.91003-.31-1.28003 0l-13.06 10.81c-.33002.26001-.45001.71002-.31 1.10003z"/><path d="m21.43 18.46h6.27v4.27h-6.27z"/><path d="m21.42999 24.72998v6.27002h5.27002c.54999 0 1-.45001 1-1v-5.27002z"/></g></svg></div>',
			});

			var iconMarker = L.divIcon({
				className: "my-div-icon",
				iconSize: 20,
				html: '<div class="my-div-icon_inner"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-4 0 36 36"><g fill="none" fill-rule="evenodd"><path fill="red" d="M14 0c7.732 0 14 5.641 14 12.6C28 23.963 14 36 14 36S0 24.064 0 12.6C0 5.641 6.268 0 14 0Z"/><circle cx="14" cy="14" r="10" fill="#fff" fill-rule="nonzero"/></g></svg></div>',
			});

			function init(lat, lon) {
				map = L.map('map').setView([lat, lon], 7);
				
				L.marker([lat, lon], {icon: iconStock} ).addTo(map);

				L.tileLayer('https://osm.gt-logistics.su/styles/basic-preview/{z}/{x}/{y}.png', {
					maxZoom: 18
				}).addTo(map);
			}

			function renderPoints(data) {
				const markers = [];

				data.points.forEach(point => {	
					const lat = point.lat;
					const lon = point.lon;

					markers.push(L.marker([lat, lon], {icon: iconMarker} ));
				});

				L.layerGroup(markers).addTo(map)
				
				map.getBounds();
			}
		</script>
	</body>
</html>

`;

export default html_script;
