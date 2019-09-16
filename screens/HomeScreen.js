import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Auth, API, graphqlOperation } from "aws-amplify";

import Colors from "../constants/Colors";
import EventCard from "../components/EventCard";
import { listEvents } from "../graphql/queries";
import { onCreateEvent } from "../graphql/subscriptions";

export default function HomeScreen() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.graphql(graphqlOperation(listEvents))
      .then(result => {
        setEvents(result.data.listEvents.items);
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

  const sortedEvents = events.sort((a, b) => {
    if (a.dates.start < b.dates.start) return -1;
    if (a.dates.start > b.dates.start) return 1;
    return 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          {sortedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

HomeScreen.navigationOptions = {
  // title: "Avocado",
  // headerTintColor: Colors.tintColor,
  // headerTitleStyle: {
  //   fontFamily: "permanent-marker",
  //   fontSize: 24
  // }
  header: null
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  contentContainer: {
    paddingTop: 30
  }
});
