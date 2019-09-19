import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Button } from "react-native-elements";
import { SafeAreaView } from "react-navigation";
import { Auth } from "aws-amplify";

import Colors from "../constants/Colors";

// const COLORS = [
//   "#a29bfe",
//   "#ff7675",
//   "#786fa6",
//   "#f8a5c2",
//   "#ea8685",
//   "#c44569",
//   "#0be881",
//   "#05c46b",
//   "#ff5e57",
//   "#f53b57",
//   "#30336b",
//   "#7ed6df",
//   "#e056fd",
//   "#eb3b5a"
// ];

export default function Settings() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <Button
          onPress={() => {
            Auth.signOut();
          }}
          containerStyle={{ marginTop: "auto" }}
          buttonStyle={{
            marginTop: 24,
            backgroundColor: Colors.tintColor
          }}
          titleStyle={{
            fontFamily: "overpass-black"
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
