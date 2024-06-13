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

		<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.4.1/leaflet.markercluster.js"></script>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.4.1/MarkerCluster.css" />
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.4.1/MarkerCluster.Default.css" />

		<script src="https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js"></script>

		<style>
			.my-div-icon_active .my-div-icon_inner {
				transition: all 0.3s;
				transform-origin: bottom center;
				scale: 1.5;
			}

			.my-div-icon_active .text {
				transition: all 0.3s;
				transform-origin: bottom center;
				scale: 1.5;
			}

			.my-div-icon_active svg path{
				fill: red;
				transition: all 0.5s;
			}

			.my-div-icon_inner {
				position: relative;
			}

			.my-div-icon_inner_number-route {
				visibility: hidden;
				opacity: 0;
			}
			.my-div-icon_inner_number, .my-div-icon_inner_number-route {   
				font-size: 9px;
				font-weight: 700;
				line-height: 12px;
				color: black;
				position: absolute;
				left: 0;
				right: 0;
				top: 3px;
				text-align: center;
			}
		 </style>
		
	</head>
	
	<body style="padding: 0; margin: 0">
		<div id="map" style="width: 100%; height: 100vh;"></div>

		<script>
			let map;
			let polyline = [];

			var iconCar = L.divIcon({
				className: "my-div-icon",
				iconSize: 35,
				html: '<div class="my-div-icon_inner" style="bottom: 10px"><svg width="35" height="35" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="Icon"><g><path d="m11.498 10.074v8.5c0 .276.224.5.5.5s.5-.224.5-.5v-8.5c0-.276-.224-.5-.5-.5s-.5.224-.5.5z" fill="#00000"/><circle cx="11.998" cy="6.074" fill="#0000FF" r="4.5"/></g></g></svg></div>',
			});

			var iconStock = L.divIcon({
				className: "my-div-icon",
				iconSize: 25,
				html: '<div class="my-div-icon_inner"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="-4 0 36 36"><g fill="none" fill-rule="evenodd"><path fill="#000000" d="M14 0c7.732 0 14 5.641 14 12.6C28 23.963 14 36 14 36S0 24.064 0 12.6C0 5.641 6.268 0 14 0Z"/></g><g fill="#fff" transform="scale(0.6) translate(8, 6)"><path d="m15.16 24.73h4.27v6.27h-4.27z"/><path d="m1.98999 13.14001c.15002.39996.52002.66998.94.66998h1.37v16.19001c0 .54999.45001 1 1 1h7.85999v-7.27002c0-.54999.45001-1 1-1h5.27002v-5.27002c0-.54999.45001-1 1-1h7.27002v-2.64996h1.37c.41998 0 .78998-.27002.94-.66998.14001-.39001.02002-.84003-.31-1.10004l-13.06-10.81c-.37-.31-.91003-.31-1.28003 0l-13.06 10.81c-.33002.26001-.45001.71002-.31 1.10003z"/><path d="m21.43 18.46h6.27v4.27h-6.27z"/><path d="m21.42999 24.72998v6.27002h5.27002c.54999 0 1-.45001 1-1v-5.27002z"/></g></svg></div>',
			});

			var iconMarker1 = L.divIcon({
				className: "my-div-icon",
				iconSize: 20,
				html: '<div class="my-div-icon_inner"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-4 0 36 36"><g fill="none" fill-rule="evenodd"><path fill="red" d="M14 0c7.732 0 14 5.641 14 12.6C28 23.963 14 36 14 36S0 24.064 0 12.6C0 5.641 6.268 0 14 0Z"/><circle cx="14" cy="14" r="10" fill="#fff" fill-rule="nonzero"/></g></svg></div>',
			});

			function init(lat, lon) {
				map = L.map('map').setView([lat, lon], 7);
				
				L.marker([lat, lon], {icon: iconCar} ).addTo(map);

				/*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 18
				}).addTo(map);*/

				L.tileLayer('https://osm.gt-logistics.su/styles/basic-preview/{z}/{x}/{y}.png', {
					maxZoom: 18
				}).addTo(map);
			}

			function renderPoints1 (data) {
				const markers = [];
				
				data.points.forEach(point => {
					const fillColor = point.color;
					const lat = point.lat;
					const lon = point.lon;
					const numberPoint = point.number;
					const bindName = 123;

					alert(bindName);
					
					const bindText = point.bindText;

					var iconMarker = L.divIcon({
						className: 'my-div-icon',
						iconSize: 25,
						html: '<div class="my-div-icon_inner"><span class="my-div-icon_inner_number">' + numberPoint + '</span><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="-4 0 36 36"><g fill="none" fill-rule="evenodd"><path fill=' + fillColor + ' d="M14 0c7.732 0 14 5.641 14 12.6C28 23.963 14 36 14 36S0 24.064 0 12.6C0 5.641 6.268 0 14 0Z"/><circle cx="14" cy="14" r="10" fill="#fff" fill-rule="nonzero"/></g></svg></div>',
					});

					let markerOptions = {
						icon: iconMarker,		
					};

					markers.push(L.marker([lat, lon], {icon: iconMarker}).bindPopup(bindText));
				});

				const markerClusterGroup = L.markerClusterGroup();
				 markerClusterGroup.addLayers(markers); // Добавление маркеров в группу
				 map.addLayer(markerClusterGroup);

				const polylineCoordinates = data.coordinates;

				const polyline = L.polyline(polylineCoordinates, { color: 'red', weight: 2 }).addTo(map);

				L.polylineDecorator(polyline, {
					patterns: [
					  { offset: '50%', repeat: 100, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { stroke: true, color: 'red' } }) }
					]
				  }).addTo(map);
				
				  map.addLayer(markerClusterGroup);
				  map.addLayer(polyline);
				  map.fitBounds(markerClusterGroup.getBounds().extend(polyline.getBounds()));
			}

			function renderPoints(data) {
				const markers = [];
				const polylineCoordinates = data.coordinates;
				const markerClusterGroup = L.markerClusterGroup();
  
				data.points.forEach((point, index) => {
				  const fillColor = point.color;
				  const lat = point.lat;
				  const lon = point.lon;
				  const bindText = point.bindText;
				  const numberPoint = point.number;
			  
				  const iconMarker = L.divIcon({
					className: 'my-div-icon',
					iconSize: 25,
					html: '<div class="my-div-icon_inner"><span class="my-div-icon_inner_number">' + numberPoint + '</span><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="-4 0 36 36"><g fill="none" fill-rule="evenodd"><path fill=' + fillColor + ' d="M14 0c7.732 0 14 5.641 14 12.6C28 23.963 14 36 14 36S0 24.064 0 12.6C0 5.641 6.268 0 14 0Z"/><circle cx="14" cy="14" r="10" fill="#fff" fill-rule="nonzero"/></g></svg></div>',
				  });
			  
				  const marker = L.marker([lat, lon], { icon: iconMarker }).bindPopup(bindText);
				  markers.push(marker);
				  markerClusterGroup.addLayer(marker);
				});
			  
				const polyline = L.polyline(polylineCoordinates, { color: 'red', weight: 2 });
				
				L.polylineDecorator(polyline, {
					patterns: [
					  { offset: '50%', repeat: 100, symbol: L.Symbol.arrowHead({ pixelSize: 5, polygon: false, pathOptions: { stroke: true, color: 'red' } }) }
					]
				  }).addTo(map);
				
				map.addLayer(markerClusterGroup);
				map.addLayer(polyline);
				map.fitBounds(markerClusterGroup.getBounds().extend(polyline.getBounds()));
			}
		</script>
	</body>
</html>

`;

export default html_script;
