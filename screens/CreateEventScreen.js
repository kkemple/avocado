import React, { useState } from "react";
import { View, Alert, StyleSheet, KeyboardAvoidingView } from "react-native";
import styled from "@emotion/native";
import { Button, Input } from "react-native-elements";
import { TabView } from "react-native-tab-view";
import parse from "date-fns/parse";
import getTime from "date-fns/getTime";
import * as Yup from "yup";
import { API, graphqlOperation } from "aws-amplify";
import { SafeAreaView } from "react-navigation";

import Tasks from "../components/TasksInput";
import NotesPicker from "../components/Notes";
import DatesPicker from "../components/DatesPicker";
import LocationPicker from "../components/LocationPicker";
import Colors from "../constants/Colors";
import { createEvent, createTask } from "../graphql/mutations";

const stepIsValid = async (key, value) => {
  switch (key) {
    case "title":
      return Yup.string()
        .min(2)
        .required()
        .isValid(value);
    case "dates":
      return Yup.object()
        .shape({
          start: Yup.string().matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/),
          end: Yup.string().matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)
        })
        .required()
        .isValid(value);
    case "venue":
      return Yup.object()
        .shape({
          name: Yup.string(),
          icon: Yup.string().url(),
          address: Yup.string(),
          googleMapsUrl: Yup.string().url(),
          location: Yup.object().shape({
            lat: Yup.number(),
            lng: Yup.number()
          })
        })
        .required()
        .isValid(value);
    case "hotel":
      return Yup.object()
        .shape({
          name: Yup.string(),
          icon: Yup.string().url(),
          address: Yup.string(),
          googleMapsUrl: Yup.string().url(),
          location: Yup.object().shape({
            lat: Yup.number(),
            lng: Yup.number()
          })
        })
        .nullable()
        .isValid(value);
    case "twitter": {
      if (!value) return Promise.resolve(true);

      return Yup.string()
        .matches(/^@/)
        .isValid(value);
    }
    case "website": {
      if (!value) return Promise.resolve(true);

      return Yup.string()
        .url()
        .isValid(value);
    }
    case "tickets": {
      if (!value) return Promise.resolve(true);

      return Yup.string()
        .url()
        .isValid(value);
    }
    default:
      return Promise.resolve(true);
  }
};

const errors = {
  title: "Title is required",
  dates: "Please select event dates, start and end can be same date",
  venue: "Please select a venue for the event",
  hotel: "Oops, location has insufficient data",
  twitter: "Please use a valid twitter handle",
  website: "Must be a URL",
  tickets: "Must be a URL"
};

const WizardView = styled.View`
  flex: 1;
  align-items: stretch;
`;

const WizardViewQuestion = styled.Text`
  font-family: "montserrat-bold";
  font-size: 36px;
  margin-bottom: 16px;
  color: ${Colors.primary["500"]};
`;

const Header = styled.View`
  align-items: flex-start;
  justify-content: flex-start;
`;

const Actions = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
`;

const NotesInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>Any notes?</WizardViewQuestion>
    <NotesPicker onNotesAdded={onChange} notes={value} />
  </WizardView>
);

const TitleInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>What event are you attending?</WizardViewQuestion>
    <Input
      returnKeyType="done"
      autoCompleteType="off"
      autoCapitalize="words"
      value={value}
      onChangeText={onChange}
      errorMessage="Required"
      errorStyle={{ color: Colors.primary["500"] }}
      inputContainerStyle={{
        borderBottomColor: Colors.primary["500"]
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.primary["500"],
        fontFamily: "montserrat-bold"
      }}
    />
  </WizardView>
);

const DatesInput = ({ onDatesSelected }) => (
  <WizardView>
    <WizardViewQuestion style={{ marginBottom: 0 }}>
      When is the event?
    </WizardViewQuestion>
    <DatesPicker
      buttonStyle={{ height: 60 }}
      onDatesSelected={onDatesSelected}
    />
  </WizardView>
);

const VenueInput = ({ onLocationSelected, value }) => (
  <WizardView>
    <WizardViewQuestion>Where is the event?</WizardViewQuestion>
    <LocationPicker
      required
      onLocationSelected={onLocationSelected}
      value={value}
    />
  </WizardView>
);

const HotelInput = ({ onLocationSelected, value }) => (
  <WizardView>
    <WizardViewQuestion>Where are you staying?</WizardViewQuestion>
    <LocationPicker onLocationSelected={onLocationSelected} value={value} />
  </WizardView>
);

const TasksInput = ({ onTasksCreated }) => (
  <WizardView>
    <WizardViewQuestion>Any tasks for this event?</WizardViewQuestion>
    <Tasks onTasksCreated={onTasksCreated} />
  </WizardView>
);

const WebsiteInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>Event website?</WizardViewQuestion>
    <Input
      autoCapitalize="none"
      onChangeText={onChange}
      value={value}
      containerStyle={{ marginBottom: 26 }}
      inputContainerStyle={{
        borderBottomColor: Colors.primary["500"]
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.primary["500"],
        fontFamily: "montserrat-bold"
      }}
    />
  </WizardView>
);

const TwitterInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>Twitter handle for event?</WizardViewQuestion>
    <Input
      autoCapitalize="none"
      onChangeText={onChange}
      value={value}
      containerStyle={{ marginBottom: 26 }}
      inputContainerStyle={{
        borderBottomColor: Colors.primary["500"]
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.primary["500"],
        fontFamily: "montserrat-bold"
      }}
    />
  </WizardView>
);

const TicketsInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>URL for your tickets?</WizardViewQuestion>
    <Input
      autoCapitalize="none"
      onChangeText={onChange}
      value={value}
      containerStyle={{ marginBottom: 26 }}
      inputContainerStyle={{
        borderBottomColor: Colors.primary["500"]
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.primary["500"],
        fontFamily: "montserrat-bold"
      }}
    />
  </WizardView>
);

export default function CreateEventScreen({ navigation }) {
  const [submitting, setSubmitting] = useState(false);
  const defaults = {
    title: null,
    twitter: null,
    website: null,
    tickets: null,
    dates: null,
    venue: null,
    hotel: null,
    tasks: [],
    notes: null
  };
  const [navigationState, setNavigationState] = useState({
    index: 0,
    routes: [
      { key: "title" },
      { key: "dates" },
      { key: "venue" },
      { key: "hotel" },
      { key: "twitter" },
      { key: "website" },
      { key: "notes" },
      { key: "tasks" },
      { key: "tickets" }
    ]
  });
  const [eventData, setEventData] = useState(defaults);

  const onDoneButtonPressed = async () => {
    if (navigationState.index + 1 === navigationState.routes.length) {
      if (!submitting) {
        try {
          setSubmitting(true);

          const { tasks, ...input } = eventData;
          const endDate = parse(input.dates.end, "yyyy-MM-dd", new Date());
          const timestamp = getTime(endDate);

          const {
            data: { createEvent: event }
          } = await API.graphql(
            graphqlOperation(createEvent, {
              input: {
                ...input,
                timestamp: `${timestamp}`
              }
            })
          );

          if (tasks.length) {
            await Promise.all(
              tasks.map(task => {
                return API.graphql(
                  graphqlOperation(createTask, {
                    input: {
                      ...task,
                      completed: false,
                      taskEventId: event.id
                    }
                  })
                );
              })
            );
          }

          setEventData(defaults);
          setSubmitting(false);

          navigation.goBack();
        } catch (error) {
          console.log(error);
          Alert.alert(
            `There was an error creating your event! - ${error.message}`
          );
          setSubmitting(false);
        }
      }
      return;
    }

    const key = navigationState.routes[navigationState.index].key;
    const value = eventData[key];
    const isValid = await stepIsValid(key, value);

    if (isValid) {
      setNavigationState(state => ({
        ...state,
        index: state.index + 1
      }));
    } else {
      Alert.alert(errors[key]);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[{ flex: 1, padding: 24, justifyContent: "flex-end" }]}>
          <Header>
            <Button
              activeOpacity={0.6}
              onPress={() => navigation.goBack()}
              containerStyle={styles.cancelButtonStyles}
              titleStyle={styles.cancelButtonTitleStyles}
              type="clear"
              title="Cancel"
            />
          </Header>
          <View style={{ marginTop: 32, flex: 1 }}>
            <TabView
              swipeEnabled={false}
              renderTabBar={() => null}
              navigationState={navigationState}
              onIndexChange={index =>
                setNavigationState(state => ({ ...state, index }))
              }
              initialLayout={{ flex: 1 }}
              renderScene={({ route }) => {
                switch (route.key) {
                  case "tasks":
                    return (
                      <TasksInput
                        onTasksCreated={tasks => {
                          setEventData(event => ({ ...event, tasks }));
                        }}
                      />
                    );
                  case "notes":
                    return (
                      <NotesInput
                        onNoteAdded={notes => {
                          setEventData(event => ({ ...event, notes }));
                        }}
                        value={eventData.notes}
                      />
                    );
                  case "title":
                    return (
                      <TitleInput
                        onChange={text => {
                          setEventData(event => ({ ...event, title: text }));
                        }}
                        value={eventData.title}
                      />
                    );
                  case "dates":
                    return (
                      <DatesInput
                        onDatesSelected={values => {
                          setEventData(event => ({ ...event, dates: values }));
                        }}
                      />
                    );
                  case "venue":
                    return (
                      <VenueInput
                        value={eventData.venue ? eventData.venue.address : ""}
                        onLocationSelected={values => {
                          if (!values.address) {
                            Alert.alert(
                              "Venue seems to have no direct address, please choose another."
                            );
                            return;
                          }

                          setEventData(event => ({ ...event, venue: values }));
                        }}
                      />
                    );
                  case "hotel":
                    return (
                      <HotelInput
                        value={eventData.hotel ? eventData.hotel.address : ""}
                        onLocationSelected={values => {
                          setEventData(event => ({ ...event, hotel: values }));
                        }}
                      />
                    );
                  case "website":
                    return (
                      <WebsiteInput
                        onChange={text => {
                          setEventData(event => ({
                            ...event,
                            website: text.toLowerCase()
                          }));
                        }}
                        value={eventData.website}
                      />
                    );
                  case "twitter":
                    return (
                      <TwitterInput
                        onChange={text => {
                          setEventData(event => ({ ...event, twitter: text }));
                        }}
                        value={eventData.twitter}
                      />
                    );
                  case "tickets":
                    return (
                      <TicketsInput
                        onChange={text => {
                          setEventData(event => ({ ...event, tickets: text }));
                        }}
                        value={eventData.tickets}
                      />
                    );
                  default:
                    return null;
                }
              }}
            />
          </View>
          <Actions>
            {navigationState.index !== 0 && (
              <Button
                activeOpacity={0.6}
                onPress={() => {
                  setNavigationState(state => ({
                    ...state,
                    index: state.index - 1
                  }));
                }}
                titleStyle={styles.backButtonTitleStyles}
                type="clear"
                title="Back"
              />
            )}
            <Button
              loading={submitting}
              type={
                navigationState.index + 1 === navigationState.routes.length
                  ? "solid"
                  : "outline"
              }
              activeOpacity={0.6}
              onPress={onDoneButtonPressed}
              titleStyle={[
                styles.doneButtonTitleStyles,
                {
                  color:
                    navigationState.index + 1 === navigationState.routes.length
                      ? Colors.grey["0"]
                      : Colors.primary["500"]
                }
              ]}
              title={
                navigationState.index + 1 === navigationState.routes.length
                  ? "Done"
                  : "Next"
              }
              buttonStyle={[
                styles.doneButtonStyles,
                {
                  backgroundColor:
                    navigationState.index + 1 === navigationState.routes.length
                      ? Colors.primary["500"]
                      : "transparent"
                }
              ]}
            />
          </Actions>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

CreateEventScreen.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  backButtonTitleStyles: {
    fontFamily: "montserrat-bold",
    color: Colors.inactive
  },
  cancelButtonTitleStyles: {
    fontFamily: "montserrat-bold",
    color: Colors.inactive
  },
  cancelButtonStyles: {
    marginLeft: -10
  },
  doneButtonStyles: {
    marginLeft: 16,
    width: 100,
    borderColor: Colors.primary["500"]
  },
  doneButtonTitleStyles: {
    fontFamily: "montserrat-extra-bold"
  }
});
