import React from "react";
import { SafeAreaView, TouchableOpacity } from "react-native";
import { ListItem } from "react-native-elements";

import Colors from "../constants/Colors";

export default function ToolsScreen() {
  return (
    <SafeAreaView>
      <TouchableOpacity>
        <ListItem
          title="Translate"
          titleStyle={{
            color: Colors.text,
            fontFamily: "overpass-regular",
            marginTop: 6
          }}
          leftIcon={{
            name: "translate",
            color: Colors.tintColor
          }}
          bottomDivider
          chevron={{ color: Colors.tintColor }}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <ListItem
          title="Settings"
          titleStyle={{
            color: Colors.text,
            fontFamily: "overpass-regular",
            marginTop: 6
          }}
          leftIcon={{ name: "settings", color: Colors.tintColor }}
          bottomDivider
          chevron={{ color: Colors.tintColor }}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

ToolsScreen.navigationOptions = {
  title: "Tools",
  headerTintColor: Colors.tintColor,
  headerTitleStyle: {
    fontFamily: "permanent-marker",
    fontSize: 24
  }
};
