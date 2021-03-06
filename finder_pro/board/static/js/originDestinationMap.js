async function initOriginDestinationMap(userLocationObject) {
    let webSiteSetting = null;
    if(sessionStorage.getItem("hasAcceptedCookies") === "False") {
        if(sessionStorage.getItem("uiState") == null) {
            sessionStorage.setItem("uiState", "default"); 
        }
        webSiteSetting = sessionStorage.getItem("uiState");
    }
    else if(sessionStorage.getItem("hasAcceptedCookies") == "True") {
        if (getCookie("webSiteSetting") == "") {
            setCookie("webSiteSetting", "default", 10);
        }
        webSiteSetting = getCookie("webSiteSetting");
    }
    else if(getCookie("webSiteSetting") != "") {
        webSiteSetting = getCookie("webSiteSetting");
    }
    
    const userPosition = userLocationObject.userPosition;
    const zoom_for_pos = userLocationObject.zoom_for_pos;

    const zoom_level_for_tiles = 10;
    let dmarkers = [];
    const input = document.getElementById("pac-input");

    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");
    const infowindowParking = new google.maps.InfoWindow();
    const infowindowContentParking = document.getElementById("infowindow-content-destination");
    const infowindowContentTravelParams = document.getElementById("infowindow-content-travel-params");
    let directionsDisplay = new google.maps.DirectionsRenderer();
    infowindow.setContent(infowindowContent);
    infowindowParking.setContent(infowindowContentParking);;
    let place = null;
    let origin_location = null;
    const select = document.getElementById("select-input");
    

    const svgMarker = {
        path: "M38.831,14.26c-0.191-0.233-0.476-0.369-0.775-0.369h-3.801c-0.938-2.474-2.16-4.898-3.549-5.813c-4.805-3.161-17.55-3.161-22.355,0c-1.39,0.916-2.607,3.343-3.55,5.813H1c-0.302,0-0.586,0.136-0.775,0.369c-0.19,0.232-0.266,0.539-0.204,0.834l0.563,2.728c0.096,0.465,0.506,0.797,0.979,0.797h1.126c-1.087,1.254-1.614,2.833-1.621,4.413c-0.007,1.952,0.734,3.716,2.089,4.964c0.015,0.013,0.03,0.022,0.044,0.035v3.817c0,0.827,0.672,1.5,1.5,1.5h3.506c0.828,0,1.5-0.673,1.5-1.5v-1.534h19.641v1.534c0,0.827,0.672,1.5,1.5,1.5h3.506c0.826,0,1.5-0.673,1.5-1.5v-3.742c1.438-1.317,2.125-3.129,2.134-4.938c0.006-1.634-0.545-3.271-1.696-4.551h1.201c0.475,0,0.885-0.332,0.979-0.798l0.564-2.727C39.094,14.799,39.021,14.494,38.831,14.26z M9.998,10.583c3.83-2.521,15.229-2.521,19.057,0c0.744,0.488,1.701,2.461,2.578,4.877H7.422C8.297,13.045,9.254,11.073,9.998,10.583zM5.512,23.408c0-1.63,1.322-2.95,2.951-2.95c1.631,0,2.951,1.32,2.951,2.95s-1.32,2.951-2.951,2.951C6.834,26.359,5.512,25.038,5.512,23.408z M30.631,26.359c-1.629,0-2.951-1.321-2.951-2.951s1.322-2.95,2.951-2.95c1.631,0,2.951,1.32,2.951,2.95S32.26,26.359,30.631,26.359z",
        fillColor: "red",
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 1,
        anchor: new google.maps.Point(15, 30)        
    };

    setStyle();

    let map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: userPosition.lat, lng: userPosition.lng },
        zoom: zoom_for_pos.zoom,
        minZoom: zoom_for_pos.min_zoom,
        styles: getCustomMapStyles(webSiteSetting),
        disableDefaultUI: true,
        streetViewControl: true,
        fullscreenControl: true
    });
    
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", map);
    autocomplete.setFields(["address_components", "geometry", "icon", "name"]);
    autocomplete.setTypes(["geocode"]);
    autocomplete.setOptions({ strictBounds: true });

    function createSvgDMarker(svg_marker_path, size) {
        const svgDMarker = {
            path: svg_marker_path,
            fillColor: "red",
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: size,
            anchor: new google.maps.Point(15, 30)             
        }
        return svgDMarker;
    }

    function createDMarker(destination_type) { 
        switch(destination_type) {
            case 'parking':
                return createSvgDMarker("m425.941 0h-393.176c-18.094 0-32.765 14.671-32.765 32.765v393.176c0 18.094 14.671 32.765 32.765 32.765h393.176c18.094 0 32.765-14.671 32.765-32.765v-393.176c0-18.094-14.671-32.765-32.765-32.765zm-196.588 294.882h-32.765v65.529h-65.529v-262.117h98.294c54.203 0 98.294 44.091 98.294 98.294s-44.091 98.294-98.294 98.294z", 
                0.07);
            case 'supermarket':
                return createSvgDMarker("M402.351,381.058h-203.32l-11.806-47.224h266.587L512,101.085H129.038L108.882,20.46H0v33.4h82.804l82.208,328.827c-24.053,5.971-41.938,27.737-41.938,53.611c0,30.461,24.781,55.242,55.241,55.242c30.459,0,55.241-24.781,55.241-55.242c0-7.755-1.613-15.138-4.511-21.841h122.577c-2.897,6.703-4.511,14.086-4.511,21.841c0,30.461,24.781,55.242,55.241,55.242c30.459,0,55.241-24.781,55.241-55.242C457.592,405.84,432.811,381.058,402.351,381.058z M287.029,300.434h-37.08l-8.284-66.275h45.365V300.434z M411.912,134.484h57.31l-16.568,66.275h-49.026L411.912,134.484z M399.453,234.16h44.85l-16.568,66.275h-36.566L399.453,234.16z M320.428,134.484h57.824l-8.284,66.275h-49.539V134.484z M320.428,234.159h45.365l-8.284,66.275h-37.08V234.159zM287.029,134.484v66.275h-49.539l-8.284-66.275H287.029z M137.388,134.484h58.158l8.284,66.275h-49.873L137.388,134.484zM162.307,234.159h45.699l8.284,66.275h-37.414L162.307,234.159z M178.315,458.141c-12.043,0-21.841-9.798-21.841-21.842c0-12.043,9.798-21.841,21.841-21.841s21.841,9.798,21.841,21.841C200.156,448.343,190.358,458.141,178.315,458.141zM402.351,458.141c-12.043,0-21.841-9.798-21.841-21.842c0-12.043,9.798-21.841,21.841-21.841c12.043,0,21.841,9.798,21.841,21.841C424.192,448.343,414.394,458.141,402.351,458.141z", 
                0.07);
            case 'tourist_attraction':
                return createSvgDMarker("M381.021 415.994h-71.688c-29.854 0-65.042-50.021-76.083-69.292l-.042.023c-.038-.065-.023-.146-.063-.211l-11.824-19.707 19.372 3.227c3.902 8.299 9.665 16.181 17.244 19.418 8.021 16.021 32.083 55.875 72.729 55.875s64.708-39.854 72.729-55.875c7.578-3.237 13.341-11.118 17.244-19.419l61.111-10.185c5.479-.917 9.333-5.875 8.875-11.396-.458-5.542-5.083-9.792-10.625-9.792h-54.435c-1.505-6.911-4.564-12.415-8.59-16.276l58.275-38.849c4.583-3.063 6.083-9.104 3.458-13.958-2.625-4.854-8.5-6.875-13.583-4.729l-65.279 27.984c-1.393-2.121-2.951-4.176-4.566-6.211l30.262-60.523c2.438-4.875.813-10.813-3.792-13.75-4.583-2.979-10.646-1.938-14.083 2.313l-39.288 49.128c-5.427-3.033-11.197-5.402-17.224-7.16l-9.905-79.28c-.667-5.354-5.208-9.354-10.583-9.354s-9.917 4-10.583 9.354l-9.938 79.538c-5.88 1.854-11.488 4.315-16.747 7.443l-39.732-49.668c-3.438-4.25-9.479-5.292-14.083-2.313-4.604 2.938-6.229 8.875-3.792 13.75l30.962 61.924c-1.376 1.773-2.725 3.551-3.947 5.368l-66.599-28.543c-5.063-2.146-10.958-.125-13.583 4.729s-1.125 10.896 3.458 13.958l58.332 38.893c-4.033 3.859-7.111 9.322-8.621 16.232h-31.361L120.99 159.588l6.738-29.199c.729-3.167-.021-6.5-2.042-9.042s-5.104-4.021-8.354-4.021h-.698C123.651 108.071 128 96.597 128 83.994c0-1.583-.104-3.021-.271-5.5-1.542-20.458-10.313-32.437-17.354-42.062-6.271-8.583-10.813-14.771-10.813-25.771 0-4.021-2.271-7.708-5.854-9.521s-7.875-1.438-11.146.938c-13.208 9.75-23.437 23.27-28.062 37.145-.313.958-.604 1.896-.896 2.833-.479-.458-1-.875-1.583-1.25-3.104-2-7.021-2.25-10.417-.646-1.979.938-19.354 10.188-20.208 40.812l-.063 3.021c0 12.603 4.349 24.077 11.365 33.333H32c-3.25 0-6.333 1.479-8.354 4.021-2.021 2.542-2.771 5.875-2.042 9.042l32 138.667c1.125 4.833 5.438 8.271 10.396 8.271h21.333c4.958 0 9.271-3.438 10.396-8.271l4.236-18.352 41.421 110.456-27.781 111.083c-2.396 9.625-.271 19.646 5.833 27.458 6.104 7.813 15.313 12.292 25.229 12.292H480c3.354 0 6.5-1.563 8.521-4.25 2.021-2.667 2.646-6.125 1.729-9.354-13.854-48.499-58.771-82.395-109.229-82.395zM260.854 296.723c5.583 0 10.208-4.292 10.625-9.854 1.417-18.333 26.771-52.208 59.188-52.208 32.646 0 59.146 31.104 59.146 51.396 0 5.896 4.771 10.667 10.667 10.667 1.438 0 4.854 3.188 4.854 11.063 0 6.25-6.604 20.271-9.417 21.896-4.208 0-8.042 2.479-9.75 6.333-2.188 4.917-22.25 47.979-55.5 47.979s-53.313-43.063-55.5-47.979c-1.708-3.854-4.563-6.167-8.771-6.167-3.792-1.792-10.396-15.813-10.396-22.063 0-7.875 3.417-11.063 4.854-11.063zm-184-40.729h-4.375L45.417 138.661h58.5L76.854 255.994zm-2.187-138.666c-17.646 0-32-14.958-32-33.333l.042-2.188c.083-3.375.458-6.271.958-8.771.063.042.104.104.146.146 4.333 4.458 10.083 6.813 16.625 6.813 5.896 0 10.667-4.771 10.667-10.667 0-5.667.625-14.312 3.646-23.375 1.625-4.854 4.271-9.708 7.75-14.25 2.917 6.75 6.917 12.208 10.667 17.333 6.542 8.938 12.208 16.687 13.354 32.062.063.938.146 1.875.146 2.896-.001 18.375-14.355 33.334-32.001 33.334zm33.972 95.786l5.444-23.591 97.75 162.93-29.104 58.229-74.09-197.568zm130.059 277.547c.069-.197.215-.344.281-.542l16.479-49.417c1.854-5.583-1.167-11.625-6.75-13.5-5.563-1.833-11.604 1.167-13.5 6.75l-16.479 49.417c-1.438 4.375-5.5 7.292-10.104 7.292h-63.959c-3.313 0-6.375-1.5-8.417-4.104s-2.75-5.938-1.938-9.146l20.271-81.055 16.771 44.721c1.479 3.958 5.188 6.688 9.417 6.896.188.021.375.021.563.021 4.021 0 7.729-2.271 9.542-5.896l34.223-68.445c16.23 23.714 48.82 63.674 84.236 63.674h71.688c36.083 0 68.667 21.333 83.646 53.333h-225.97z",
                0.1);
            case 'atm':
                return createSvgDMarker("M84,17.5H17A1.5,1.5,0,0,0,15.5,19V52A1.5,1.5,0,0,0,17,53.5h9.5V82A1.5,1.5,0,0,0,28,83.5h7.5V90A1.5,1.5,0,0,0,37,91.5H73A1.5,1.5,0,0,0,74.5,90V53.5H84A1.5,1.5,0,0,0,85.5,52V19A1.5,1.5,0,0,0,84,17.5Zm-65.5,33v-30h8v30Zm11-30h33v60h-33Zm42,68h-33v-5H64A1.5,1.5,0,0,0,65.5,82V28.5h6Zm11-38h-8V27A1.5,1.5,0,0,0,73,25.5H65.5v-5h17ZM40.5,55.77a1.5,1.5,0,0,0-3,0c0,3.57,3,6.54,7,7.15V65a1.5,1.5,0,0,0,3,0V62.92c4-.61,7-3.58,7-7.15s-3-6.54-7-7.15V40.13c2.3.51,4,2.15,4,4.11a1.5,1.5,0,0,0,3,0c0-3.57-3-6.54-7-7.15V35a1.5,1.5,0,0,0-3,0v2.08c-4,.61-7,3.58-7,7.15s3,6.54,7,7.14v8.5C42.2,59.36,40.5,57.72,40.5,55.77Zm11,0c0,2-1.69,3.6-4,4.11V51.66C49.81,52.17,51.5,53.82,51.5,55.77Zm-11-11.53c0-2,1.69-3.6,4-4.11v8.2C42.19,47.82,40.5,46.18,40.5,44.23Z", 
                0.5);
            case 'bar':
                return createSvgDMarker("M228.242 108.792l-48.176-12.909c-5.266-1.411-11.173-.242-15.416 3.05-3.227 2.502-5.236 6.047-5.673 9.917l-5.337 19.919c-1.573 3.644-1.586 7.801.006 11.644.524 1.265 1.209 2.463 2.025 3.573-5.1 10.618-10.914 23.713-17.017 38.282-.007.017-.014.033-.021.049-5.331 12.728-10.879 26.572-16.359 40.867-18.682 5.068-42.505 26.934-49.436 52.794L26.98 447.128c-4.413 16.473 6.424 33.74 24.157 38.491l46.947 12.58s.002 0 .002.001l46.945 12.579c3.054.818 6.156 1.224 9.229 1.224 5.351 0 10.613-1.23 15.372-3.648 7.852-3.99 13.38-10.678 15.565-18.832l6.308-23.543c.001-.003.003-.007.003-.01.001-.003.001-.006.002-.009l39.546-147.587c6.93-25.861-2.77-56.708-16.414-70.439 3.437-21.645 6.295-42.565 8.314-60.632.006-.052.013-.104.018-.157 1.01-9.053 1.807-17.38 2.362-24.725 4.329-2.121 7.763-6.016 9.107-11.027l5.832-21.763c2.425-9.063-2.973-18.411-12.033-20.839zm-62.364 375.552c-.697 2.599-2.581 4.794-5.307 6.179-3.085 1.567-6.766 1.9-10.365.936l-46.944-12.578c-.001 0-.001-.001-.002-.001L56.313 466.3c-6.961-1.865-11.547-8.275-10.015-13.997l3.723-13.895 119.58 32.042-3.723 13.894zm8.9-33.212L55.197 419.09 89.57 290.813l119.58 32.042-34.372 128.277zm38.498-147.877l-117.482-31.48c8.671-17.117 26.267-29.503 34.042-29.699 4.061-.102 7.658-2.652 9.099-6.451 5.197-13.704 10.479-27.05 15.591-39.444h47.256c-1.648 13.427-3.697 28.106-6.052 43.269l-2.445-.655c-5.337-1.43-10.818 1.736-12.247 7.071-1.429 5.335 1.736 10.818 7.071 12.247l11.479 3.076c6.515 5.207 14.69 23.797 13.688 42.066zm2.457-159.31c-.079.001-.157.01-.236.013-.074.002-.146.007-.219.012-.243.015-.484.038-.723.07-.083.011-.165.021-.247.034-.239.038-.475.086-.71.141-.068.016-.138.028-.206.046-.287.074-.57.159-.848.258-.09.032-.177.071-.267.105-.187.073-.373.148-.555.231-.113.052-.223.108-.333.164-.157.079-.311.161-.464.248-.107.061-.214.124-.319.189-.159.098-.313.203-.466.31-.088.062-.177.121-.263.186-.203.152-.399.312-.59.479-.03.026-.062.049-.091.076-.225.202-.439.415-.646.636-.043.046-.082.095-.124.142-.157.175-.309.355-.454.542-.059.076-.115.155-.172.233-.119.162-.233.328-.342.498-.061.095-.121.192-.179.289-.094.158-.182.321-.268.485-.058.111-.116.221-.17.334-.075.16-.143.324-.21.488-.05.121-.104.24-.148.363-.088.242-.165.49-.235.742-.083.299-.15.604-.206.913-.012.065-.03.13-.041.195-.007.042-.008.087-.015.131-.044.302-.079.604-.096.905-.364 6.547-.996 14.238-1.859 22.779h-41.044c5.17-11.881 9.983-22.289 14.13-30.493.131-.26.248-.53.357-.804.019-.049.045-.097.064-.146.02-.054.034-.111.054-.165.11-.304.206-.61.286-.919.065-.253.123-.507.167-.76.022-.124.034-.248.051-.372.025-.184.05-.367.064-.55.01-.117.014-.234.019-.351.009-.196.014-.391.011-.585-.002-.104-.004-.208-.009-.311-.009-.216-.027-.43-.05-.643-.009-.083-.017-.166-.028-.249-.034-.255-.079-.508-.133-.759-.009-.042-.015-.083-.024-.125-.069-.302-.151-.6-.247-.893-.006-.018-.013-.035-.019-.052-.087-.26-.186-.517-.294-.768-.04-.092-.084-.182-.126-.273-.081-.175-.165-.348-.257-.518-.057-.107-.117-.212-.178-.317-.088-.151-.181-.299-.277-.446-.069-.106-.138-.212-.211-.316-.11-.155-.228-.304-.347-.453-.066-.083-.128-.169-.198-.25-.188-.22-.387-.432-.594-.635-.063-.062-.13-.118-.195-.178-.162-.151-.328-.298-.501-.439-.074-.06-.151-.118-.227-.176-.181-.139-.367-.271-.559-.398-.069-.045-.137-.091-.208-.135-.063-.04-.124-.085-.188-.123l4.454-16.606 42.409 11.363-4.45 16.608z M164.797 231.165l-.234-.062c-5.335-1.422-10.816 1.749-12.239 7.085-1.424 5.337 1.748 10.816 7.085 12.239l.234.063c.863.23 1.73.34 2.583.34 4.419 0 8.463-2.953 9.656-7.426 1.423-5.337-1.749-10.816-7.085-12.239zM164.826 352.121c-5.036-8.723-13.167-14.961-22.896-17.568-3.198-.857-6.487-1.292-9.775-1.292-17.024 0-31.993 11.495-36.401 27.953-2.607 9.728-1.27 19.889 3.766 28.611 5.036 8.722 13.167 14.961 22.895 17.567 3.198.857 6.487 1.291 9.775 1.291 17.023 0 31.993-11.494 36.402-27.953 2.608-9.727 1.27-19.888-3.766-28.609zm-15.551 23.434c-2.071 7.73-9.096 13.128-17.084 13.128-1.541 0-3.088-.205-4.6-.61-4.568-1.224-8.386-4.154-10.75-8.249-2.365-4.096-2.993-8.866-1.768-13.435 2.07-7.73 9.095-13.129 17.083-13.129 1.541 0 3.088.205 4.6.61 4.568 1.224 8.386 4.154 10.751 8.25 2.363 4.096 2.991 8.867 1.768 13.435zM485.012 447.127l-45.859-171.149c-6.93-25.862-30.753-47.728-49.435-52.794-5.48-14.295-11.028-28.14-16.359-40.867-.007-.017-.014-.033-.021-.05-6.103-14.569-11.917-27.664-17.018-38.281.815-1.109 1.5-2.308 2.024-3.572 1.593-3.843 1.579-8.001.007-11.645l-5.338-19.919c-.437-3.869-2.445-7.414-5.672-9.916-4.243-3.293-10.15-4.462-15.417-3.05l-48.177 12.908c-4.382 1.175-8.048 3.992-10.322 7.932-2.275 3.941-2.882 8.525-1.707 12.907l5.83 21.764c1.344 5.011 4.778 8.906 9.108 11.026.554 7.341 1.35 15.663 2.359 24.711.006.064.015.128.022.192 2.018 18.061 4.875 38.972 8.311 60.61-13.644 13.73-23.343 44.579-16.414 70.439l45.859 171.148c2.186 8.155 7.714 14.843 15.566 18.832 4.759 2.419 10.021 3.648 15.372 3.648 3.072 0 6.175-.405 9.228-1.224l93.895-25.159c8.372-2.243 15.508-7.357 20.093-14.399 4.807-7.382 6.25-15.937 4.065-24.092zM297.769 144.084c-.149-.024-.3-.044-.451-.062-.172-.021-.344-.037-.518-.049-.118-.008-.236-.016-.356-.02-.063-.002-.124-.009-.186-.01l-4.449-16.608 42.409-11.36 4.451 16.606c-.064.039-.125.083-.188.123-.071.045-.141.091-.211.137-.19.126-.375.258-.555.395-.077.06-.155.118-.231.179-.17.139-.334.284-.494.433-.066.062-.136.121-.201.184-.205.202-.403.413-.59.631-.073.085-.139.176-.209.264-.115.144-.229.289-.336.438-.076.106-.146.215-.218.325-.094.143-.185.287-.271.435-.063.107-.124.216-.183.326-.09.167-.172.336-.252.507-.044.094-.09.187-.13.282-.105.246-.201.497-.287.751-.008.023-.018.046-.025.069-.096.292-.177.589-.246.889-.01.046-.017.092-.026.138-.053.246-.098.495-.132.746-.011.085-.018.171-.028.256-.023.211-.04.423-.05.637-.005.104-.008.209-.01.314-.002.193.003.386.012.581.005.119.01.236.018.355.015.183.04.365.065.548.017.124.029.249.052.372.047.266.105.531.175.796.072.278.162.554.26.828.026.073.046.15.073.223.012.031.028.061.04.091.116.296.243.585.385.864 4.147 8.203 8.958 18.607 14.127 30.485H307.96c-.863-8.542-1.496-16.233-1.859-22.779-.017-.303-.052-.608-.097-.913-.006-.041-.008-.082-.014-.122-.011-.066-.029-.132-.042-.198-.053-.294-.114-.586-.192-.871-.073-.268-.156-.53-.25-.787-.041-.114-.091-.224-.137-.337-.071-.175-.144-.35-.224-.519-.05-.105-.105-.208-.159-.312-.09-.173-.183-.344-.281-.511-.055-.092-.111-.182-.168-.272-.112-.175-.23-.346-.353-.513-.056-.076-.109-.153-.167-.227-.142-.183-.291-.359-.444-.531-.048-.053-.092-.108-.14-.16-.201-.215-.41-.422-.628-.618-.075-.068-.156-.129-.233-.195-.142-.12-.283-.239-.432-.35-.124-.095-.254-.182-.383-.271-.105-.071-.209-.142-.316-.209-.15-.095-.304-.186-.46-.273-.086-.048-.173-.093-.26-.139-.175-.091-.351-.18-.531-.261-.055-.024-.11-.045-.165-.069-.605-.258-1.238-.456-1.895-.59-.119-.025-.239-.051-.361-.072zm14.638 117.105l11.478-3.075c5.335-1.429 8.501-6.913 7.071-12.247-1.43-5.334-6.915-8.502-12.247-7.071l-2.445.655c-2.354-15.164-4.403-29.844-6.052-43.269h47.257c5.112 12.394 10.395 25.74 15.591 39.444 1.441 3.798 5.037 6.348 9.099 6.45 7.774.196 25.369 12.582 34.04 29.7l-117.482 31.48c-1.002-18.271 7.174-36.861 13.69-42.067zm24.807 189.944l-34.372-128.278 119.58-32.042 34.372 128.278-119.58 32.042zm126.974 9.174c-1.889 2.9-4.91 5.029-8.508 5.993l-93.895 25.159c-3.599.964-7.278.632-10.364-.936-2.726-1.385-4.61-3.579-5.307-6.179l-3.723-13.894 119.58-32.042 3.723 13.895c.696 2.6.162 5.443-1.506 8.004z M359.665 238.178c-1.429-5.334-6.909-8.503-12.246-7.073l-.233.063c-5.335 1.429-8.501 6.912-7.072 12.246 1.196 4.469 5.236 7.416 9.653 7.416.855 0 1.727-.111 2.593-.343l.233-.063c5.335-1.429 8.501-6.912 7.072-12.246zM416.238 361.214c-4.409-16.459-19.379-27.954-36.402-27.954-3.288 0-6.577.435-9.775 1.292-9.729 2.606-17.859 8.845-22.896 17.568-5.035 8.722-6.373 18.883-3.767 28.612 4.41 16.456 19.38 27.951 36.402 27.952h.002c3.287 0 6.576-.435 9.774-1.291 9.728-2.606 17.859-8.845 22.895-17.567 5.036-8.723 6.374-18.884 3.767-28.612zm-21.086 18.611c-2.365 4.096-6.183 7.025-10.75 8.249-1.511.405-3.059.61-4.599.61h-.001c-7.987 0-15.014-5.399-17.085-13.128-1.224-4.568-.596-9.339 1.768-13.435 2.365-4.096 6.183-7.025 10.751-8.25 1.511-.405 3.059-.61 4.6-.61 7.987 0 15.013 5.399 17.084 13.13 1.224 4.567.596 9.338-1.768 13.434zM255.996 0c-5.523 0-10 4.477-10 10v26.764c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10zM222.552 50.193l-13.596-23.178c-2.794-4.764-8.922-6.361-13.685-3.566-4.764 2.794-6.36 8.921-3.566 13.685l13.596 23.178c1.862 3.174 5.203 4.942 8.635 4.942 1.719 0 3.461-.443 5.05-1.376 4.764-2.795 6.36-8.922 3.566-13.685zM316.723 23.449c-4.765-2.795-10.892-1.197-13.686 3.566l-13.596 23.178c-2.794 4.764-1.198 10.891 3.566 13.685 1.59.933 3.331 1.376 5.05 1.376 3.432 0 6.773-1.768 8.636-4.942l13.596-23.178c2.794-4.764 1.197-10.891-3.566-13.685z",
                0.1);
            case 'night_club':
                return createSvgDMarker("M27.7 10.7c.3-.3.3-.7.2-1.1-.1-.4-.5-.6-.9-.6H12.4L9 4.7l4.5-2.9c.4-.2.5-.7.4-1.1-.1-.4-.5-.7-.9-.7H5c-.4 0-.8.2-.9.6l-3 7c-.2.4-.1.9.3 1.2.1.1.4.2.6.2.2 0 .4-.1.5-.2l4.8-3.1L9.8 9H5c-.4 0-.8.2-.9.6-.2.4-.1.8.2 1.1L15 22.4V30h-3c-.6 0-1 .4-1 1s.4 1 1 1h8c.6 0 1-.4 1-1s-.4-1-1-1h-3v-7.6l10.7-11.7zm-3 .3l-1.8 2h-7.4l-1.6-2h10.8zm-13.3 0l1.6 2H9.1l-1.8-2h4.1z",
                1);
            case 'lodging':
                return createSvgDMarker("M265.232 130.91H29.358V63.853c0-8.112-6.574-14.678-14.681-14.678C6.573 49.175 0 55.746 0 63.853v152.205c0 8.114 6.573 14.68 14.678 14.68 8.112 0 14.681-6.576 14.681-14.68v-7.349h221.199v7.349c0 8.114 6.57 14.68 14.675 14.68 8.115 0 14.681-6.576 14.681-14.68V145.59c.004-8.106-6.566-14.68-14.682-14.68zm-14.674 59.859c-5.713-2.939-10.38-2.498-16.402 1.341-10.41 6.642-24.436 6.642-34.85 0-6.82-4.356-11.908-4.356-18.733 0-10.42 6.642-24.445 6.642-34.854 0-6.83-4.356-11.911-4.356-18.738 0-10.415 6.642-24.44 6.642-34.855 0-6.822-4.356-11.908-4.356-18.735 0-10.41 6.642-24.438 6.642-34.853 0-3.339-2.128-6.261-3.163-9.184-3.199v-5.891c4.009.025 8.018 1.382 12.334 4.134 8.536 5.438 20.018 5.438 28.546 0 8.777-5.596 16.265-5.596 25.037 0 8.538 5.438 20.02 5.438 28.548 0 8.777-5.596 16.265-5.596 25.037 0 8.541 5.438 20.018 5.438 28.549 0 8.774-5.596 16.265-5.596 25.034 0 8.531 5.438 20.018 5.438 28.549 0 6.885-4.388 12.999-5.251 19.55-2.732v6.348h.02z M33.7 94.164v33.085h32.131c9.141-9.135 9.141-23.956 0-33.085-9.138-9.136-22.996-9.136-32.131 0z",
                0.1);
            default:
                return createSvgDMarker("m425.941 0h-393.176c-18.094 0-32.765 14.671-32.765 32.765v393.176c0 18.094 14.671 32.765 32.765 32.765h393.176c18.094 0 32.765-14.671 32.765-32.765v-393.176c0-18.094-14.671-32.765-32.765-32.765zm-196.588 294.882h-32.765v65.529h-65.529v-262.117h98.294c54.203 0 98.294 44.091 98.294 98.294s-44.091 98.294-98.294 98.294z", 0.01);
        }
    }  
    
    const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
        icon: svgMarker
    });

    function addMarker(location, destination_type) {
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: createDMarker(destination_type)
            });
        dmarkers.push(marker);
    }


    function setMapOnAll(map) {
        for (let i = 0; i < dmarkers.length; i++) {
            dmarkers[i].setMap(map);
        }
    }

    function clearMarkers() {
        setMapOnAll(null);
    }
    
    function deleteMarkers() {
        clearMarkers();
        dmarkers = [];
    }

    function handleDBLocationResult(result) {

        resultObject = {
            name: null,
            position: {
                lat: null,
                lng: null
            },
            rating: null,
            icon: null,
            isFinderProLocation: false
        }

        for (let key in result) {
            if (key == 'name') {
                resultObject['name'] = result.name
            }
            if (key == 'position') {
                resultObject['position']['lat'] = result['position']['lat'];
                resultObject['position']['lng'] = result['position']['lng'];
            }
            if (key == 'rating') {
                resultObject['rating'] = result['rating'];
            }
            if (key == 'icon') {
                resultObject['icon'] = result['icon'];
            }
            if (key == 'isFinderProLocation') {
                resultObject['isFinderProLocation'] = result['isFinderProLocation'];
            }
        }

        return resultObject;
    }

    function handleNearbySearchResult(result) {

        resultObject = {
            name: null,
            position: {
                lat: null,
                lng: null
            },
            rating: null,
            icon: null,
            isFinderProLocation: false
        }

        for (let key in result) {
            if (key == 'name') {
                resultObject['name'] = result.name
            }
            if (key == 'geometry') {
                resultObject['position']['lat'] = result.geometry.location.lat();
                resultObject['position']['lng'] = result.geometry.location.lng();
            }
            if (key == 'rating') {
                resultObject['rating'] = result.rating;
            }
            if (key == 'icon') {
                resultObject['icon'] = result.icon;
            }
        }

        return resultObject;
    }

    function displayNameAddressDirections(name, position, rating, icon, address, isFinderProLocation, destinationLatLng) {
        if (name != null) {
            infowindowContentParking.children["*"] = null;
            infowindowContentParking.children["destination-icon"].src = icon;
            infowindowContentParking.children["destination-name"].textContent = name;
            if (rating) {
                infowindowContentParking.children["destination-rating"].textContent = "Rating: " + rating + "\n";
            }

            if (address) {
                infowindowContentParking.children["destination-address"].textContent = address;
                infowindowContentParking.children["destination-address"] = document.createElement("br");
            }

            if (isFinderProLocation == true) {
                infowindowContentParking.children["destination-finderpro"].textContent = "From Finder PRO";
                infowindowContentParking.children["destination-address"] = document.createElement("br");
            }
            if (isFinderProLocation == false) {
                infowindowContentParking.children["destination-finderpro"].textContent = null;
            }
            infowindowParking.open(map, dmarkers[0]);
        }

        const directionsService = new google.maps.DirectionsService();         
        directionsDisplay.setMap(map); 
        directionsDisplay.setOptions( { suppressMarkers: true } );

        let request = {
            origin: origin_location,
            destination: destinationLatLng,
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, function(response, status){
            if (status == 'OK'){
                directionsDisplay.setDirections(response);
            }
        });

        const distanceMatrixService = new google.maps.DistanceMatrixService();
        distanceMatrixService.getDistanceMatrix(
        {
            origins: [origin_location],
            destinations: [destinationLatLng],
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
                departureTime: new Date(Date.now()),
                trafficModel: 'optimistic'
            }
        }, function(response, status) {
            if (status == 'OK') {
                infowindowContentTravelParams.children["travel-params"].textContent = "Duration: " + response.rows[0].elements[0].duration_in_traffic.text + ", Distance: " + response.rows[0].elements[0].distance.text;; 
                infowindowContentTravelParams.style["display"] = "block" 
            }
        });
    }

    function displayOnMapDestination(nearestResult, destination_type) {
        const {name, position, rating, icon, isFinderProLocation} = nearestResult;
        const destinationLatLng = position;
        let address = null;
        addMarker(destinationLatLng, destination_type);

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({location: destinationLatLng}, function(results, status) {
            if (status === "OK") {
                address = results[2].formatted_address;
            }
            displayNameAddressDirections(name, position, rating, icon, address, isFinderProLocation, destinationLatLng);
        });
    }

    function getDistanceFromLatLng(origin_location, otherLocationPosition) {
        const lat1 = origin_location.lat();
        const lng1 = origin_location.lng();
        const lat2 = otherLocationPosition.lat;
        const lng2 = otherLocationPosition.lng;
        const R = 6371000;
        const phi1 = lat1 * Math.PI/180;
        const phi2 = lat2 * Math.PI/180;
        const DPhi = (lat2-lat1) * Math.PI/180;
        const DLamb = (lng2-lng1) * Math.PI/180;

        const a = Math.sin(DPhi/2) * Math.sin(DPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(DLamb/2) * Math.sin(DLamb/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const d = R * c;
        return d;
    }

    function getNearest(origin_location, nearbySearchResult, LOriginTileLocations, NearestTileLocations, destination_type) {
        let nearestLocationName = null;
        let DBLocations = null;
        let minimalDistance = null;
        if (nearbySearchResult == google.maps.places.PlacesServiceStatus.ZERO_RESULTS && LOriginTileLocations == null && NearestTileLocations == null) {
            return;
        }

        else if (nearbySearchResult != google.maps.places.PlacesServiceStatus.ZERO_RESULTS && LOriginTileLocations == null && NearestTileLocations == null) {
            displayOnMapDestination(nearbySearchResult, destination_type);
            return;
        }

        else if (nearbySearchResult == google.maps.places.PlacesServiceStatus.ZERO_RESULTS && LOriginTileLocations != null && NearestTileLocations != null) {
            minimalDistance = 100000;
        }
            
        else {
            minimalDistance = getDistanceFromLatLng(origin_location, nearbySearchResult.position);
        }

        DBLocations = {
            ...LOriginTileLocations,
            ...NearestTileLocations
        }

        for (let key in DBLocations) {
            if (DBLocations[key].isVerified) {
                let currentDistance = getDistanceFromLatLng(origin_location, DBLocations[key].position)
                if (minimalDistance > currentDistance) {
                    minimalDistance = currentDistance;
                    nearestLocationName = key;
                }
            }

        }

        if (nearestLocationName == null) {
            displayOnMapDestination(nearbySearchResult, destination_type);
        } else {
            const nearestResult = handleDBLocationResult(DBLocations[nearestLocationName]);
            displayOnMapDestination(nearestResult, destination_type);
        }

        
    }

    async function getNearestWithAllDB(origin_location, nearbySearchResult, LOriginTileLocations, NearestTileLocationsListRef, destination_type) {
        return await NearestTileLocationsListRef.once("value")
            .then(function(snapshot) {
                getNearest(origin_location, nearbySearchResult, LOriginTileLocations, snapshot.val(), destination_type)
            })
    }

    async function getNearestFrom(origin_location, nearbySearchResult, LOriginTileLocationsListRef, NearestTileLocationsListRef, destination_type) {
        return await LOriginTileLocationsListRef.once("value")
            .then(function(snapshot) {
                getNearestWithAllDB(origin_location, nearbySearchResult, snapshot.val(), NearestTileLocationsListRef, destination_type);
            });
    }

    function getNearestTile(origin_location, neighboringTylesPositions) {
        let nearestPosition = null;
        let minimalDistance = getDistanceFromLatLng(origin_location,  neighboringTylesPositions[0]);
        for (let i = 1; i < neighboringTylesPositions.length; i++ ) {
            let currentDistance = getDistanceFromLatLng(origin_location, neighboringTylesPositions[i]);
            if (minimalDistance > currentDistance) {
                minimalDistance = currentDistance;
                nearestPosition = neighboringTylesPositions[i];
            }
        }

        if(nearestPosition == null) {
            nearestPosition = neighboringTylesPositions[0];
        }

        const nearestTilePositionGMLatLng = new google.maps.LatLng(nearestPosition.lat, nearestPosition.lng);
        return getTileIdFromLocation(nearestTilePositionGMLatLng, zoom_level_for_tiles);
    
    }

    function getTileCenterPosition(x, y) {
        n = 2.0 ** zoom_level_for_tiles;
        lng = (x+0.5) / n * 360.0 - 180.0
        lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y+0.5) / n)))
        lat = lat_rad * (180/Math.PI);
        return {lat, lng};
    }

    function getTilesCenterPositions(tiles) {
        const centerPositions = [];
        for (let key in tiles) {
            centerPositions.push(getTileCenterPosition(tiles[key].x, tiles[key].y));
        }
        return centerPositions;
    }

    function getNeighboringTyles(x, y) {
        const tiles = [];

        if (x+1 <= 1023) {
            tiles.push({
                x: x+1,
                y: y
            })
        }
        if (x+1 <= 1023 && y+1 <= 1023) {
            tiles.push({
                x: x+1,
                y: y+1
            })
        }
        if (y+1 <= 1023) {
            tiles.push({
                x: x,
                y: y+1
            })
        }
        if (x-1 >= 0 && y+1 <= 1023) {
            tiles.push({
                x: x-1,
                y: y+1
            })
        }
        if (x-1 >= 0) {
            tiles.push({
                x: x-1,
                y: y
            })
        }
        if (x-1 >= 0 && y-1 >= 0) {
            tiles.push({
                x: x-1,
                y: y-1
            })
        }
        if (y-1 >= 0) {
            tiles.push({
                x: x,
                y: y-1
            })
        }
        if (x+1 <= 1023 && y-1 >= 0) {
            tiles.push({
                x: x+1,
                y: y-1
            })
        }
        return tiles;
    }

    function prepareAsync(origin_location, destination_type) {
        
        deleteMarkers();
        infowindowParking.close();
        const request = {
            location: origin_location,
            type: [destination_type],
            rankBy: google.maps.places.RankBy.DISTANCE
        };

        const {x, y} = getTileIdObjectFromLocation(origin_location, zoom_level_for_tiles);

        const neighboringTyles = getNeighboringTyles(x, y);
        const neighboringTylesPositions = getTilesCenterPositions(neighboringTyles);
        
        const nearestOtherTileId = getNearestTile(origin_location, neighboringTylesPositions);



        const LOriginTileLocationsListRef = firebase.database().ref("Locations/" + getStringFromXY(x, y) + "/" + destination_type);
        const NearestTileLocationsListRef = firebase.database().ref("Locations/" + nearestOtherTileId + "/" + destination_type);

        const googleMapsService = new google.maps.places.PlacesService(map);
        googleMapsService.nearbySearch(request, function callback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                const nearbySearchResult = handleNearbySearchResult(results[0]);
                getNearestFrom(origin_location, nearbySearchResult, LOriginTileLocationsListRef, NearestTileLocationsListRef, destination_type);
            }
            else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                getNearestFrom(origin_location, google.maps.places.PlacesServiceStatus.ZERO_RESULTS, LOriginTileLocationsListRef, NearestTileLocationsListRef, destination_type);
            }
        });
    }

    autocomplete.addListener("place_changed", () => {
        deleteMarkers();
        infowindow.close();
        infowindowParking.close();
        marker.setVisible(false);
        place = autocomplete.getPlace();

        if (!place.geometry) {
            window.alert ("No details available for input: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(13); 
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        let address = "";

        if (place.address_components) {
            address = [
            (place.address_components[0] &&
                place.address_components[0].short_name) ||
                "",
            (place.address_components[1] &&
                place.address_components[1].short_name) ||
                "",
            (place.address_components[2] &&
                place.address_components[2].short_name) ||
                "",
            ].join(" ");
        }
        infowindowContent.children["place-icon"].src = place.icon;
        infowindowContent.children["origin-name"].textContent = place.name;
        infowindowContent.children["origin-address"].textContent = address;
        infowindow.open(map, marker);

        if (directionsDisplay != null) {
            directionsDisplay.setMap(null);
            directionsDisplay = null;
            directionsDisplay = new google.maps.DirectionsRenderer();
        }       

        const currentLocation = place.geometry.location;
        origin_location = new google.maps.LatLng(currentLocation.lat(), currentLocation.lng());
        let destination_type = document.getElementById("select-input").value;

        prepareAsync(origin_location, destination_type);
    });

    select.addEventListener("change", function() {
        deleteMarkers(); 
        infowindowParking.close();
        destination_type = select.value;

        if (directionsDisplay != null) {
            directionsDisplay.setMap(null);
            directionsDisplay = null;
            directionsDisplay = new google.maps.DirectionsRenderer();
        }    

        if (origin_location && destination_type) {
            prepareAsync(origin_location, destination_type); 
        }   
    });
}

