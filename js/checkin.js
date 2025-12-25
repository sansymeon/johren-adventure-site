const params = new URLSearchParams(window.location.search);
const stationId = params.get('id');

if (stationId && typeof markStationVisited === 'function') {
  markStationVisited(stationId);
}

