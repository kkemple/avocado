import React, { useState, useRef, useEffect } from "react";
import { Share, View, Image } from "react-native";
import styled from "@emotion/native";
import { FontAwesome5 } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { Icon } from "react-native-elements";

import Colors from "../constants/Colors";

const StyledMapView = styled(MapView)`
  background-color: ${Colors.primary["500"]};
  width: 100%;
`;

const MapViewContainer = styled.View`
  position: relative;
`;

const CurrentMapLocation = styled.View`
  align-items: center;
  background-color: ${Colors.grey["0"]};
  border-radius: 4px;
  box-shadow: 1px 1px 1px ${Colors.shadow};
  flex-direction: row;
  justify-content: center;
  margin: 8px;
  padding-vertical: 8px;
  width: 100px;
  elevation: 2;
`;

const CurrentMapLocationOption = styled.View`
  align-items: center;
  justify-content: center;
`;

const MapControls = styled.View`
  align-items: flex-end;
  bottom: 0;
  flex: 1;
  justify-content: flex-end;
  position: absolute;
  right: 0;
  top: 0;
`;

const Control = styled.TouchableOpacity`
  align-items: center;
  background-color: ${Colors.grey["0"]};
  border-radius: 22px;
  box-shadow: 1px 1px 1px ${Colors.shadow};
  height: 44px;
  justify-content: center;
  margin: 8px;
  width: 44px;
  elevation: 2;
`;

const CurrentLocationButton = styled.TouchableOpacity`
  flex: 1;
`;

const CurrentLocationButtonText = styled.Text`
  color: ${props =>
    props.active ? Colors.primary["500"] : Colors.primary["200"]};
  font-family: "montserrat-extra-bold";
  font-size: 10px;
`;

export default ({ mapHeight = 200, showControls = true, venue, hotel }) => {
  const mapView = useRef();
  const [showBuildings, setShowBuildings] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(venue);
  const [venueIsActive, setVenueIsActive] = useState(true);

  useEffect(() => {
    const updateCamera = async () => {
      const camera = await mapView.current.getCamera();
      camera.center.latitude = currentLocation.location.lat;
      camera.center.longitude = currentLocation.location.lng;
      camera.pitch = 45;
      camera.heading = 0;
      camera.altitude = 350;
      camera.zoom = 17;

      mapView.current.animateCamera(camera, { duration: 500 });
    };

    updateCamera();
  }, [currentLocation, setCurrentLocation]);

  useEffect(() => {
    setVenueIsActive(currentLocation.address === venue.address);
  }, [
    currentLocation,
    setCurrentLocation,
    setVenueIsActive,
    venue,
    venueIsActive
  ]);

  return (
    <MapViewContainer>
      <StyledMapView
        style={{ height: mapHeight }}
        zoomControlEnabled={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={showBuildings}
        ref={mapView}
        initialCamera={{
          center: {
            latitude: currentLocation.location.lat,
            longitude: currentLocation.location.lng
          },
          pitch: 45,
          heading: 0,
          altitude: 350,
          zoom: 17
        }}
      >
        <Marker
          coordinate={{
            latitude: currentLocation.location.lat,
            longitude: currentLocation.location.lng
          }}
          title={currentLocation.name}
          description={currentLocation.address}
        >
          <Image
            style={{ width: 40, height: 40 }}
            source={require("../assets/images/map-marker.png")}
          />
        </Marker>
      </StyledMapView>
      {showControls && (
        <MapControls>
          <View>
            <Control
              activeOpacity={0.6}
              onPress={() => Share.share({ message: currentLocation.address })}
            >
              <Icon
                size={20}
                name="content-copy"
                color={Colors.primary["500"]}
              />
            </Control>
          </View>
          <View>
            <Control
              activeOpacity={0.6}
              onPress={() => setShowBuildings(!showBuildings)}
            >
              <Icon
                name="building-o"
                type="font-awesome"
                color={
                  showBuildings ? Colors.primary["500"] : Colors.primary["200"]
                }
                size={20}
              />
            </Control>
          </View>
          {venue && hotel && (
            <CurrentMapLocation>
              <CurrentLocationButton
                activeOpacity={0.6}
                onPress={() => setCurrentLocation({ ...venue })}
              >
                <CurrentMapLocationOption style={{ marginBottom: -4 }}>
                  <Icon
                    name="event"
                    color={
                      venueIsActive
                        ? Colors.primary["500"]
                        : Colors.primary["200"]
                    }
                    size={20}
                  />
                  <CurrentLocationButtonText active={venueIsActive}>
                    Event
                  </CurrentLocationButtonText>
                </CurrentMapLocationOption>
              </CurrentLocationButton>
              <CurrentLocationButton
                activeOpacity={0.6}
                onPress={() => setCurrentLocation({ ...hotel })}
              >
                <CurrentMapLocationOption style={{ marginBottom: -4 }}>
                  <FontAwesome5
                    name="bed"
                    color={
                      !venueIsActive
                        ? Colors.primary["500"]
                        : Colors.primary["200"]
                    }
                    size={18}
                  />
                  <CurrentLocationButtonText active={!venueIsActive}>
                    Hotel
                  </CurrentLocationButtonText>
                </CurrentMapLocationOption>
              </CurrentLocationButton>
            </CurrentMapLocation>
          )}
        </MapControls>
      )}
    </MapViewContainer>
  );
};
