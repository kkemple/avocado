import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import styled from "@emotion/native";
import parse from "date-fns/parse";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";

import Colors from "../constants/Colors";
import ActionBar from "./ActionBar";
import Contacts from "./Contacts";
import Map from "./Map";
import Weather from "./Weather";
import Tasks from "./Tasks";
import useEventConnection from "../hooks/event-connection";

const EventCard = styled.View`
  background-color: ${Colors.foreground};
  margin: 0 24px 24px;
  flex: 1;
  border-radius: 4px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
`;

const EventTitle = styled.Text`
  color: ${Colors.text};
  font-size: 24px;
  font-family: "permanent-marker";
`;

const EventDates = styled.Text`
  color: ${Colors.text};
  font-family: "overpass-bold";
`;

const Summary = styled.TouchableOpacity`
  padding: 8px 16px;
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
  margin-bottom: 16;
`;

const getDisplayDates = (startDate, endDate) => {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  const end = parse(endDate, "yyyy-MM-dd", new Date());

  if (startDate === endDate) {
    return format(start, "MMM do");
  }

  return `${format(start, "MMM do")} / ${format(end, "MMM do")}`;
};

const getTimeToEvent = startDate => {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  return formatDistance(new Date(), start);
};

export default props => {
  const [event, setEvent] = useState({ ...props.event });
  const [connectedEvent] = useEventConnection(props.event.id);

  const displayDates = getDisplayDates(event.dates.start, event.dates.end);
  const displayTimeToEvent = getTimeToEvent(event.dates.start);

  useEffect(() => {
    if (connectedEvent) {
      setEvent({ ...connectedEvent });
    }
  }, [connectedEvent]);

  return (
    <EventCard>
      <Summary onPress={props.onPress}>
        <EventTitle>{event.title}</EventTitle>
        <EventDatesContainer>
          <EventDates>
            {displayDates} -{" "}
            <Text style={{ color: Colors.tintColor }}>
              in {displayTimeToEvent}
            </Text>
          </EventDates>
        </EventDatesContainer>
        <View style={{ marginHorizontal: -16 }}>
          <Weather forecast={event.weather} />
        </View>
      </Summary>
      {!!event.contacts.length && (
        <View
          style={{
            minHeight: 50,
            borderTopColor: Colors.borders,
            borderTopWidth: 1
          }}
        >
          <View style={{ paddingHorizontal: 16 }}>
            <Contacts contacts={event.contacts} />
          </View>
        </View>
      )}
      <Map venue={event.venue} hotel={event.hotel} />
      <Tasks tasks={event.tasks.items} />
      <View
        style={{
          borderTopWidth: event.tasks.items.length ? 0 : 1,
          borderTopColor: Colors.borders
        }}
      >
        <ActionBar event={event} />
      </View>
    </EventCard>
  );
};
