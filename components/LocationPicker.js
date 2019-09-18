import React from "react";
import { View, Text } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import Colors from "../constants/Colors";

export default ({ autoFocus = false, required, onLocationSelected, value }) => {
  return (
    <View>
      <GooglePlacesAutocomplete
        placeholder=""
        text={value}
        minLength={2}
        autoFocus={autoFocus}
        returnKeyType={"search"}
        listViewDisplayed={false}
        fetchDetails={true}
        renderDescription={row => row.description}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{ rankby: "distance" }}
        filterReverseGeocodingByTypes={["locality"]}
        debounce={200}
        enablePoweredByContainer={false}
        onPress={(_, details) => {
          const location = {
            address: details.formatted_address,
            googleMapsUrl: details.url,
            location: details.geometry.location,
            icon: details.icon,
            name: details.name
          };

          onLocationSelected(location);
        }}
        query={{
          key: "AIzaSyDOysoULo6R3hZIz_DqxZWHTd4CA3Pm6bY",
          language: "en",
          types: ["address", "establishment"]
        }}
        styles={{
          container: {
            flex: 0,
            marginBottom: required ? 0 : 28,
            position: "relative"
          },
          textInputContainer: {
            borderBottomColor: Colors.tintColor,
            borderBottomWidth: 1,
            backgroundColor: "transparent",
            paddingTop: 10,
            paddingBottom: 24,
            paddingVertical: 8,
            borderRadius: 4,
            height: 44,
            borderTopWidth: 0
          },
          row: {
            paddingLeft: 0,
            paddingRight: 0
          },
          textInput: {
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0,
            color: Colors.tintColor,
            fontFamily: "overpass-bold",
            backgroundColor: "transparent",
            fontSize: 24
          },
          description: {
            fontFamily: "overpass-regular",
            color: Colors.tintColor,
            marginBottom: -10
          },
          listView: {
            position: "absolute",
            flex: 0,
            backgroundColor: Colors.foreground,
            top: 55
          }
        }}
      />
      {required && (
        <Text
          style={{
            fontSize: 10,
            margin: 5,
            marginBottom: 10,
            color: Colors.tintColor
          }}
        >
          Required
        </Text>
      )}
    </View>
  );
};
