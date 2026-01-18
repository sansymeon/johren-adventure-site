// place policy:
// Only locations explicitly marked as visible are rendered on the map.
// Sample markers are shown separately for demonstration purposes.

window.JBS_MAP = {
  center: [33.5, 130.5], // Kyushu overview
  zoom: 9
};

// If you later want “real” joined locations in one array:
window.PLACE_MAP = {
  center: [33.557082, 130.199305], // Itoshima (optional if you ever use it)
  zoom: 11,
  places: [
    // joined locations only
  ]
};

window.samples = [
  {
    id: "sample_01",
    name: "Johren Karatsu サンプル・スポット",
    level: 1,
    lat: 33.57815,
    lng: 130.25986,
    visible: true,
    pin_url: "/jbs/pin/level_01/?id=sample_01",
    qr_url:  "/jbs/qr/level_01/?id=sample_01"
  },
  {
    id: "sample_02",
    name: "Johren Itoshima サンプル・スポット",
    level: 3,
    lat: 33.55857973584153,
    lng: 130.21385183358143,
    visible: true,
    pin_url: "/jbs/pin/level_02/?id=sample_02",
    qr_url:  "/jbs/qr/level_02/?id=sample_02"
  },
  
  {
    id: "sample_03",
    name: "Johren Fukuoka-Chuo サンプル・スポット",
    level: 1,
    lat: 33.58620293814177,
    lng: 130.3764331173192,
    visible: true,
    pin_url: "/jbs/pin/level_03/?id=sample_03",
    qr_url:  "/jbs/qr/level_03/?id=sample_03"
  }
];
