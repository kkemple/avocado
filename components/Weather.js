import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import styled from "@emotion/native";

import Colors from "../constants/Colors";

const ICON_MAP = {
  SUNNY: "sun",
  CLOUDY: "cloud",
  RAINY: "cloud-drizzle",
  SNOWY: "cloud-snow",
  WINDY: "wind"
};

const Weather = styled.View`
  padding-bottom: 6px;
  padding-top: 8px;
`;

const Forecast = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: center;
`;

const Day = styled.View`
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const Temp = styled.Text`
  font-family: "montserrat-bold";
  color: ${Colors.primary["700"]};
`;

export default props => {
  return (
    <Weather>
      <Forecast>
        {props.forecast.map((day, index) => (
          <Day key={`${day.icon}-${day.temp}-${index}`}>
            <Feather
              size={20}
              name={ICON_MAP[day.icon]}
              color={Colors.primary["700"]}
            />
            <Temp>{day.temp}</Temp>
          </Day>
        ))}
      </Forecast>
    </Weather>
  );
};
