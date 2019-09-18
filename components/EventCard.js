import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import { Auth, API, graphqlOperation } from "aws-amplify";
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
import {
  onUpdateEvent,
  onUpdateTask,
  onCreateTask,
  onDeleteTask
} from "../graphql/subscriptions";

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateEvent, {
        owner: user.username
      })
    ).subscribe({
      next: event => {
        const updatedEvent = event.value.data.onUpdateEvent;

        if (updatedEvent.id === event.id) {
          setEvent(updatedEvent);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  useEffect(() => {
    if (!user) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateTask, {
        owner: user.username
      })
    ).subscribe({
      next: ({ value }) => {
        const updatedTask = value.data.onUpdateTask;

        if (updatedTask.event.id === event.id) {
          const updatedTasks = event.tasks.items.map(task => {
            if (task.id === updatedTask.id) {
              return {
                id: updatedTask.id,
                title: updatedTask.title,
                due: updatedTask.due,
                completed: updatedTask.completed
              };
            }

            return task;
          });

          setEvent({
            ...event,
            tasks: { items: updatedTasks }
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onCreateTask, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onCreateTask: createdTask }
        }
      }) => {
        if (createdTask.event.id === event.id) {
          const sortedTasks = [...event.tasks.items, createdTask].sort(
            (a, b) => {
              if (a.due > b.due) return 1;
              if (a.due < b.due) return -1;
              return 0;
            }
          );

          setEvent({
            ...event,
            tasks: { items: sortedTasks }
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onDeleteTask, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onDeleteTask: deletedTask }
        }
      }) => {
        if (deletedTask.event.id === event.id) {
          const updatedTasks = event.tasks.items.filter(
            task => task.id !== deletedTask.id
          );

          setEvent({
            ...event,
            tasks: { items: updatedTasks }
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  const displayDates = getDisplayDates(event.dates.start, event.dates.end);

  const displayTimeToEvent = getTimeToEvent(event.dates.start);

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
        <View style={{ paddingHorizontal: -16 }}>
          <Weather forecast={event.weather} />
        </View>
      </Summary>
      {!!event.contacts.length && (
        <View style={{ borderTopColor: Colors.borders, borderTopWidth: 1 }}>
          <Contacts contacts={event.contacts} />
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
