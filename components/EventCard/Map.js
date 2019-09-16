import React, { useState, useRef, useEffect } from "react";
import { Share, TouchableOpacity, Text, View } from "react-native";
import styled from "@emotion/native";
import Colors from "../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { Icon } from "react-native-elements";

const StyledMapView = styled(MapView)`
  background-color: ${Colors.tintColor};
  height: 150px;
  width: 100%;
`;

const MapViewContainer = styled.View`
  position: relative;
`;

const CurrentMapLocation = styled.View`
  position: absolute;
  bottom: 8px;
  right: 16px;
  justify-content: center;
  align-items: stretch;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
  background-color: ${Colors.foreground};
  border-radius: 4px;
  padding: 8px;
  flex: 0;
`;

const CurrentMapLocationOption = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
`;

export default props => {
  const mapView = useRef();
  const [currentLocation, setCurrentLocation] = useState(props.venue);
  const venueIsActive = currentLocation.address === props.venue.address;

  useEffect(() => {
    const updateCamera = async () => {
      const camera = await mapView.current.getCamera();
      camera.center.latitude = currentLocation.location.lat;
      camera.center.longitude = currentLocation.location.lng;
      camera.pitch = 45;
      camera.heading = 0;
      camera.altitude = 400;
      camera.zoom = 4;

      mapView.current.animateCamera(camera, { duration: 300 });
    };

    updateCamera();
  }, [currentLocation, setCurrentLocation]);

  return (
    <MapViewContainer>
      <StyledMapView
        zoomControlEnabled={false}
        showsCompass={false}
        showsScale={false}
        ref={mapView}
        initialCamera={{
          center: {
            latitude: currentLocation.location.lat,
            longitude: currentLocation.location.lng
          },
          pitch: 45,
          heading: 0,
          altitude: 400,
          zoom: 4
        }}
      >
        <Marker
          coordinate={{
            latitude: currentLocation.location.lat,
            longitude: currentLocation.location.lng
          }}
          title={currentLocation.name}
          description={currentLocation.address}
        />
      </StyledMapView>
      <View
        style={{
          position: "absolute",
          right: 8,
          top: 0
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Share.share({
              message: currentLocation.address
            });
          }}
        >
          <Icon size={20} name="content-copy" raised color={Colors.tintColor} />
        </TouchableOpacity>
      </View>
      {props.venue && props.hotel && (
        <CurrentMapLocation>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setCurrentLocation({ ...props.venue })}
          >
            <CurrentMapLocationOption>
              <FontAwesome5
                name="building"
                color={venueIsActive ? Colors.tintColor : Colors.inactive}
                size={16}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: venueIsActive ? Colors.tintColor : Colors.inactive,
                  fontFamily: "overpass-black"
                }}
              >
                Event
              </Text>
            </CurrentMapLocationOption>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setCurrentLocation({ ...props.hotel })}
          >
            <CurrentMapLocationOption style={{ marginBottom: -4 }}>
              <FontAwesome5
                name="bed"
                color={!venueIsActive ? Colors.tintColor : Colors.inactive}
                size={16}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: !venueIsActive ? Colors.tintColor : Colors.inactive,
                  fontFamily: "overpass-black"
                }}
              >
                Hotel
              </Text>
            </CurrentMapLocationOption>
          </TouchableOpacity>
        </CurrentMapLocation>
      )}
    </MapViewContainer>
  );
};
