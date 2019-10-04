import React, { useState, useEffect } from "react";
import { Icon } from "react-native-elements";
import styled from "@emotion/native";
import parse from "date-fns/parse";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";

import Colors from "../constants/Colors";
import ActionBar from "./ActionBar";
import Notes from "./Notes";
import Map from "./Map";
import Weather from "./Weather";
import Tasks from "./Tasks";
import useEventConnection from "../hooks/event-connection";

const EventCard = styled.View`
  background-color: ${Colors.grey["0"]};
  margin: 0 24px 24px;
  flex: 1;
  border-radius: 4px;
  box-shadow: 1px 1px 1px ${Colors.shadow};
  elevation: 2;
`;

const EventTitle = styled.Text`
  color: ${Colors.text};
  font-size: 20px;
  font-family: "montserrat-black";
  max-width: 80%;
  line-height: 20px;
  margin-bottom: 4px;
`;

const EventDates = styled.Text`
  color: ${Colors.grey["700"]};
  font-family: "montserrat-bold";
  font-size: 12px;
`;

const Summary = styled.TouchableOpacity`
  padding: 16px 16px 8px;
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`;

const TimeToEvent = styled.Text`
  color: ${Colors.primary["500"]};
  font-family: "montserrat-bold";
  font-size: 12px;
`;

const WeatherContainer = styled.View`
  margin-horizontal: -16px;
`;

const NotesContainer = styled.View`
  border-top-width: 1px;
  border-top-color: ${Colors.borders};
  padding-horizontal: 16px;
`;

const ActionBarContainer = styled.View`
  border-top-width: ${props => (props.hideBorder ? 0 : 1)};
  border-top-color: ${Colors.borders};
`;

const EventDetailButton = styled.View`
  position: absolute;
  width: 32px;
  height: 32px;
  top: 8px;
  right: 8px;
  justify-content: center;
  align-items: center;
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
      <Summary activeOpacity={0.6} onPress={props.onPress}>
        <EventTitle>{event.title}</EventTitle>
        <EventDatesContainer>
          <EventDates>{displayDates} -</EventDates>
          <TimeToEvent> in {displayTimeToEvent}</TimeToEvent>
        </EventDatesContainer>
        <WeatherContainer>
          <Weather forecast={event.weather} />
        </WeatherContainer>
        <EventDetailButton>
          <Icon
            name="arrow-right"
            type="material-community"
            size={24}
            color={Colors.primary["700"]}
          />
        </EventDetailButton>
      </Summary>
      <Map venue={event.venue} hotel={event.hotel} />
      <Tasks tasks={event.tasks.items} />
      <ActionBarContainer hideBorder={!!event.tasks.items.length}>
        <ActionBar event={event} />
      </ActionBarContainer>
    </EventCard>
  );
};
