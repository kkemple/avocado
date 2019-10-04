import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  Modal,
  Text,
  TouchableOpacity
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import styled from "@emotion/native";

import Colors from "../constants/Colors";

const RequiredText = styled.Text`
  font-size: 10;
  margin: 5px;
  margin-bottom: 10px;
  color: ${Colors.primary["500"]};
`;

export default ({ required, onLocationSelected, value }) => {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <View>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text
          style={{
            fontSize: 20,
            color: Colors.primary["500"],
            fontFamily: "montserrat-bold",
            paddingVertical: 8,
            borderBottomColor: Colors.primary["500"],
            borderBottomWidth: 1
          }}
        >
          {value ? value : "Choose Location"}
        </Text>
      </TouchableOpacity>
      {required && <RequiredText>Required</RequiredText>}
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              padding: 24
            }}
          >
            <GooglePlacesAutocomplete
              placeholder="Search for a location"
              text={value}
              minLength={2}
              autoFocus={showPicker}
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
                setShowPicker(false);
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
                  borderBottomColor: Colors.primary["500"],
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
                  color: Colors.primary["500"],
                  fontFamily: "montserrat-bold",
                  backgroundColor: "transparent",
                  fontSize: 24
                },
                description: {
                  fontFamily: "montserrat-regular",
                  color: Colors.primary["500"],
                  marginBottom: -10
                },
                listView: {
                  position: "absolute",
                  flex: 0,
                  backgroundColor: Colors.grey["0"],
                  top: 55
                }
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
