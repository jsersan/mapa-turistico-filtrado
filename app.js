const urlBase =
    "https://opendata.euskadi.eus/contenidos/ds_recursos_turisticos/top_euskadi/opendata/top-euskadi.json"

document.addEventListener("DOMContentLoaded", () => crearScript(urlBase));

let script;
let mapa;
let markers = [];
let data;
let tipo = "";

let emoticon;
let legend = null;
legend = document.getElementById("legend");
let inicio = false;

const cargarData = async (fichero) => {
    const response = await fetch(fichero);
    const data = await response.json();
    return data;
};

const cargarYmostrarDatos = async (fichero) => {
    data = await cargarData(fichero);
    console.log(data);
    console.log('Llamando a colocar pines');
    colocarPines(data, tipo);
}

function crearScript(url) {
    script = document.createElement("script");
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

window.onload = function () {
    var valores = getGET();
    if (valores) {
        tipo = valores['tipo'];
    }
    if (tipo !== undefined) {
        fichero = cargarDatos(tipo);
        console.log(fichero)
        cargarYmostrarDatos(fichero);
    }
    initMap();
    colocarLeyenda();
}

function getGET() {
    var loc = document.location.href;
    if (loc.indexOf("?") > 0) {
        var getString = loc.split("?")[1];
        var GET = getString.split("&");
        var get = {};
        for (var i = 0, l = GET.length; i < l; i++) {
            var tmp = GET[i].split("=");
            get[tmp[0]] = unescape(decodeURI(tmp[1]));
        }
        return get;
    }
}

function initMap() {
    const LatLong = {
        lat: 42.9003479,
        lng: -2.593411
    };
    this.mapa = new google.maps.Map(document.getElementById("mapa"), {
        center: LatLong,
        zoom: 10
    });
    return;
}

function colocarLeyenda() {
    var iconBase = "https://maps.google.com/mapfiles/kml/shapes/";
    var icons = {
        capital: {
            name: "capitales",
            icon: iconBase + "capital_big_highlight.png"
        },
        museos: {
            name: "museos",
            icon: iconBase + "museum_maps.png"
        },
        aeropuerto: {
            name: "aeropuertos",
            icon: iconBase + "airports_maps.png"
        },
        restaurante: {
            name: "restaurantes",
            icon: "https://maps.google.com/mapfiles/kml/pal2/icon40.png"
        },
        topturismo: {
            name: "topturismo",
            icon: iconBase + "camera_maps.png"
        },
        hotel: {
            name: "hoteles",
            icon: "https://maps.google.com/mapfiles/kml/pal2/icon28.png"
        }
    };

    if (!inicio) {
        for (var key in icons) {
            var type = icons[key];
            var name = type.name;
            var icon = type.icon;
            var div = document.createElement("div");
            div.setAttribute("id", "leyenda");
            var enlace =
                '<a href="' +
                "index.html?tipo=" +
                name +
                '"><img src="' +
                icon +
                '">' +
                name +
                "</a>";
            div.innerHTML = enlace;
            legend.appendChild(div);
        }
        inicio = true;
    }
    this.mapa.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
    return;
}

function cargarDatos(tipo) {
    let fichero;
    switch (tipo) {
        case "restaurantes":
            fichero =
                "https://opendata.euskadi.eus/contenidos/ds_recursos_turisticos/restaurantes_sidrerias_bodegas/opendata/restaurantes.json";
            break;
        case "hoteles":
            fichero =
                "https://opendata.euskadi.eus/contenidos/ds_recursos_turisticos/hoteles_de_euskadi/opendata/alojamientos.json";
            break;
        case "hospitales":
            fichero =
                "https://opendata.euskadi.eus/contenidos/ds_localizaciones/centros_salud_en_euskadi/opendata/centros-salud.json";
            break;
        case "aeropuertos":
            fichero =
                "https://opendata.euskadi.eus/contenidos/ds_recursos_turisticos/aeropuertos_euskadi/opendata/transporte.json";
            break;
        case "museos":
            fichero =
                "https://opendata.euskadi.eus/contenidos/ds_recursos_turisticos/museos_centros_interpretacion/opendata/museos.json";
            break;
        case "topturismo":
            fichero =
                "https://opendata.euskadi.eus/contenidos/ds_recursos_turisticos/oficinas_turisticas_euskadi/opendata/oficinas-turismo.json";
            break;
        case "capitales":
            fichero = "datoscapitales.json";
            break;
    }
    return fichero;
}

const correccionesCoordenadas = {
    "Conjunto Monumental de Iruña-Veleia": { lat: 42.8464, lng: -2.6679 },
    "Bidasoa Activa - Bidasoa Bizirik": { lat: 43.3390, lng: -1.7894 }
};

const LIMITES_EUSKADI = {
    latMin: 42.0,
    latMax: 43.5,
    lngMin: -3.5,
    lngMax: -1.5
};

function coordenadasValidas(lat, lng) {
    return lat >= LIMITES_EUSKADI.latMin && 
           lat <= LIMITES_EUSKADI.latMax &&
           lng >= LIMITES_EUSKADI.lngMin && 
           lng <= LIMITES_EUSKADI.lngMax;
}

function colocarPines(data, tipo) {
    let lat, lng, nombre, provincia, municipio, paginaWeb, email, marks, infoWindowActivo;
    let bounds = new google.maps.LatLngBounds();
    let contadorMarcadores = 0;

    var iconBase = "https://maps.google.com/mapfiles/kml/shapes/";
    var icons = {
        capitales: {
            name: "capitales",
            icon: iconBase + "capital_big_highlight.png"
        },
        hoteles: {
            name: "hoteles",
            icon: iconBase + "lodging_maps.png"
        },
        museos: {
            name: "museos",
            icon: iconBase + "museum_maps.png"
        },
        aeropuertos: {
            name: "aeropuertos",
            icon: iconBase + "airports_maps.png"
        },
        restaurantes: {
            name: "restaurantes",
            icon: iconBase + "dining_maps.png"
        },
        hospitales: {
            name: "hospitales",
            icon: iconBase + "hospitals_maps.png"
        },
        topturismo: {
            name: "topturismo",
            icon: iconBase + "camera_maps.png"
        }
    };

    let tipoEstablecimiento;

    if (!inicio) {
        for (var key in icons) {
            var type = icons[key];
            var name = type.name;
            var icon = type.icon;
            var div = document.createElement("div");
            div.setAttribute("id", "leyenda");
            var enlace =
                '<a href="' +
                "todos.html?tipo=" +
                name +
                '"><img src="' +
                icon +
                '">' +
                name +
                "</a>";
            div.innerHTML = enlace;
            legend.appendChild(div);
        }
        inicio = true;
    }

    this.mapa.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);

    data.forEach(element => {
        let estrellas = 0;
        tipoEstablecimiento = tipo;
        estrellas = element.category;
        lat = element.latwgs84;
        lng = element.lonwgs84;
        nombre = element.documentName;
        provincia = element.territory;
        municipio = element.municipality;
        marks = element.marks;
        telefono = element.phone;
        michelin = element.michelinStar;
        descripcion = element.templateType;
        email = element.tourismEmail;

        if (tipo === "hospitales") {
            paginaWeb = element.webpage;
        } else {
            paginaWeb = element.web;
        }

        if (lat != null || lng != null) {
            lat = lat.replace(",", ".");
            lng = lng.replace(",", ".");
        }

        let latNum = Number(lat);
        let lngNum = Number(lng);

        if (correccionesCoordenadas[nombre]) {
            console.log(`Aplicando corrección para: ${nombre}`);
            latNum = correccionesCoordenadas[nombre].lat;
            lngNum = correccionesCoordenadas[nombre].lng;
        }

        if (!coordenadasValidas(latNum, lngNum)) {
            console.warn(`Coordenadas fuera de rango para ${nombre}: ${latNum}, ${lngNum}`);
            return;
        }

        const coordenadas = {
            lat: latNum,
            lng: lngNum,
            tipo: tipoEstablecimiento
        };

        if (((tipoEstablecimiento === 'restaurantes') && (michelin >= 1)) ||
            ((tipoEstablecimiento === 'hoteles') && (estrellas >= 3)) ||
            ((tipoEstablecimiento === 'capitales') || (tipoEstablecimiento === 'museos') || (tipoEstablecimiento === 'aeropuertos') || (tipoEstablecimiento === 'topturismo'))) {

            let marker = new google.maps.Marker({
                position: coordenadas,
                map: this.mapa,
                icon: icons[coordenadas.tipo].icon,
                tipo: tipoEstablecimiento
            });

            bounds.extend(coordenadas);
            contadorMarcadores++;

            let infoWindow = crearInfoWindow(
                nombre,
                descripcion,
                provincia,
                municipio,
                marks,
                paginaWeb,
                tipoEstablecimiento,
                descripcion,
                estrellas,
                michelin,
                email
            );

            marker.addListener("click", () => {
                if (infoWindowActivo) {
                    infoWindowActivo.close();
                }
                infoWindow.open(this.mapa, marker);
                infoWindowActivo = infoWindow;
            });
        }
    });

    if (contadorMarcadores > 0) {
        this.mapa.fitBounds(bounds);
        if (contadorMarcadores === 1) {
            google.maps.event.addListenerOnce(this.mapa, 'bounds_changed', function() {
                this.setZoom(12);
            });
        }
    }
    return;
}

function crearInfoWindow(
    nombre,
    descripcion,
    provincia,
    municipio,
    marks,
    paginaWeb,
    tipoEstablecimiento,
    descripcion,
    estrellas,
    michelin,
    email
) {
    if (tipoEstablecimiento === "hospitales") {
        if (paginaWeb == undefined) {
            paginaWeb = "https://www.osakidetza.eus";
        } else if (paginaWeb == "/r85-ghodon00/es") {
            paginaWeb = "https://www.osakidetza.eus" + paginaWeb;
        } else if (paginaWeb == "/r85-ghhpsq00/es/") {
            paginaWeb = "https://www.osakidetza.eus";
        } else if (paginaWeb == "85-ghrsmb00/es/") {
            paginaWeb = "https://www.osakidetza.eus";
        }
    } else {
        if (paginaWeb === undefined) {
            if (tipoEstablecimiento === "restaurantes") {
                paginaWeb = "https://www.restopolitan.es/restaurante/euskadi-49207.html";
            } else if (tipo === "museo") {
                paginaWeb = "https://www.euskadi.eus/directorio-de-museos/web01-a2muszen/es/";
            }
        } else {
            if (paginaWeb.substr(1, 3) === 'www') {
                paginaWeb = "https://" + paginaWeb;
            }
        }
    }

    markerInfo = `<h2>${nombre}</h2>`;
    if ((tipoEstablecimiento === 'restaurantes') || (tipoEstablecimiento === 'hoteles')) {
        let marcaStar = `<img src='https://maps.google.com/mapfiles/kml/pal4/icon47.png'>`;
        let marcaMich = `<img src='https://maps.google.com/mapfiles/kml/pal4/icon47.png'>`;

        stars = (Number)(estrellas);
        if (stars >= 3) {
            for (i = 1; i < stars; i++) {
                marcaStar += `<img src='https://maps.google.com/mapfiles/kml/pal4/icon47.png'>`;
            }
        }
        if ((tipoEstablecimiento === 'hoteles') && (stars > 1)) {
            markerInfo += `${marcaStar}`;
        }
        let michelines = (Number)(michelin);
        if (michelines > 0) {
            for (i = 1; i < michelines; i++) {
                marcaMich += `<img src='https://maps.google.com/mapfiles/kml/pal4/icon47.png'>`;
            }
        }
        if ((tipoEstablecimiento === 'restaurantes') && (michelines > 0)) {
            markerInfo += `${marcaMich}`;
        }
    }
    if ((tipoEstablecimiento !== 'restaurantes') && (tipoEstablecimiento !== 'hoteles') && (tipoEstablecimiento !== 'topturismo') && (tipoEstablecimiento !== 'capitales')) {
        markerInfo += `<br>${descripcion}</br>`;
    }
    markerInfo += ` <br><b>Provincia</b>: ${provincia}
                    <br><b>Municipio</b>: ${municipio} (${marks})`

    if (email !== undefined) {
        markerInfo += `<br><b>Correo Electrónico</b>:${email}`;
    }

    markerInfo += `<br><b>Más información</b>: <a href='${paginaWeb}' target='_blank'>Sitio Web</a>`;

    infoWindow = new google.maps.InfoWindow({
        content: markerInfo
    });

    return infoWindow;
}