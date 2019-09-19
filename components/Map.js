import React, { useState, useRef, useEffect } from "react";
import { Share, TouchableOpacity, Text, View, Image } from "react-native";
import styled from "@emotion/native";
import { FontAwesome5 } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { Icon } from "react-native-elements";

import Colors from "../constants/Colors";

const StyledMapView = styled(MapView)`
  background-color: ${Colors.tintColor};
  width: 100%;
`;

const MapViewContainer = styled.View`
  position: relative;
`;

const CurrentMapLocation = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
  background-color: ${Colors.foreground};
  border-radius: 4px;
  padding-bottom: 4px;
  padding-top: 6px;
  width: 100px;
  margin: 8px 8px 8px 0;
`;

const CurrentMapLocationOption = styled.View`
  justify-content: center;
  align-items: center;
`;

export default ({ mapHeight = 200, showControls = true, venue, hotel }) => {
  const mapView = useRef();
  const [showBuildings, setShowBuildings] = useState(true);
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

      mapView.current.animateCamera(camera, { duration: 400 });
    };

    updateCamera();
  }, [currentLocation, setCurrentLocation]);

  useEffect(() => {
    setVenueIsActive(currentLocation.address === venue.address);
  }, [
    currentLocation,
    setCurrentLocation,
    venueIsActive,
    setVenueIsActive,
    venue
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
        />
      </StyledMapView>
      {showControls && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            top: 0,
            right: 0,
            bottom: 0,
            justifyContent: "flex-end",
            alignItems: "flex-end"
          }}
        >
          <View>
            <TouchableOpacity
              onPress={() => {
                Share.share({
                  message: currentLocation.address
                });
              }}
            >
              <Icon
                size={20}
                name="content-copy"
                raised
                color={Colors.tintColor}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                setShowBuildings(!showBuildings);
              }}
            >
              <Icon
                raised
                name="building-o"
                type="font-awesome"
                color={showBuildings ? Colors.tintColor : Colors.inactive}
                size={20}
              />
            </TouchableOpacity>
          </View>
          {venue && hotel && (
            <CurrentMapLocation>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setCurrentLocation({ ...venue })}
              >
                <CurrentMapLocationOption style={{ marginBottom: -4 }}>
                  <Icon
                    name="event"
                    color={venueIsActive ? Colors.tintColor : Colors.inactive}
                    size={20}
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
                onPress={() => setCurrentLocation({ ...hotel })}
              >
                <CurrentMapLocationOption style={{ marginBottom: -4 }}>
                  <FontAwesome5
                    name="bed"
                    color={!venueIsActive ? Colors.tintColor : Colors.inactive}
                    size={18}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: !venueIsActive
                        ? Colors.tintColor
                        : Colors.inactive,
                      fontFamily: "overpass-black"
                    }}
                  >
                    Hotel
                  </Text>
                </CurrentMapLocationOption>
              </TouchableOpacity>
            </CurrentMapLocation>
          )}
        </View>
      )}
    </MapViewContainer>
  );
};
