/**
 * Check-in places. Coordinates for stations come from data/japan/map-data.js.
 * Airport points are passenger terminals, not runway centres.
 *
 * To add a station: append its map pin id to railway.places.
 * Ordinary stations have no artwork. A special station may set special: true
 * and, later, rewards: { stageImage, character, background }. Leave rewards
 * unset until the artwork exists. Every listed station still awards one puzzle piece.
 * To add an airport discovery: append one place. Its id is the lifetime
 * collection id. One place may list several points when those doors should
 * count as the same discovery. Separate terminals that each count once
 * are separate places, as with Fukuoka domestic and international.
 */
(function (global) {
  "use strict";

  var LOCATIONS = {
    railway: {
      id: "railway",
      radiusMeters: 150,
      maxAccuracyMeters: 150,
      places: [],
      /**
       * Every station pin in map-data.js is collectible.
       * Featured stations may name a nearby place and, later, an image path.
       * image is omitted until a photograph exists, so the sheet shows no picture frame.
       * 糸島高校前 remains Turbo's home station and still awards one puzzle piece.
       */
      featured: {
        chikuhi_meinohama: {
          attractionJa: "小戸ヨットハーバー",
          attractionEn: "Odo Yacht Harbor",
          descriptionJa: "ヨットと帆船が見える海辺です。",
          descriptionEn: "A shoreline with yachts and sailboats.",
          image: ""
        },
        chikuhi_kyudaigakkentoshi: {
          attractionJa: "九州大学伊都キャンパス周辺",
          attractionEn: "Around Kyushu University Ito Campus",
          descriptionJa: "キャンパス周辺の風景です。",
          descriptionEn: "The area around the campus.",
          image: ""
        },
        chikuhi_itoshimakoko_mae: {
          attractionJa: "桜井二見ヶ浦",
          attractionEn: "Sakurai Futamigaura",
          descriptionJa: "夫婦岩で知られる海岸です。",
          descriptionEn: "The coast known for the wedded rocks.",
          image: "",
          special: true,
          role: "turbo_home"
        },
        chikuhi_chikuzen_maebaru: {
          attractionJa: "白糸の滝",
          attractionEn: "Shiraito Falls",
          descriptionJa: "前原の南にある滝です。",
          descriptionEn: "A waterfall south of Maebaru.",
          image: ""
        },
        chikuhi_higashi_saga: {
          attractionJa: "虹の松原",
          attractionEn: "Nijinomatsubara",
          descriptionJa: "海岸に続く松原です。",
          descriptionEn: "A pine grove along the coast.",
          image: ""
        },
        chikuhi_saga: {
          attractionJa: "唐津城",
          attractionEn: "Karatsu Castle",
          descriptionJa: "唐津の城です。",
          descriptionEn: "The castle at Karatsu.",
          image: ""
        }
      }
    },
    airport: {
      id: "airport",
      radiusMeters: 250,
      maxAccuracyMeters: 150,
      places: [
        {
          id: "fukuoka_airport_domestic",
          name: "福岡空港 国内線ターミナル",
          nameEn: "Fukuoka Airport Domestic Terminal",
          points: [
            {
              id: "fukuoka_airport_domestic",
              /* NAVITIME 国内線旅客ターミナルビル, 2026-11-23 */
              lat: 33.597935,
              lng: 130.447682
            }
          ]
        },
        {
          id: "fukuoka_airport_international",
          name: "福岡空港 国際線ターミナル",
          nameEn: "Fukuoka Airport International Terminal",
          points: [
            {
              id: "fukuoka_airport_international",
              /* MapFan 国際線旅客ターミナルビル出発口 */
              lat: 33.585058,
              lng: 130.443299
            }
          ]
        },
        {
          id: "saga_airport",
          name: "佐賀空港",
          nameEn: "Saga Airport",
          points: [{
            id: "saga_airport_terminal",
            /* Mapion 国内線出発口 */
            lat: 33.153667,
            lng: 130.303574
          }]
        },
        {
          id: "kitakyushu_airport",
          name: "北九州空港",
          nameEn: "Kitakyushu Airport",
          /* Official aerodrome reference, same island as the passenger terminal. Not a surveyed door. */
          radiusMeters: 400,
          points: [{ id: "kitakyushu_airport", lat: 33.84556, lng: 131.03500 }]
        },
        {
          id: "nagasaki_airport",
          name: "長崎空港",
          nameEn: "Nagasaki Airport",
          radiusMeters: 400,
          points: [{ id: "nagasaki_airport", lat: 32.9169, lng: 129.9136 }]
        },
        {
          id: "tsushima_airport",
          name: "対馬空港",
          nameEn: "Tsushima Airport",
          radiusMeters: 300,
          points: [{ id: "tsushima_airport", lat: 34.284574, lng: 129.331353 }]
        },
        {
          id: "iki_airport",
          name: "壱岐空港",
          nameEn: "Iki Airport",
          radiusMeters: 300,
          points: [{ id: "iki_airport", lat: 33.749026, lng: 129.785263 }]
        },
        {
          id: "fukue_airport",
          name: "福江空港",
          nameEn: "Fukue Airport",
          radiusMeters: 300,
          points: [{ id: "fukue_airport", lat: 32.666394, lng: 128.832984 }]
        },
        {
          id: "kumamoto_airport",
          name: "熊本空港",
          nameEn: "Kumamoto Airport",
          radiusMeters: 400,
          points: [{ id: "kumamoto_airport", lat: 32.83722, lng: 130.85500 }]
        },
        {
          id: "amakusa_airport",
          name: "天草空港",
          nameEn: "Amakusa Airport",
          radiusMeters: 300,
          points: [{ id: "amakusa_airport", lat: 32.482217, lng: 130.158460 }]
        },
        {
          id: "oita_airport",
          name: "大分空港",
          nameEn: "Oita Airport",
          points: [{
            id: "oita_airport",
            /* Bank branch inside the passenger terminal building */
            lat: 33.477082,
            lng: 131.732468
          }]
        },
        {
          id: "miyazaki_airport",
          name: "宮崎空港",
          nameEn: "Miyazaki Airport",
          points: [{
            id: "miyazaki_airport",
            /* Wikimapia label: 宮崎空港 旅客ターミナルビル */
            lat: 31.872778,
            lng: 131.441111
          }]
        },
        {
          id: "kagoshima_airport",
          name: "鹿児島空港",
          nameEn: "Kagoshima Airport",
          radiusMeters: 400,
          points: [{ id: "kagoshima_airport", lat: 31.803333, lng: 130.719444 }]
        },
        {
          id: "tanegashima_airport",
          name: "種子島空港",
          nameEn: "Tanegashima Airport",
          radiusMeters: 300,
          points: [{ id: "tanegashima_airport", lat: 30.604804, lng: 130.992020 }]
        },
        {
          id: "yakushima_airport",
          name: "屋久島空港",
          nameEn: "Yakushima Airport",
          radiusMeters: 300,
          points: [{ id: "yakushima_airport", lat: 30.387514, lng: 130.656788 }]
        },
        {
          id: "amami_airport",
          name: "奄美空港",
          nameEn: "Amami Airport",
          radiusMeters: 300,
          points: [{ id: "amami_airport", lat: 28.430906, lng: 129.710339 }]
        },
        {
          id: "kikai_airport",
          name: "喜界空港",
          nameEn: "Kikai Airport",
          radiusMeters: 300,
          points: [{ id: "kikai_airport", lat: 28.322156, lng: 129.929290 }]
        },
        {
          id: "tokunoshima_airport",
          name: "徳之島空港",
          nameEn: "Tokunoshima Airport",
          radiusMeters: 300,
          points: [{ id: "tokunoshima_airport", lat: 27.835182, lng: 128.881710 }]
        },
        {
          id: "okinoerabu_airport",
          name: "沖永良部空港",
          nameEn: "Okinoerabu Airport",
          radiusMeters: 300,
          points: [{ id: "okinoerabu_airport", lat: 27.431244, lng: 128.705289 }]
        },
        {
          id: "yoron_airport",
          name: "与論空港",
          nameEn: "Yoron Airport",
          radiusMeters: 300,
          points: [{ id: "yoron_airport", lat: 27.043899, lng: 128.401191 }]
        },
        {
          id: "takamatsu_airport",
          name: "高松空港",
          nameEn: "Takamatsu Airport",
          points: [{ id: "takamatsu_airport", lat: 34.215174, lng: 134.019401 }]
        },
        {
          id: "tokushima_airport",
          name: "徳島阿波おどり空港",
          nameEn: "Tokushima Awaodori Airport",
          points: [{ id: "tokushima_airport", lat: 34.132980, lng: 134.605373 }]
        },
        {
          id: "matsuyama_airport",
          name: "松山空港",
          nameEn: "Matsuyama Airport",
          points: [{ id: "matsuyama_airport", lat: 33.827314, lng: 132.701326 }]
        },
        {
          id: "kochi_airport",
          name: "高知龍馬空港",
          nameEn: "Kochi Ryoma Airport",
          points: [{ id: "kochi_airport", lat: 33.546340, lng: 133.671049 }]
        },
        {
          id: "naha_airport_terminal",
          name: "那覇空港",
          nameEn: "Naha Airport",
          points: [{
            id: "naha_airport_terminal",
            /* OSM aeroway=terminal 那覇空港国内線ターミナル (passenger building). Not the monorail station. */
            lat: 26.206278,
            lng: 127.650803
          }]
        }
      ]
    }
  };

  function pointRecord(category, place, point) {
    return {
      category: category.id,
      placeId: place.id,
      pointId: point.id,
      radiusMeters: place.radiusMeters || category.radiusMeters,
      maxAccuracyMeters: category.maxAccuracyMeters,
      name: point.name || place.name,
      nameEn: point.nameEn || place.nameEn || "",
      placeName: place.name,
      placeNameEn: place.nameEn || "",
      lat: point.lat,
      lng: point.lng,
      special: place.special === true,
      role: place.role || "",
      rewards: place.rewards || null
    };
  }

  function findPoint(pointId) {
    var categories = [LOCATIONS.railway, LOCATIONS.airport];
    var c;
    var p;
    var i;
    var point;
    for (c = 0; c < categories.length; c += 1) {
      for (p = 0; p < categories[c].places.length; p += 1) {
        var place = categories[c].places[p];
        var points = place.points || [{ id: place.id }];
        for (i = 0; i < points.length; i += 1) {
          if (points[i].id === pointId) {
            point = points[i];
            return pointRecord(categories[c], place, point);
          }
        }
      }
    }
    return stationById(pointId);
  }

  function stationById(id) {
    var pins = (global.MAP_DATA && global.MAP_DATA.pins) || [];
    var i;
    var pin;
    var feature;
    for (i = 0; i < pins.length; i += 1) {
      pin = pins[i];
      if (pin.id !== id || String(pin.type || "").toLowerCase() !== "station") continue;
      if (typeof pin.lat !== "number" || typeof pin.lng !== "number") return null;
      feature = (LOCATIONS.railway.featured || {})[id] || null;
      return {
        category: "railway",
        placeId: pin.id,
        pointId: pin.id,
        radiusMeters: LOCATIONS.railway.radiusMeters,
        maxAccuracyMeters: LOCATIONS.railway.maxAccuracyMeters,
        name: pin.name,
        nameEn: pin.nameEn || "",
        placeName: pin.name,
        placeNameEn: pin.nameEn || "",
        lat: pin.lat,
        lng: pin.lng,
        special: !!(feature && feature.special),
        role: (feature && feature.role) || "",
        rewards: feature && feature.image ? { stageImage: feature.image } : null,
        featured: feature
      };
    }
    return null;
  }

  function airportPins() {
    var pins = [];
    LOCATIONS.airport.places.forEach(function (place) {
      (place.points || []).forEach(function (point) {
        pins.push({
          id: point.id,
          instanceKey: point.id,
          name: point.name || place.name,
          nameEn: point.nameEn || place.nameEn,
          area: "airport",
          line: "",
          type: "airport",
          filter: "airport",
          lat: point.lat,
          lng: point.lng,
          placeId: place.id,
          pointName: point.name,
          pointNameEn: point.nameEn
        });
      });
    });
    return pins;
  }

  global.TURBO_LOCATIONS = {
    config: LOCATIONS,
    findPoint: findPoint,
    airportPins: airportPins
  };
})(window);
