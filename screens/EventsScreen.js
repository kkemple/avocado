import React, { memo, useState, useEffect } from "react";
import { SafeAreaView, View, TouchableOpacity } from "react-native";
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
  background-color: ${Colors.foreground};
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
`;

const EventTitle = styled.Text`
  color: ${Colors.foreground};
  font-size: 20px;
  font-family: "permanent-marker";
`;

const EventDates = styled.Text`
  color: ${Colors.foreground};
  font-family: "overpass-bold";
  font-size: 14px;
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
`;

const EmptyDate = memo(() => {
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
});

const Item = memo(({ item, onPress, isFirstItem }) => (
  <View
    style={{
      flex: 1,
      marginRight: 24,
      marginTop: isFirstItem ? 24 : 16
    }}
  >
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: Colors.tintColor,
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
));

export default function EventsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [calendarDays, setCalendarDays] = useState({});
  const [activeMonth, setActiveMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // activeMonth controlled by agenda component
  // fetch events for time frame
  // add to calendar days
  // set calendar selected date
  useEffect(() => {
    const getDaysForMonth = async () => {
      try {
        const start = activeMonth
          ? activeMonth
          : startOfDay(subMonths(startOfMonth(new Date()), 1));
        const end = activeMonth
          ? endOfDay(endOfMonth(activeMonth))
          : endOfDay(endOfMonth(addMonths(new Date(), 1)));

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

        // update calendar days with month
        setCalendarDays({
          ...calendarDays,
          ...items
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

  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.foreground,
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
          <Agenda
            selected={selectedDate}
            loadItemsForMonth={day => {
              const start = startOfMonth(
                parse(day.dateString, "yyyy-MM-dd", new Date())
              );
              setActiveMonth(start);
            }}
            items={calendarDays}
            rowHasChanged={(r1, r2) => {
              return r1.title !== r2.title;
            }}
            renderEmptyDate={() => <EmptyDate />}
            renderItem={(item, isFirstItem) => (
              <Item
                isFirstItem={isFirstItem}
                onPress={() =>
                  navigation.navigate("EventDetail", {
                    eventId: item.event.id,
                    title: item.title
                  })
                }
                item={item}
              />
            )}
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
  header: null
};