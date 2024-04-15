var mapContainer = document.getElementById('map');
var mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 초기 중심 좌표 (서울 시청)
    level: 3 // 지도의 확대 레벨
};

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 현재 열려있는 인포윈도우 객체를 저장할 변수
var openInfowindow = null;

// 사용자의 현재 위치 가져오기
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var userLatLng = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);

        // 주소 변환 객체 생성
        var geocoder = new kakao.maps.services.Geocoder();

        // 지도 중심 좌표를 사용자의 현재 위치로 변경
        map.setCenter(userLatLng);

        var gps_content = '<div><img class="pulse" draggable="false" unselectable="on" src="https://ssl.pstatic.net/static/maps/m/pin_rd.png" alt=""></div>';
        var currentOverlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude),
            content: gps_content,
        })
        currentOverlay.setMap(map)

        // 인포윈도우 생성
        var infowindow = new kakao.maps.InfoWindow({
            content: '현재위치'
        });

    });
}

// JSON 파일 불러오기 및 마커 표시
fetch('./csvjson.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        data.forEach(function(item) {
            var geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(item.주소, function(result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    var MarkerImage;
                    if (item.평점 >= 4) {
                        markerImage = new kakao.maps.MarkerImage('./img/blue.png', new kakao.maps.Size(30, 30));
                    } else if (item.평점 >= 3) {
                        markerImage = new kakao.maps.MarkerImage('./img/green.png', new kakao.maps.Size(30, 30));
                    } else if (item.평점 >= 2) {
                        markerImage = new kakao.maps.MarkerImage('./img/yellow.png', new kakao.maps.Size(30, 30));
                    } else if (item.평점 >= 1) {
                        markerImage = new kakao.maps.MarkerImage('./img/red.png', new kakao.maps.Size(30, 30));
                    } else {
                        markerImage = new kakao.maps.MarkerImage('./img/gray.png', new kakao.maps.Size(30, 30));
                    }

                    var marker = new kakao.maps.Marker({
                        map: map,
                        position: new kakao.maps.LatLng(result[0].y, result[0].x),
                        image: markerImage
                    });

                    // 인포윈도우 생성
                    var infowindow = new kakao.maps.InfoWindow({
                        content: '<div style="width:300px;height:auto;padding:10px;"><strong>' + item.동물병원명 + '</strong><br>주소: ' +
                            item.주소 + '<br>영업시간: ' + item.영업시간 + '<br>전화번호: ' + item.전화번호 + '<br>평점: ' + item.평점 + '</div>'
                    });

                    // 마커 클릭 이벤트 처리
                    kakao.maps.event.addListener(marker, 'click', function() {
                        // 마커를 클릭한 위치의 정보를 표시
                        document.querySelector('.info_name').innerText = item.동물병원명;
                        document.querySelector('#info_address').innerText = item.주소;
                        document.querySelector('#info_time').innerText = item.영업시간;
                        document.querySelector('#info_phone').innerText = item.전화번호;
                        document.querySelector('#info_star').innerText = item.평점;
                        document.getElementById('btn_dirc').style.display = 'block';

                        //길찾기 버튼 클릭 이벤트
                        var btnDirc = document.getElementById('btn_dirc');
                        btnDirc.addEventListener('click', function() {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(function(position) {
                                    var userLatLng = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
                                    var geocoder = new kakao.maps.services.Geocoder();
                                    geocoder.coord2Address(userLatLng.getLng(), userLatLng.getLat(), function(result, status) {
                                        if (status === kakao.maps.services.Status.OK) {
                                            var detailAddr = result[0].address.address_name;
                                            //var detailAddr = !!result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
                                            var url = 'https://map.kakao.com/?sName=' + detailAddr + '&eName=' + item.주소;
                                            var iframe = document.querySelector('.info_imgbox');
                                            iframe.src = url;
                                        }
                                    });
                                    
                                });
                            }
                            
                        });

                        // 현재 열려있는 인포윈도우가 있다면 닫기
                        if (openInfowindow) {
                            openInfowindow.close();
                        }
                        infowindow.open(map, marker);
                        openInfowindow = infowindow;
                    });

                    kakao.maps.event.addListener(infowindow, 'click', function() {
                        infowindow.close();
                        openInfowindow = null;
                    });
                }
            });
        });
    });

// 버튼 클릭 이벤트 처리
var btnGps = document.getElementById('btn-gps');
btnGps.addEventListener('click', function() {
    // 사용자의 현재 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLatLng = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // 지도 중심 좌표를 사용자의 현재 위치로 변경
            map.setCenter(userLatLng);
            map.setLevel(3);
        });
    }
});

//교통정보 버튼
    var trafficBtn = document.getElementById('btn-traffic-on');

    var traffic_button = (function() {
    var isShow = true;

    return function() {
        if(isShow){
            console.log('on')
            map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
            isShow = !isShow
        }else if(!isShow){
            console.log('off')
            map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
            isShow = !isShow
        }
    };
    })();
    trafficBtn.onclick = traffic_button;

// 지도 클릭 시 열려있는 인포윈도우 닫기
    kakao.maps.event.addListener(map, 'click', function() {
        if (openInfowindow) {
            openInfowindow.close();
            openInfowindow = null;
        }
    });