import React, { useCallback, useState, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Agenda } from "react-native-calendars";
import styled from "@emotion/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Auth, API, graphqlOperation } from "aws-amplify";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import parse from "date-fns/parse";
import startOfMonth from "date-fns/startOfMonth";
import startOfDay from "date-fns/startOfDay";
import endOfMonth from "date-fns/endOfMonth";
import endOfDay from "date-fns/endOfDay";
import subMonths from "date-fns/subMonths";
import addMonths from "date-fns/addMonths";
import getTime from "date-fns/getTime";
import format from "date-fns/format";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-navigation";

import Colors from "../constants/Colors";
import { listEvents } from "../graphql/queries";
import {
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent
} from "../graphql/subscriptions";

const AddEventButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${Colors.grey["0"]};
  justify-content: center;
  align-items: center;
  box-shadow: 1px 1px 1px ${Colors.shadow};
`;

const EventTitle = styled.Text`
  color: ${Colors.grey["0"]};
  font-size: 20px;
  font-family: "permanent-marker";
`;

const EventDates = styled.Text`
  color: ${Colors.grey["0"]};
  font-family: "overpass-bold";
  font-size: 14px;
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
`;

const AgendaCurrentDate = styled.Text`
  color: ${Colors.primary["300"]};
  font-family: "overpass-black";
  text-align: center;
  margin-bottom: -2px;
`;

const AgendaCurrentDateContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const EmptyDate = () => {
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
          backgroundColor: Colors.primary["200"]
        }}
      />
    </View>
  );
};

const Item = ({ item, onPress, isFirstItem }) => (
  <View
    style={{
      flex: 1,
      marginRight: 24,
      marginTop: isFirstItem ? 24 : 16
    }}
  >
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View
        style={{
          backgroundColor: Colors.primary["500"],
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 4
        }}
      >
        <EventTitle>{item.title}</EventTitle>
        <EventDatesContainer>
          <EventDates>{item.description}</EventDates>
        </EventDatesContainer>
      </View>
    </TouchableOpacity>
  </View>
);

const renderItem = (item, isFirstItem, navigation) => (
  <Item
    item={item}
    isFirstItem={isFirstItem}
    activeOpacity={0.6}
    onPress={() =>
      navigation.navigate("EventDetail", {
        eventId: item.event.id,
        title: item.title
      })
    }
  />
);

export default function EventsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [calendarDays, setCalendarDays] = useState({});
  const [markedDays, setMarkedDays] = useState({});
  const [activeMonth, setActiveMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [agendaDisplayDate, setAgendaDisplayDate] = useState(null);

  const renderItemCall = useCallback((item, isFirstItem) =>
    renderItem(item, isFirstItem, navigation)
  );

  // activeMonth controlled by agenda component
  // fetch events for time frame
  // add to calendar days
  // set calendar selected date
  useEffect(() => {
    const getDaysForMonth = async () => {
      const today = new Date();
      try {
        const start = activeMonth
          ? startOfDay(startOfMonth(subMonths(activeMonth, 3)))
          : startOfDay(startOfMonth(subMonths(today, 3)));
        const end = activeMonth
          ? endOfDay(endOfMonth(addMonths(activeMonth, 3)))
          : endOfDay(endOfMonth(addMonths(today, 3)));

        const result = await API.graphql(
          graphqlOperation(listEvents, {
            filter: {
              timestamp: {
                ge: `${getTime(start)}`
              },
              and: [
                {
                  timestamp: {
                    le: `${getTime(end)}`
                  }
                }
              ]
            }
          })
        );

        const events = result.data.listEvents.items;

        const month = eachDayOfInterval({
          start,
          end
        });

        const items = month.reduce((mem, day) => {
          // get date string
          const dateString = format(day, "yyyy-MM-dd");

          // get date string for today
          const today = format(new Date(), "yyyy-MM-dd");

          // find events
          const eventsInRange = events.filter(
            event =>
              dateString >= event.dates.start && dateString <= event.dates.end
          );

          // if no events, set day empty and move on
          if (!eventsInRange.length) {
            mem[dateString] = [];
            return mem;
          }

          eventsInRange
            .sort((a, b) => {
              if (a.dates.start > b.dates.start) return 1;
              if (a.dates.start < b.dates.start) return -1;
              return 0;
            })
            .map(event => {
              // check to see if this is the first event after today
              // if so set selectedDate
              if (!selectedDate && dateString > today) {
                setSelectedDate(event.dates.start);
              }

              // get event days so we can mark agenda: 'Day (1/4)'
              const eventStart = parse(
                event.dates.start,
                "yyyy-MM-dd",
                new Date()
              );
              const eventEnd = parse(event.dates.end, "yyyy-MM-dd", new Date());
              const eventDays = eachDayOfInterval({
                start: eventStart,
                end: eventEnd
              });

              // map over event days and update the current day of month
              // use the index and length to build the string for `Day (N/N)`
              eventDays.map((eventDay, index, self) => {
                const eventDayString = format(eventDay, "yyyy-MM-dd");

                // if the day of the month matches the day of the event
                if (eventDayString === dateString) {
                  // see if there are any other events on this day already
                  const existingEvents = mem[eventDayString];

                  // if there are existing events, push this event on to the end
                  if (existingEvents && existingEvents.length) {
                    mem[eventDayString] = [
                      ...existingEvents,
                      {
                        key: event.id,
                        title: event.title,
                        description: `Day (${index + 1}/${self.length})`,
                        event
                      }
                    ];
                  } else {
                    mem[eventDayString] = [
                      {
                        key: event.id,
                        title: event.title,
                        description: `Day (${index + 1}/${self.length})`,
                        event
                      }
                    ];
                  }
                }
              });
            });

          return mem;
        }, {});

        const marked = Object.keys(items).reduce((mem, key) => {
          mem[key] = { marked: !!items[key].length };
          return mem;
        }, {});

        // update calendar days with month
        setCalendarDays({
          ...calendarDays,
          ...items
        });

        setMarkedDays({
          ...markedDays,
          ...marked
        });
      } catch (error) {
        console.log(error.message);
      }
    };

    getDaysForMonth();
  }, [activeMonth, setActiveMonth]);

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
      next: subscription => {
        const event = subscription.value.data.onCreateEvent;

        const eventStart = parse(event.dates.start, "yyyy-MM-dd", new Date());
        const eventEnd = parse(event.dates.end, "yyyy-MM-dd", new Date());
        const eventDays = eachDayOfInterval({
          start: eventStart,
          end: eventEnd
        });

        const daysToUpdate = {};

        // map over event days and update the current day of month
        // we can use the index and length to build the string
        eventDays.map((eventDay, index, self) => {
          const eventDayString = format(eventDay, "yyyy-MM-dd");
          const existingEvents = calendarDays[eventDayString];

          // check for existing events on this day
          if (existingEvents && existingEvents.length) {
            daysToUpdate[eventDayString] = [...existingEvents, event];
          } else {
            daysToUpdate[eventDayString] = [
              {
                key: event.id,
                title: event.title,
                description: `Day (${index + 1}/${self.length})`,
                event
              }
            ];
          }
        });

        // update calendar days with new event data
        setCalendarDays({
          ...calendarDays,
          ...daysToUpdate
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, calendarDays, setCalendarDays]);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateEvent, { owner: user.username })
    ).subscribe({
      next: subscription => {
        const event = subscription.value.data.onUpdateEvent;

        const scrubbedCalendarDays = Object.keys(calendarDays).reduce(
          (mem, key) => {
            if (key < event.dates.start || key > event.dates.end) {
              const eventsForDay = calendarDays[key];
              const filteredEvents = eventsForDay.filter(
                e => e.event.id !== event.id
              );

              mem[key] = filteredEvents;
            } else {
              mem[key] = calendarDays[key];
            }

            return mem;
          },
          {}
        );

        const eventStart = parse(event.dates.start, "yyyy-MM-dd", new Date());
        const eventEnd = parse(event.dates.end, "yyyy-MM-dd", new Date());
        const eventDays = eachDayOfInterval({
          start: eventStart,
          end: eventEnd
        });

        const daysToUpdate = {};

        // map over event days and update the current day of month
        // we can use the index and length to build the string
        eventDays.map((eventDay, index, self) => {
          const eventDayString = format(eventDay, "yyyy-MM-dd");

          // check for existing events on this day
          const existingEvents = scrubbedCalendarDays[eventDayString];

          // see if the event is already on the calendar
          const eventAlreadyPresent = !!existingEvents.find(
            e => e.event.id === event.id
          );

          if (existingEvents && existingEvents.length) {
            // if already exists overwrite it
            if (eventAlreadyPresent) {
              daysToUpdate[eventDayString] = existingEvents.map(e =>
                e.event.id === event.id
                  ? {
                      key: event.id,
                      title: event.title,
                      description: `Day (${index + 1}/${self.length})`,
                      event
                    }
                  : e
              );
            } else {
              // otherwise add it
              daysToUpdate[eventDayString] = [
                ...existingEvents,
                {
                  key: event.id,
                  title: event.title,
                  description: `Day (${index + 1}/${self.length})`,
                  event
                }
              ];
            }
          } else {
            // no events on day, add it as first event
            daysToUpdate[eventDayString] = [
              {
                key: event.id,
                title: event.title,
                description: `Day (${index + 1}/${self.length})`,
                event
              }
            ];
          }
        });

        // update calendar days with updated event data
        setCalendarDays({
          ...scrubbedCalendarDays,
          ...daysToUpdate
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, calendarDays, setCalendarDays]);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onDeleteEvent, { owner: user.username })
    ).subscribe({
      next: subscription => {
        const event = subscription.value.data.onDeleteEvent;

        const scrubbedCalendarDays = Object.keys(calendarDays).reduce(
          (mem, key) => {
            if (key >= event.dates.start || key <= event.dates.end) {
              const eventsForDay = calendarDays[key];
              const filteredEvents = eventsForDay.filter(
                e => e.event.id !== event.id
              );
              mem[key] = filteredEvents;
            } else {
              mem[key] = calendarDays[key];
            }
          },
          {}
        );

        // update calendar days with updated event data
        setCalendarDays({
          ...scrubbedCalendarDays
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, calendarDays, setCalendarDays]);

  useEffect(() => {
    if (!activeMonth || agendaDisplayDate) return;
    const displayDate = format(activeMonth, "MMMM yyyy");
    setAgendaDisplayDate(displayDate);
  }, [activeMonth, setActiveMonth, agendaDisplayDate, setAgendaDisplayDate]);

  const onDayChange = day => {
    const date = parse(day.dateString, "yyyy-MM-dd", new Date());
    const displayDate = format(date, "MMMM yyyy");
    console.log(displayDate);
    setAgendaDisplayDate(displayDate);
  };

  const loadItemsForMonth = day => {
    const start = startOfMonth(parse(day.dateString, "yyyy-MM-dd", new Date()));
    setActiveMonth(start);
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.grey["0"],
        flex: 1
      }}
    >
      <View style={{ flex: 1 }}>
        {!selectedDate && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <LottieView
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
              source={require("../assets/lottie/lottie-events-loading.json")}
            />
          </View>
        )}
        {selectedDate && (
          <View style={{ flex: 1 }}>
            <AgendaCurrentDateContainer>
              <AgendaCurrentDate>{agendaDisplayDate}</AgendaCurrentDate>
            </AgendaCurrentDateContainer>
            <Agenda
              displayLoadingIndicator
              selected={selectedDate}
              markedDates={markedDays}
              onDayChange={onDayChange}
              onDayPress={onDayChange}
              loadItemsForMonth={loadItemsForMonth}
              items={calendarDays}
              rowHasChanged={(r1, r2) => {
                return r1.title !== r2.title;
              }}
              renderEmptyDate={() => <EmptyDate />}
              renderItem={renderItemCall}
              theme={{
                backgroundColor: Colors.primary["100"],
                selectedDayBackgroundColor: Colors.primary["500"],
                selectedDayTextColor: Colors.grey["0"],
                todayTextColor: Colors.primary["500"],
                dayTextColor: Colors.text,
                textDisabledColor: Colors.primary["200"],
                dotColor: Colors.primary["500"],
                selectedDotColor: Colors.grey["0"],
                monthTextColor: Colors.text,
                indicatorColor: Colors.primary["500"],
                agendaDayTextColor: Colors.primary["500"],
                agendaDayNumColor: Colors.primary["500"],
                agendaTodayColor: Colors.primary["500"],
                agendaKnobColor: Colors.primary["200"]
              }}
            />
          </View>
        )}
      </View>
      <AddEventButton
        activeOpacity={0.6}
        onPress={() => navigation.navigate("CreateEvent")}
      >
        <FontAwesome5
          name="calendar-plus"
          color={Colors.primary["500"]}
          size={24}
        />
      </AddEventButton>
    </SafeAreaView>
  );
}

EventsScreen.navigationOptions = {
  header: null
};
