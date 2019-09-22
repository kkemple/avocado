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
import { onCreateEvent } from "../graphql/subscriptions";

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

  useEffect(() => {
    const timestamp = getTime(startOfDay(new Date()));

    API.graphql(
      graphqlOperation(listEvents, {
        limit: 5,
        filter: {
          timestamp: {
            ge: `${timestamp}`
          }
        }
      })
    )
      .then(result => {
        const events = result.data.listEvents.items;
        setEvents(events);
        setLoaded(true);
      })
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    let subscription = {
      unsubscribe: () => {}
    };

    Auth.currentAuthenticatedUser()
      .then(user => {
        subscription = API.graphql(
          graphqlOperation(onCreateEvent, { owner: user.username })
        ).subscribe({
          next: event => {
            setEvents([...events, event.value.data.onCreateEvent]);
          }
        });
      })
      .catch(error => console.log(error));

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const sortedEvents = events.sort((a, b) => {
      if (a.dates.start < b.dates.start) return -1;
      if (a.dates.start > b.dates.start) return 1;
      return 0;
    });
    setSortedEvents(sortedEvents);
  }, [events, setEvents, setSortedEvents]);

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
