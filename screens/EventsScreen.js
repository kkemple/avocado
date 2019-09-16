import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text } from "react-native";
import { Agenda, Calendar } from "react-native-calendars";
import styled from "@emotion/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Auth, API, graphqlOperation } from "aws-amplify";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import parse from "date-fns/parse";
import endOfMonth from "date-fns/endOfMonth";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";
import MapView, { Marker } from "react-native-maps";

import Weather from "../components/Weather";
import Colors from "../constants/Colors";
import { listEvents } from "../graphql/queries";
import { onCreateEvent } from "../graphql/subscriptions";

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

const AddEventButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 32px;
  right: 32px;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${Colors.foreground};
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
`;

const EventTitle = styled.Text`
  color: ${Colors.text};
  font-size: 22px;
  font-family: "permanent-marker";
`;

const EventDates = styled.Text`
  color: ${Colors.text};
  font-family: "overpass-bold";
  font-size: 11px;
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
  margin-bottom: 8;
`;

const StyledMapView = styled(MapView)`
  background-color: ${Colors.tintColor};
  height: 100px;
`;

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [sortedEvents, setSortedEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [calendarDays, setCalendarDays] = useState({});
  const [activeMonth, setActiveMonth] = useState(null);

  useEffect(() => {
    if (!activeMonth) return;
    const getDaysForMonth = () => {
      const start = parse(activeMonth, "yyyy-MM-dd", new Date());
      const end = endOfMonth(start);

      const month = eachDayOfInterval({ start, end });
      return month.reduce((mem, day) => {
        const dateString = format(day, "yyyy-MM-dd");
        const event = sortedEvents.find(
          event => event.dates.start === dateString
        );
        mem[dateString] = event ? [event] : [];
        return mem;
      }, {});
    };

    const items = getDaysForMonth();

    setCalendarDays({
      ...calendarDays,
      ...items
    });
  }, [sortedEvents, setSortedEvents, activeMonth, setActiveMonth]);

  useEffect(() => {
    API.graphql(graphqlOperation(listEvents))
      .then(result => setEvents(result.data.listEvents.items))
      .catch(error => console.log(error.message));
  }, []);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onCreateEvent, { owner: user.username })
    ).subscribe({
      next: event => {
        setEvents([...events, event.value.data.onCreateEvent]);
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser]);

  useEffect(() => {
    const sortedEvents = events.sort((a, b) => {
      if (a.dates.start > b.dates.start) return 1;
      if (a.dates.start < b.dates.start) return -1;
      return 0;
    });

    setSortedEvents(sortedEvents);
  }, [events, setEvents, sortedEvents, setSortedEvents]);

  const selectedDate = sortedEvents.length ? sortedEvents[0].dates.start : null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {selectedDate && (
          <Agenda
            selected={selectedDate}
            loadItemsForMonth={day => setActiveMonth(day.dateString)}
            onDayPress={day => {
              console.log(day);
            }}
            items={calendarDays}
            rowHasChanged={(r1, r2) => {
              return r1.title !== r2.title;
            }}
            renderEmptyDate={() => {
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 24
                  }}
                >
                  <View
                    style={{
                      marginTop: 24,
                      flex: 1,
                      height: 1,
                      backgroundColor: "#e4eaed"
                    }}
                  />
                </View>
              );
            }}
            renderItem={(item, firstItemInDay) => {
              const displayDates = getDisplayDates(
                item.dates.start,
                item.dates.end
              );

              const displayTimeToEvent = getTimeToEvent(item.dates.start);

              return (
                <View
                  style={{
                    flex: 1,
                    marginRight: 24,
                    marginTop: 32
                  }}
                >
                  <View
                    style={{
                      backgroundColor: Colors.foreground,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 4
                    }}
                  >
                    <EventTitle>{item.title}</EventTitle>
                    <EventDatesContainer>
                      <EventDates>
                        {displayDates} -{" "}
                        <Text style={{ color: Colors.tintColor }}>
                          in {displayTimeToEvent}
                        </Text>
                      </EventDates>
                    </EventDatesContainer>
                    <Weather forecast={item.weather} />
                    <StyledMapView
                      zoomControlEnabled={false}
                      showsCompass={false}
                      showsScale={false}
                      initialCamera={{
                        center: {
                          latitude: item.venue.location.lat,
                          longitude: item.venue.location.lng
                        },
                        pitch: 45,
                        heading: 0,
                        altitude: 300,
                        zoom: 3
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: item.venue.location.lat,
                          longitude: item.venue.location.lng
                        }}
                        title={item.venue.name}
                        description={item.venue.address}
                      />
                    </StyledMapView>
                  </View>
                </View>
              );
            }}
            theme={{
              backgroundColor: Colors.background,
              selectedDayBackgroundColor: Colors.tintColor,
              selectedDayTextColor: Colors.foreground,
              todayTextColor: Colors.tintColor,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.inactive,
              dotColor: Colors.tintColor,
              selectedDotColor: Colors.foreground,
              monthTextColor: Colors.text,
              indicatorColor: Colors.tintColor,
              agendaDayTextColor: Colors.tintColor,
              agendaDayNumColor: Colors.tintColor,
              agendaTodayColor: Colors.tintColor,
              agendaKnobColor: Colors.inactive
            }}
          />
        )}
      </View>
      <AddEventButton onPress={() => navigation.navigate("CreateEvent")}>
        <FontAwesome5 name="calendar-plus" color={Colors.tintColor} size={24} />
      </AddEventButton>
    </SafeAreaView>
  );
}

EventsScreen.navigationOptions = {
  // title: "Events",
  // headerTintColor: Colors.tintColor,
  // headerTitleStyle: {
  //   fontFamily: "permanent-marker",
  //   fontSize: 24
  // }
  header: null
};
