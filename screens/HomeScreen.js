import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { Auth, API, graphqlOperation } from "aws-amplify";
import getTime from "date-fns/getTime";
import startOfDay from "date-fns/startOfDay";
import { SafeAreaView } from "react-navigation";
import styled from "@emotion/native";

import Colors from "../constants/Colors";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";
import { listEvents } from "../graphql/queries";
import {
  onCreateEvent,
  onDeleteEvent,
  onUpdateEvent
} from "../graphql/subscriptions";
import { isAfter } from "date-fns";

const NoUpcomingEventsContainer = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: space-between;
  align-items: stretch;
`;

const NoUpcomingEventsTitle = styled.Text`
  font-family: "overpass-black";
  font-size: 24px;
  color: ${Colors.primary["300"]};
  text-align: center;
`;

const CreateEventButton = styled.TouchableOpacity`
  background-color: ${Colors.primary["500"]};
  padding-vertical: 8px;
  margin: 4px;
  border-radius: 4px;
`;

const NoUpcomingEventsImage = styled.Image`
  width: 200px;
  height: 200px;
`;

const NoUpcomingEventsImageContainer = styled.View`
  width: 200px;
  height: 200px;
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 8px;
`;

export default function HomeScreen({ navigation }) {
  const [loaded, setLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [sortedEvents, setSortedEvents] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!user) {
      Auth.currentAuthenticatedUser()
        .then(user => setUser(user))
        .catch(error => console.log(error));
    }
  }, [user, setUser]);

  useEffect(() => {
    const timestamp = getTime(startOfDay(new Date()));

    API.graphql(
      graphqlOperation(listEvents, {
        limit: 6,
        filter: {
          timestamp: {
            ge: `${timestamp}`
          }
        }
      })
    )
      .then(result => {
        setEvents(result.data.listEvents.items);
        setLoaded(true);
      })
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    const sortedEvents = events.sort((a, b) => {
      if (a.dates.start < b.dates.start) return -1;
      if (a.dates.start > b.dates.start) return 1;
      return 0;
    });

    setSortedEvents(sortedEvents.slice(0, 5));
  }, [events, setEvents, setSortedEvents]);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onCreateEvent, { owner: user.username })
    ).subscribe({
      next: subscription => {
        const event = subscription.value.data.onCreateEvent;
        setEvents([...events, event]);
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, events, setEvents]);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onDeleteEvent, { owner: user.username })
    ).subscribe({
      next: subscription => {
        const event = subscription.value.data.onDeleteEvent;
        setEvents(events.filter(e => e.id !== event.id));
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, events, setEvents]);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateEvent, { owner: user.username })
    ).subscribe({
      next: subscription => {
        const event = subscription.value.data.onUpdateEvent;
        setEvents(events.map(e => (e.id === event.id ? event : e)));
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, events, setEvents]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: sortedEvents.length
            ? Colors.primary["100"]
            : Colors.grey["0"]
        }
      ]}
    >
      <View style={styles.container}>
        {!sortedEvents.length && !loaded && <Loader />}
        {!sortedEvents.length && loaded && (
          <NoUpcomingEventsContainer>
            <View
              style={{
                alignItems: "center",
                marginTop: "auto",
                marginBottom: "auto"
              }}
            >
              <NoUpcomingEventsImageContainer>
                <NoUpcomingEventsImage
                  source={require("../assets/images/travel-bg.png")}
                />
              </NoUpcomingEventsImageContainer>
              <NoUpcomingEventsTitle>No upcoming events!</NoUpcomingEventsTitle>
            </View>

            <CreateEventButton
              activeOpacity={0.6}
              onPress={() => navigation.navigate("CreateEvent")}
            >
              <Text
                style={{
                  fontFamily: "overpass-black",
                  color: Colors.grey["0"],
                  textAlign: "center",
                  fontSize: 20
                }}
              >
                Create Event
              </Text>
            </CreateEventButton>
          </NoUpcomingEventsContainer>
        )}
        {!!sortedEvents.length && (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
          >
            {sortedEvents.map(event => (
              <EventCard
                colors={Colors}
                key={event.id}
                event={event}
                onPress={() => {
                  navigation.navigate("EventDetail", {
                    eventId: event.id,
                    title: event.title
                  });
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

HomeScreen.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    paddingTop: 24
  }
});
