var map;
var places;
var iw;
var markers = [];

function initialize() {
  var options = {
    zoom: 12,
    center: new google.maps.LatLng(37.783259, -122.402708), //same as
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  var mapCanvas = document.getElementById('map_canvas');
  map = new google.maps.Map(mapCanvas, options);
  places = new google.maps.places.PlacesService(map);
}                                                     //these are the settings for initializing the google map

function updateKeyword(event) {
  updateRankByCheckbox();
  blockEvent(event);
}

function blockEvent(event) {
  if (event.which == 13) {
    event.cancelBubble = true;
    event.returnValue = false;
  }
}

function updateRankByCheckbox() {
  var types = getTypes();
  var keyword = document.controls.keyword.value;
  var disabled = !types.length && !keyword;
  var label = document.getElementById('rankbylabel');
  label.style.color = disabled ? '#cccccc' : '#333';
  document.controls.rankbydistance.disabled = disabled;
}

function getTypes() {
  var types = []
  for (var i = 0; i < document.controls.type.length; i++) {
    if (document.controls.type[i].checked) {
      types.push(document.controls.type[i].value);
    }
  }
  return types;
}

function search(event) {
  if (event) {
    event.cancelBubble = true;
    event.returnValue = false;
  }

  var search = {};

  // Set desired types.
  var types = getTypes();
  if (types.length) {
    search.types = types;
  }

  // Set keyword.
  var keyword = document.controls.keyword.value;
  if (keyword) {
    search.keyword = keyword;
  }

  // Set ranking.
  if (!document.controls.rankbydistance.disabled &&
      document.controls.rankbydistance.checked) {
    search.rankBy = google.maps.places.RankBy.DISTANCE;
    search.location = map.getCenter();
  } else {
    search.rankBy = google.maps.places.RankBy.PROMINENCE;
    search.bounds = map.getBounds()
  }

  // Search.
  places.search(search, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      clearResults();
      clearMarkers();                      
      for (var i = 0; i < results.length; i++) {
        var letter = String.fromCharCode(65 + i);
        markers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: 'http://maps.gstatic.com/intl/en_us/mapfiles/marker' +
              letter + '.png'
        });
        google.maps.event.addListener(
            markers[i], 'click', getDetails(results[i], i));
        dropMarker(markers[i], i * 100);
        addResult(results[i], i);
      }
    }
  });
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
      delete markers[i]

    }
  }
}

function dropMarker(marker, delay) {
  window.setTimeout(function() {
    marker.setMap(map);
  }, delay);
}

function addResult(result, i) {
  var results = document.getElementById('results');
  var tr = document.createElement('tr');
  tr.style.backgroundColor = i % 2 == 0 ? '#F0F0F0' : '#FFFFFF';
  tr.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };

  var iconTd = document.createElement('td');
  var nameTd = document.createElement('td');
  var icon = document.createElement('img');
  icon.src = result.icon;
  icon.className = 'placeIcon';
  var name = document.createTextNode(result.name);
  iconTd.appendChild(icon);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
}

function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

function getDetails(result, i) {
  return function() {
    places.getDetails({
      reference: result.reference
    }, showInfoWindow(i));
  }
}

function showInfoWindow(i) {
  return function(place, status) {
    if (iw) {
      iw.close();
      iw = null;
    }

    if (status == google.maps.places.PlacesServiceStatus.OK) {
      iw = new google.maps.InfoWindow({
        content: getIWContent(place)
      });
      iw.open(map, markers[i]);
    }
  }
}

function getIWContent(place) {
  var content = '<table style="border:0"><tr><td style="border:0;">';
  content += '<img class="placeIcon" src="' + place.icon + '"></td>';
  content += '<td style="border:0;"><b><a href="' + place.url + '">';
  content += place.name + '</a></b>';
  content += '</td></tr></table>';
  return content;
}

google.maps.event.addDomListener(window, 'load', initialize);  //when window is finished loading, render JavaScript
