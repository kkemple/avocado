import React from "react";
import styled from "@emotion/native";
import { FontAwesome5 } from "@expo/vector-icons";

import Colors from "../constants/Colors";

const StatusBadgeBG = styled.View`
  background-color: ${Colors.tintColor};
  justify-content: center;
  align-items: center;
  flex-direction: row;
  border-radius: 16px;
  overflow: hidden;
  padding: 4px 8px 2px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const StatusBadge = styled.Text`
  color: ${Colors.noticeText};
  font-family: "overpass-black";
  font-size: 10px;
`;

export default ({ icon, text, style }) => (
  <StatusBadgeBG style={style}>
    <FontAwesome5
      name={icon}
      color={Colors.foreground}
      style={{ marginRight: 4 }}
    />
    <StatusBadge>{text}</StatusBadge>
  </StatusBadgeBG>
);
