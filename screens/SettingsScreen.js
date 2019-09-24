import React from "react";
import { Linking, TouchableOpacity, Text, View } from "react-native";
import { Button } from "react-native-elements";
import { SafeAreaView } from "react-navigation";
import { Auth } from "aws-amplify";
import { FontAwesome5 } from "@expo/vector-icons";
import styled from "@emotion/native";

import Colors from "../constants/Colors";

const Attribution = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const AttributionText = styled.Text`
  font-family: "montserrat-bold";
  color: ${Colors.text};
`;

const AttributionLink = styled.Text`
  font-family: "montserrat-bold";
  color: ${Colors.primary["500"]};
`;

export default function Settings() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <Attribution>
          <AttributionText>Built with </AttributionText>
          <View>
            <FontAwesome5
              style={{ marginBottom: -3 }}
              size={20}
              name="aws"
              color={Colors.text}
            />
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://aws-amplify.github.io")}
          >
            <AttributionLink> Amplify</AttributionLink>
          </TouchableOpacity>
        </Attribution>
        <Attribution>
          <AttributionText>Built on React Native & </AttributionText>
          <TouchableOpacity onPress={() => Linking.openURL("https://expo.io")}>
            <AttributionLink>Expo</AttributionLink>
          </TouchableOpacity>
        </Attribution>
        <Attribution>
          <AttributionText>Weather powered by </AttributionText>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://darksky.net/poweredby/")}
          >
            <AttributionLink>Dark Sky</AttributionLink>
          </TouchableOpacity>
        </Attribution>
        <Attribution>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://github.com/kkemple/avocado/issues")
            }
          >
            <AttributionLink>Bugs or Feedback</AttributionLink>
          </TouchableOpacity>
        </Attribution>
        <Button
          onPress={() => {
            Auth.signOut();
          }}
          containerStyle={{ marginTop: "auto" }}
          buttonStyle={{
            backgroundColor: Colors.primary["500"]
          }}
          titleStyle={{
            fontFamily: "montserrat-extra-bold"
          }}
          title="Log Out"
        />
      </View>
    </SafeAreaView>
  );
}

Settings.navigationOptions = {
  header: null
};
