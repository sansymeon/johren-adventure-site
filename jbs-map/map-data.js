window.samples = [
  {
    name: "Johren サンプル・スポット",
    lat: 33.55857973584153,
    lng: 130.21385183358143,
    url: "/merchant/sample/index.html"
  }
];
window.stations.forEach(st => {
  if (st.lng > 132 || st.lat < 32) {
    console.warn("Suspicious station location:", st.name, st.lat, st.lng);
  }
  
});

 
