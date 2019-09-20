import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { Auth, API, graphqlOperation } from "aws-amplify";
import LottieView from "lottie-react-native";
import getTime from "date-fns/getTime";
import startOfDay from "date-fns/startOfDay";
import { SafeAreaView } from "react-navigation";

import Colors from "../constants/Colors";
import EventCard from "../components/EventCard";
import { listEvents } from "../graphql/queries";
import { onCreateEvent } from "../graphql/subscriptions";

export default function HomeScreen({ navigation }) {
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
        {!sortedEvents.length && (
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
