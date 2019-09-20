import React from "react";
import { Linking, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import parse from "date-fns/parse";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";
import styled from "@emotion/native";

import Colors from "../constants/Colors";

const twitterShareURL = "https://mobile.twitter.com/intent/tweet/?text=";

const option1 = (name, date, website) =>
  `Join me at ${name} in ${formatDistance(new Date(), date)}!${website}`;
const option2 = (name, date, website) =>
  `Who will I see at ${name} on ${format(date, "MMMM do")}?${website}`;
const option3 = (name, date, website) =>
  `Can't wait for ${name} in ${formatDistance(new Date(), date)}!${website}`;
const option4 = (name, date, website) =>
  `It's almost time for ${name}! Only ${formatDistance(
    new Date(),
    date
  )} to go!${website}`;
const option5 = (name, date, website) =>
  `I'll be at ${name} in ${formatDistance(
    new Date(),
    date
  )}! Hope to see you there!${website}`;
const option6 = (name, date, website) =>
  `I'll be at ${name} in ${formatDistance(
    new Date(),
    date
  )}! Hope to see you there!${website}`;

const templates = [option1, option2, option3, option4, option5, option6];

const buildTweet = (name, date, website) => {
  const template = templates[Math.floor(Math.random() * templates.length)];
  return encodeURIComponent(template(name, date, website));
};

const shareTweet = event => {
  const date = parse(event.dates.start, "yyyy-MM-dd", new Date());
  const name = event.twitter ? event.twitter : event.title;
  const website = event.website ? "\n\n" + event.website : "";
  const tweet = buildTweet(name, date, website);

  return twitterShareURL + tweet;
};

const ActionBar = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: center;
  padding-vertical: 12px;
`;

const Action = styled.View`
  width: 25%;
  align-items: center;
  justify-content: center;
`;

export default ({ event, style }) => {
  return (
    <ActionBar style={style}>
      <Action>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            if (!event.twitter) return;
            Linking.openURL(`https://twitter.com/${event.twitter}`);
          }}
        >
          <FontAwesome5
            name="at"
            color={
              event.twitter ? Colors.primary["500"] : Colors.primary["200"]
            }
            size={20}
          />
        </TouchableOpacity>
      </Action>
      <Action>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            if (!event.website) return;
            Linking.openURL(event.website);
          }}
        >
          <FontAwesome5
            name="globe-americas"
            color={
              event.website ? Colors.primary["500"] : Colors.primary["200"]
            }
            size={20}
          />
        </TouchableOpacity>
      </Action>
      <Action>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            if (!event.tickets) return;
            Linking.openURL(event.tickets);
          }}
        >
          <FontAwesome5
            name="ticket-alt"
            color={
              event.tickets ? Colors.primary["500"] : Colors.primary["200"]
            }
            size={20}
          />
        </TouchableOpacity>
      </Action>
      <Action>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            Linking.openURL(shareTweet(event));
          }}
        >
          <FontAwesome5
            name="twitter"
            size={20}
            color={Colors.primary["500"]}
          />
        </TouchableOpacity>
      </Action>
    </ActionBar>
  );
};
