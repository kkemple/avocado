import React from "react";
import { Linking, View, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Icon } from "react-native-elements";
import parse from "date-fns/parse";
import formatDistance from "date-fns/formatDistance";

import Colors from "../constants/Colors";

const twitterShareURL = "https://mobile.twitter.com/intent/tweet/?text=";

const buildTweet = event => {
  const date = parse(event.dates.start, "yyyy-MM-dd", new Date());
  const encodedTweet = encodeURIComponent(
    `Join me at ${
      event.twitter ? event.twitter : event.title
    } in ${formatDistance(new Date(), date)}!${
      event.website ? "\n\n" + event.website : ""
    }`
  );

  return twitterShareURL + encodedTweet;
};

export default props => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "stretch",
      paddingVertical: props.showEditButton ? 4 : 12
    }}
  >
    {props.showEditButton && (
      <TouchableOpacity
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 50,
          flex: 0
        }}
        onPress={props.onPress}
      >
        <Icon
          size={16}
          type="feather"
          name="edit"
          raised
          color={Colors.tintColor}
        />
      </TouchableOpacity>
    )}
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <TouchableOpacity
        onPress={() => {
          if (!props.event.twitter) return;
          Linking.openURL(`https://twitter.com/${props.event.twitter}`);
        }}
      >
        <FontAwesome5
          name="twitter"
          color={props.event.twitter ? Colors.tintColor : Colors.inactive}
          size={20}
        />
      </TouchableOpacity>
    </View>
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <TouchableOpacity
        onPress={() => {
          if (!props.event.website) return;
          Linking.openURL(props.event.website);
        }}
      >
        <FontAwesome5
          name="globe-americas"
          color={props.event.website ? Colors.tintColor : Colors.inactive}
          size={20}
        />
      </TouchableOpacity>
    </View>
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <TouchableOpacity
        onPress={() => {
          if (!props.event.tickets) return;
          Linking.openURL(props.event.tickets);
        }}
      >
        <FontAwesome5
          name="ticket-alt"
          color={props.event.tickets ? Colors.tintColor : Colors.inactive}
          size={20}
        />
      </TouchableOpacity>
    </View>
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(buildTweet(props.event));
        }}
      >
        <Ionicons name="md-share-alt" size={24} color={Colors.tintColor} />
      </TouchableOpacity>
    </View>
  </View>
);
