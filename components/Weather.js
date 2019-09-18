import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import Colors from "../constants/Colors";

const ICON_MAP = {
  SUNNY: "sun",
  CLOUDY: "cloud",
  RAINY: "cloud-drizzle",
  SNOWY: "cloud-snow",
  WINDY: "wind"
};

export default props => (
  <View
    style={{
      paddingTop: 8,
      paddingBottom: 6
    }}
  >
    {!props.forecast.length > 0 && (
      <Text
        style={{
          marginBottom: 4,
          textAlign: "center",
          fontFamily: "overpass-black",
          color: Colors.text
        }}
      >
        Weather not available for this location
      </Text>
    )}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "stretch"
      }}
    >
      {props.forecast.map((day, index) => (
        <View
          key={`${day.icon}-${day.temp}-${index}`}
          style={{ justifyContent: "center", flex: 1, alignItems: "center" }}
        >
          <Feather
            size={20}
            name={ICON_MAP[day.icon]}
            color={Colors.tintColor}
          />
          <Text
            style={{ fontFamily: "overpass-black", color: Colors.tintColor }}
          >
            {day.temp}
          </Text>
        </View>
      ))}
    </View>
  </View>
);
