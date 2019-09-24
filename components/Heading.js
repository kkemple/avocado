import React from "react";
import styled from "@emotion/native";

const Heading = styled.Text`
  font-size: 20px;
  line-height: 20px;
  font-family: "montserrat-black";
`;

export default ({ children, style }) => (
  <Heading style={style}>{children}</Heading>
);
