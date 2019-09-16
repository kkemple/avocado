import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  SafeAreaView,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity
} from "react-native";
import styled from "@emotion/native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Button, Input, ListItem, Icon, Avatar } from "react-native-elements";
import { Calendar } from "react-native-calendars";
import { TabView } from "react-native-tab-view";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import parse from "date-fns/parse";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";
import * as Yup from "yup";
import { API, graphqlOperation } from "aws-amplify";
import * as Contacts from "expo-contacts";
import { FontAwesome5 } from "@expo/vector-icons";
import uuid from "uuid/v4";

import Colors from "../../constants/Colors";
import { createEvent, createTask } from "../../graphql/mutations";

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

const Title = styled.Text`
  font-family: "permanent-marker";
  font-size: 28px;
  color: ${Colors.text};
  flex: 1;
`;

const WizardView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: stretch;
`;

const WizardViewQuestion = styled.Text`
  font-family: "overpass-regular";
  font-size: 36px;
  margin-bottom: 16px;
  color: ${Colors.tintColor};
`;

const Task = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  padding: 8px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.borders};
`;

const TaskTitle = styled.Text`
  font-family: "overpass-bold";
`;

const TaskDueDate = styled.Text`
  color: ${Colors.tintColor};
`;

const Tasks = ({ onTasksCreated }) => {
  const [showPicker, setShowPicker] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sortedTasks, setSortedTasks] = useState([]);
  const [newTask, setNewTask] = useState({});

  useEffect(() => {
    onTasksCreated(sortedTasks);
  }, [sortedTasks, setSortedTasks]);

  useEffect(() => {
    const sortedTasks = tasks.sort((a, b) => {
      if (a.due > b.due) return 1;
      if (a.due < b.due) return -1;
      return 0;
    });

    setSortedTasks(sortedTasks);
  }, [tasks, setTasks]);

  return (
    <View>
      <View>
        <TouchableOpacity
          style={{ alignSelf: "flex-start", marginBottom: 16 }}
          onPress={() => setShowPicker(true)}
        >
          <Icon name="add" raised color={Colors.tintColor} />
        </TouchableOpacity>
        {tasks.map(task => {
          const timeTillDue = formatDistance(
            new Date(),
            parse(task.due, "yyyy-MM-dd", new Date())
          );

          return (
            <Task key={task.id}>
              <View>
                <TaskTitle>{task.title}</TaskTitle>
                <TaskDueDate>Due in {timeTillDue}</TaskDueDate>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setTasks(tasks.filter(t => t.id !== task.id));
                }}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <FontAwesome5 name="trash" color={Colors.tintColor} size={20} />
              </TouchableOpacity>
            </Task>
          );
        })}
      </View>
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView>
          <View
            style={{
              height: "100%",
              padding: 24
            }}
          >
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 16 }}
              onPress={() => setShowPicker(false)}
            >
              <Icon size={30} name="close" color={Colors.inactive} />
            </TouchableOpacity>
            <Input
              placeholder="Task title"
              placeholderTextColor={Colors.inactive}
              onChangeText={text =>
                setNewTask(nt => ({
                  ...nt,
                  title: text
                }))
              }
              value={newTask.title}
              inputStyle={{
                color: Colors.tintColor,
                fontFamily: "overpass-black",
                fontSize: 24
              }}
              inputContainerStyle={{
                borderBottomColor: Colors.tintColor
              }}
            />
            <Text
              style={{
                marginTop: 32,
                textAlign: "center",
                fontFamily: "overpass-black",
                color: Colors.inactive,
                fontSize: 18
              }}
            >
              Due Date
            </Text>
            <Calendar
              onDayPress={day => {
                setNewTask(nt => ({ ...nt, due: day.dateString }));
              }}
              markedDates={
                newTask.due && {
                  [newTask.due]: { selected: true }
                }
              }
              theme={{
                selectedDayBackgroundColor: Colors.tintColor,
                selectedDayTextColor: Colors.foreground,
                todayTextColor: Colors.tintColor,
                dayTextColor: Colors.text,
                textDisabledColor: Colors.inactive,
                dotColor: Colors.tintColor,
                selectedDotColor: Colors.foreground,
                arrowColor: Colors.tintColor,
                monthTextColor: Colors.text,
                indicatorColor: Colors.tintColor,
                textDayFontFamily: "overpass-black",
                textMonthFontFamily: "overpass-black",
                textDayHeaderFontFamily: "overpass-black"
              }}
            />
            <Button
              onPress={() => {
                if (!newTask.title) {
                  Alert.alert("Please add a title");
                  return;
                }
                if (!newTask.due) {
                  Alert.alert("Please select a due date");
                  return;
                }

                setTasks([{ id: uuid(), ...newTask }, ...tasks]);
                setShowPicker(false);
                setNewTask({});
              }}
              buttonStyle={{
                marginTop: 32,
                backgroundColor: Colors.tintColor
              }}
              titleStyle={{
                fontFamily: "overpass-black"
              }}
              title="Done"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const ContactsList = ({ onContactSelected = () => {} }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  useEffect(() => {
    Contacts.getContactsAsync()
      .then(result => setContacts(result.data))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    onContactSelected(selectedContacts);
  }, [selectedContacts, setSelectedContacts]);

  return (
    <View>
      {contacts.map(contact => {
        const data = {
          id: contact.id,
          subtitle: contact[Contacts.Fields.Emails]
            ? contact[Contacts.Fields.Emails][0].email
            : "",
          image: contact[Contacts.Fields.Image],
          name: contact[Contacts.Fields.Name],
          firstName: contact[Contacts.Fields.FirstName],
          lastName: contact[Contacts.Fields.LastName],
          emails: contact[Contacts.Fields.Emails]
        };
        const isSelected = !!selectedContacts.find(c => c.id === contact.id);

        return (
          <TouchableOpacity
            onPress={() => {
              if (isSelected) {
                setSelectedContacts(
                  selectedContacts.filter(c => c.id !== contact.id)
                );
              } else {
                setSelectedContacts([...selectedContacts, data]);
              }
            }}
            key={contact.id}
          >
            <ListItem
              bottomDivider
              title={data.name}
              subtitle={data.subtitle}
              containerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 8
              }}
              titleStyle={{
                marginTop: 4,
                fontFamily: "overpass-bold",
                fontSize: 14,
                lineHeight: 15,
                color: isSelected ? Colors.tintColor : Colors.text
              }}
              subtitleStyle={{
                fontFamily: "overpass-regular",
                fontSize: 12,
                lineHeight: 13,
                color: isSelected ? Colors.tintColor : Colors.text
              }}
              leftAvatar={{
                source: {
                  uri: data.image
                },
                placeholderStyle: {
                  backgroundColor: isSelected
                    ? Colors.tintColor
                    : Colors.inactive
                }
              }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const ContactsPicker = ({ onContactsSelected = () => {} }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const buildTitle = contact => {
    const f = contact.firstName.substring(0, 1).toUpperCase();
    const l = contact.lastName.substring(0, 1).toUpperCase();

    return `${f}${l}`;
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8
        }}
      >
        {selectedContacts.map(contact => (
          <Avatar
            rounded
            key={contact.id}
            size="medium"
            title={contact.image ? "" : buildTitle(contact)}
            source={contact.image ? { uri: contact.image } : null}
            titleStyle={{
              fontFamily: "permanent-marker"
            }}
            containerStyle={{
              marginRight: 8
            }}
          />
        ))}
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Icon name="add" raised color={Colors.tintColor} />
        </TouchableOpacity>
      </View>
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView>
          <View
            style={{
              height: "100%",
              paddingVertical: 24
            }}
          >
            {showPicker && (
              <ScrollView>
                <ContactsList
                  onContactSelected={contacts => {
                    setSelectedContacts(contacts);
                  }}
                />
              </ScrollView>
            )}
            <Button
              onPress={() => {
                onContactsSelected(selectedContacts.map(c => c.id));
                setShowPicker(false);
              }}
              buttonStyle={{
                margin: 24,
                backgroundColor: Colors.tintColor
              }}
              titleStyle={{
                fontFamily: "overpass-black"
              }}
              title="Done"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const DatesPicker = ({ onDatesSelected }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [dates, setDates] = useState([]);

  const getDatesInRange = (startDate, endDate) => {
    const start = parse(startDate, "yyyy-MM-dd", new Date());
    const end = parse(endDate, "yyyy-MM-dd", new Date());

    const allDates = eachDayOfInterval({ start, end });

    return allDates.map(date => format(date, "yyyy-MM-dd"));
  };

  const getMarkedDatesFromRange = (startDate, endDate) => {
    const dates = getDatesInRange(startDate, endDate);

    return dates.reduce((mem, val, index, self) => {
      const markedDate = {
        startingDay: index === 0,
        endingDay: index + 1 === self.length,
        color: Colors.tintColor,
        textColor: Colors.foreground
      };

      mem[val] = markedDate;

      return mem;
    }, {});
  };

  const markedDates = () => {
    if (!dates.length) return {};

    const datesForCalendar =
      dates.length > 1
        ? getMarkedDatesFromRange(dates[0], dates[1])
        : {
            [dates[0]]: {
              startingDay: true,
              endingDay: true,
              color: Colors.tintColor,
              textColor: Colors.foreground
            }
          };

    return datesForCalendar;
  };

  const displayDates = (startDate, endDate) => {
    const start = parse(startDate, "yyyy-MM-dd", new Date());
    const end = parse(endDate, "yyyy-MM-dd", new Date());

    if (startDate === endDate) {
      return format(start, "MMM do");
    }

    return `${format(start, "MMM do")} - ${format(end, "MMM do")}`;
  };

  const getTitle = () => {
    if (dates.length === 1) {
      return "Select End Date";
    }

    return "Select Start Date";
  };

  return (
    <View>
      <Button
        onPress={() => setShowPicker(true)}
        buttonStyle={{
          backgroundColor: "transparent",
          borderBottomWidth: 1,
          borderBottomColor: Colors.tintColor,
          borderRadius: 0,
          height: 60,
          paddingBottom: 0,
          paddingLeft: 0,
          justifyContent: "flex-start",
          alignItems: "flex-end"
        }}
        titleStyle={{
          fontFamily: "overpass-black",
          color: Colors.tintColor,
          fontSize: 24,
          marginBottom: -4
        }}
        title={dates.length === 2 ? displayDates(dates[0], dates[1]) : ""}
      />
      <Text style={{ fontSize: 10, margin: 5, color: Colors.tintColor }}>
        Required
      </Text>
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView>
          <View
            style={{
              height: "100%",
              padding: 24
            }}
          >
            <Text
              style={{
                fontFamily: "overpass-black",
                color: Colors.tintColor,
                textAlign: "center",
                marginBottom: 8,
                fontSize: 20
              }}
            >
              {getTitle()}
            </Text>
            <Calendar
              markingType={"period"}
              onDayPress={day => {
                if (dates[1]) {
                  setDates([day.dateString]);
                } else {
                  const startDate = dates[0];
                  if (day.dateString < startDate) {
                    Alert.alert("End date cannot be before start date");
                    return;
                  }
                  setDates([...dates, day.dateString]);
                }
              }}
              markedDates={markedDates()}
              theme={{
                selectedDayBackgroundColor: Colors.tintColor,
                selectedDayTextColor: Colors.foreground,
                todayTextColor: Colors.tintColor,
                dayTextColor: Colors.text,
                textDisabledColor: Colors.inactive,
                dotColor: Colors.tintColor,
                selectedDotColor: Colors.foreground,
                arrowColor: Colors.tintColor,
                monthTextColor: Colors.text,
                indicatorColor: Colors.tintColor,
                textDayFontFamily: "overpass-black",
                textMonthFontFamily: "overpass-black",
                textDayHeaderFontFamily: "overpass-black"
              }}
            />
            <Button
              onPress={() => {
                if (dates.length !== 2) {
                  return;
                }

                onDatesSelected({ start: dates[0], end: dates[1] });
                setShowPicker(false);
              }}
              buttonStyle={{
                marginTop: 24,
                backgroundColor:
                  dates.length === 2 ? Colors.tintColor : Colors.inactive
              }}
              titleStyle={{
                fontFamily: "overpass-black"
              }}
              title="Done"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const LocationInput = ({ required, onLocationSelected, value }) => {
  return (
    <View>
      <GooglePlacesAutocomplete
        placeholder=""
        text={value}
        minLength={2}
        autoFocus={false}
        returnKeyType={"search"}
        listViewDisplayed={false}
        fetchDetails={true}
        renderDescription={row => row.description}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{ rankby: "distance" }}
        filterReverseGeocodingByTypes={["locality"]}
        debounce={200}
        enablePoweredByContainer={false}
        onPress={(data, details = null) => {
          const location = {
            address: details.formatted_address,
            googleMapsUrl: details.url,
            location: details.geometry.location,
            icon: details.icon,
            name: details.name
          };

          onLocationSelected(location);
        }}
        query={{
          key: "AIzaSyDOysoULo6R3hZIz_DqxZWHTd4CA3Pm6bY",
          language: "en",
          types: ["address", "establishment"]
        }}
        styles={{
          container: {
            flex: 0,
            marginBottom: required ? 0 : 28,
            position: "relative"
          },
          textInputContainer: {
            borderBottomColor: Colors.tintColor,
            borderBottomWidth: 1,
            backgroundColor: "transparent",
            paddingTop: 10,
            paddingBottom: 24,
            paddingVertical: 8,
            borderRadius: 4,
            height: 44,
            borderTopWidth: 0
          },
          row: {
            paddingLeft: 0,
            paddingRight: 0
          },
          textInput: {
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0,
            color: Colors.tintColor,
            fontFamily: "overpass-bold",
            backgroundColor: "transparent",
            fontSize: 24
          },
          description: {
            fontFamily: "overpass-regular",
            color: Colors.tintColor,
            marginBottom: -10
          },
          listView: {
            position: "absolute",
            flex: 0,
            backgroundColor: Colors.foreground,
            top: 55
          }
        }}
      />
      {required && (
        <Text
          style={{
            fontSize: 10,
            margin: 5,
            marginBottom: 10,
            color: Colors.tintColor
          }}
        >
          Required
        </Text>
      )}
    </View>
  );
};

const ContactsInput = ({ onContactsSelected, value }) => (
  <WizardView>
    <WizardViewQuestion>Would you like to add any contacts?</WizardViewQuestion>
    <ContactsPicker onContactsSelected={onContactsSelected} value={value} />
  </WizardView>
);

const TitleInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>What event are you attending?</WizardViewQuestion>
    <Input
      value={value}
      onChangeText={onChange}
      errorMessage="Required"
      errorStyle={{ color: Colors.tintColor }}
      inputContainerStyle={{
        borderBottomColor: Colors.tintColor
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.tintColor,
        fontFamily: "overpass-bold"
      }}
    />
  </WizardView>
);

const DatesInput = ({ onDatesSelected }) => (
  <WizardView>
    <WizardViewQuestion style={{ paddingTop: 56, marginBottom: 0 }}>
      When is the event?
    </WizardViewQuestion>
    <DatesPicker onDatesSelected={onDatesSelected} />
  </WizardView>
);

const VenueInput = ({ onLocationSelected, value }) => (
  <WizardView>
    <WizardViewQuestion>Where is the event taking place?</WizardViewQuestion>
    <LocationInput
      required
      onLocationSelected={onLocationSelected}
      value={value}
    />
  </WizardView>
);

const HotelInput = ({ onLocationSelected, value }) => (
  <WizardView>
    <WizardViewQuestion>Where will you be staying?</WizardViewQuestion>
    <LocationInput onLocationSelected={onLocationSelected} value={value} />
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
    <WizardViewQuestion>Does the event have a website?</WizardViewQuestion>
    <Input
      onChangeText={onChange}
      value={value}
      containerStyle={{ marginBottom: 26 }}
      inputContainerStyle={{
        borderBottomColor: Colors.tintColor
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.tintColor,
        fontFamily: "overpass-bold"
      }}
    />
  </WizardView>
);

const TwitterInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>
      What is Twitter handle for the event?
    </WizardViewQuestion>
    <Input
      onChangeText={onChange}
      value={value}
      containerStyle={{ marginBottom: 26 }}
      inputContainerStyle={{
        borderBottomColor: Colors.tintColor
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.tintColor,
        fontFamily: "overpass-bold"
      }}
    />
  </WizardView>
);

const TicketsInput = ({ onChange, value }) => (
  <WizardView>
    <WizardViewQuestion>What is the URL for your tickets?</WizardViewQuestion>
    <Input
      onChangeText={onChange}
      value={value}
      containerStyle={{ marginBottom: 26 }}
      inputContainerStyle={{
        borderBottomColor: Colors.tintColor
      }}
      inputStyle={{
        fontSize: 24,
        color: Colors.tintColor,
        fontFamily: "overpass-bold"
      }}
    />
  </WizardView>
);

export default function CreateEventScreen({ navigation }) {
  const defaults = {
    title: null,
    twitter: null,
    website: null,
    tickets: null,
    dates: null,
    venue: null,
    hotel: null,
    tasks: [],
    contacts: []
  };

  const [navigationState, setNavigationState] = useState({
    index: 0,
    routes: [
      { key: "title" },
      { key: "dates" },
      { key: "venue" },
      { key: "hotel" },
      { key: "contacts" },
      { key: "tasks" },
      { key: "twitter" },
      { key: "website" },
      { key: "tickets" }
    ]
  });

  const [eventData, setEventData] = useState(defaults);
  const [submitting, setSubmitting] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Title>Create Event</Title>
          <Button
            onPress={() => navigation.goBack()}
            containerStyle={{ marginTop: 6 }}
            titleStyle={{
              fontFamily: "overpass-bold",
              color: Colors.inactive
            }}
            type="clear"
            title="Cancel"
          />
        </View>
        <View style={{ flex: 1 }}>
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
                case "contacts":
                  return (
                    <ContactsInput
                      onContactsSelected={contacts => {
                        setEventData(event => ({ ...event, contacts }));
                      }}
                      value={eventData.title}
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            {navigationState.index !== 0 && (
              <Button
                onPress={() => {
                  setNavigationState(state => ({
                    ...state,
                    index: state.index - 1
                  }));
                }}
                titleStyle={{
                  fontFamily: "overpass-bold",
                  color: Colors.inactive
                }}
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
              onPress={async () => {
                if (
                  navigationState.index + 1 ===
                  navigationState.routes.length
                ) {
                  if (!submitting) {
                    try {
                      setSubmitting(true);

                      const { tasks, ...input } = eventData;

                      const {
                        data: { createEvent: event }
                      } = await API.graphql(
                        graphqlOperation(createEvent, { input })
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
              }}
              titleStyle={{
                fontFamily: "overpass-black",
                color:
                  navigationState.index + 1 === navigationState.routes.length
                    ? Colors.foreground
                    : Colors.tintColor
              }}
              title={
                navigationState.index + 1 === navigationState.routes.length
                  ? "Done"
                  : "Next"
              }
              buttonStyle={{
                marginLeft: 16,
                width: 100,
                borderColor: Colors.tintColor,
                backgroundColor:
                  navigationState.index + 1 === navigationState.routes.length
                    ? Colors.tintColor
                    : "transparent"
              }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

CreateEventScreen.navigationOptions = {
  header: null
};
