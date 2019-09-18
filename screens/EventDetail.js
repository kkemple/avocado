import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal
} from "react-native";
import styled from "@emotion/native";
import { Button, Icon, Input } from "react-native-elements";
import { Auth, API, graphqlOperation } from "aws-amplify";
import parse from "date-fns/parse";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";
import MapView, { Marker } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

import Colors from "../constants/Colors";
import ActionBar from "../components/ActionBar";
import Contacts from "../components/Contacts";
import Weather from "../components/Weather";
import Tasks from "../components/Tasks";
import DatesPicker from "../components/DatesPicker";
import LocationPicker from "../components/LocationPicker";
import { getEvent } from "../graphql/queries";
import { deleteEvent, updateEvent, createTask } from "../graphql/mutations";
import {
  onUpdateEvent,
  onUpdateTask,
  onCreateTask,
  onDeleteTask
} from "../graphql/subscriptions";

const Actions = styled.View`
  justify-content: flex-end;
  align-items: center;
  flex-direction: row;
  padding-vertical: 16px;
  width: 100%;
`;

const Title = styled.Text`
  font-family: "permanent-marker";
  font-size: 28px;
  color: ${Colors.text};
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
  margin-bottom: 16;
  padding-horizontal: 24px;
`;

const StyledMapView = styled(MapView)`
  background-color: ${Colors.tintColor};
  width: 100%;
`;

const AddTaskButton = styled.TouchableOpacity`
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

const Location = ({ location, title, onPress }) => {
  const mapView = useRef();

  useEffect(() => {
    const updateCamera = async () => {
      const camera = await mapView.current.getCamera();
      camera.center.latitude = location.location.lat;
      camera.center.longitude = location.location.lng;
      camera.pitch = 45;
      camera.heading = 0;
      camera.altitude = 350;
      camera.zoom = 3.5;

      mapView.current.animateCamera(camera, { duration: 400 });
    };

    updateCamera();
  }, [location]);

  return (
    <TouchableOpacity onPress={onPress}>
      {location ? (
        <StyledMapView
          ref={mapView}
          style={{ height: 150 }}
          zoomControlEnabled={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          initialCamera={{
            center: {
              latitude: location.location.lat,
              longitude: location.location.lng
            },
            pitch: 45,
            heading: 0,
            altitude: 350,
            zoom: 3.5
          }}
        >
          <Marker
            coordinate={{
              latitude: location.location.lat,
              longitude: location.location.lng
            }}
            title={location.name}
            description={location.address}
          />
        </StyledMapView>
      ) : (
        <View style={{ height: 150 }} />
      )}
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.3)"
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            borderWidth: 2,
            borderColor: Colors.foreground,
            borderStyle: "dashed",
            borderRadius: 1,
            margin: 8,
            padding: 8
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "permanent-marker",
              color: Colors.foreground
            }}
          >
            {title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TitleInput = ({ showModal, value, onChange, onCancel }) => {
  const [title, setTitle] = useState(value);

  return (
    <Modal visible={showModal} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            padding: 24,
            justifyContent: "center",
            alignItems: "stretch",
            height: "100%"
          }}
        >
          <Input
            value={title}
            onChangeText={text => setTitle(text)}
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
            containerStyle={{
              marginTop: "auto"
            }}
          />
          <View
            style={{
              marginTop: "auto",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <Button
              type="clear"
              title="Cancel"
              onPress={() => {
                setTitle(value);
                onCancel();
              }}
              titleStyle={{
                fontFamily: "overpass-bold",
                color: Colors.inactive
              }}
            />
            <Button
              title="Done"
              onPress={() => onChange(title)}
              titleStyle={{
                fontFamily: "overpass-black",
                color: Colors.foreground
              }}
              buttonStyle={{
                marginLeft: 16,
                width: 100,
                backgroundColor: Colors.tintColor
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const LocationInput = ({
  showModal,
  value,
  onChange,
  onCancel,
  required = false
}) => {
  const [location, setLocation] = useState(value);
  return (
    <Modal visible={showModal} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            padding: 24,
            justifyContent: "center",
            alignItems: "stretch",
            height: "100%"
          }}
        >
          <View style={{ marginTop: "auto" }}>
            <LocationPicker
              autoFocus
              title="Venue"
              required={required}
              onLocationSelected={newLocation => setLocation(newLocation)}
              value={location.address}
            />
          </View>
          <View
            style={{
              marginTop: "auto",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <Button
              type="clear"
              title="Cancel"
              onPress={() => {
                setLocation(value);
                onCancel();
              }}
              titleStyle={{
                fontFamily: "overpass-bold",
                color: Colors.inactive
              }}
            />
            <Button
              title="Done"
              onPress={() => {
                if (required && !location) {
                  Alert.alert("Location required");
                  return;
                }
                onChange(location);
              }}
              titleStyle={{
                fontFamily: "overpass-black",
                color: Colors.foreground
              }}
              buttonStyle={{
                marginLeft: 16,
                width: 100,
                backgroundColor: Colors.tintColor
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const ActionsInput = ({ showModal, values, onChange, onCancel }) => {
  const [twitter, setTwitter] = useState(values.twitter);
  const [website, setWebsite] = useState(values.website);
  const [tickets, setTickets] = useState(values.tickets);

  return (
    <Modal visible={showModal} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            padding: 24,
            justifyContent: "center",
            alignItems: "stretch",
            height: "100%"
          }}
        >
          <Input
            value={twitter}
            onChangeText={text => setTwitter(text)}
            errorMessage="Twitter"
            errorStyle={{ color: Colors.tintColor }}
            inputContainerStyle={{
              borderBottomColor: Colors.tintColor
            }}
            inputStyle={{
              fontSize: 24,
              color: Colors.tintColor,
              fontFamily: "overpass-bold"
            }}
            containerStyle={{
              marginTop: "auto"
            }}
          />
          <Input
            value={website}
            errorMessage="Website"
            onChangeText={text => setWebsite(text.toLowerCase())}
            errorStyle={{ color: Colors.tintColor }}
            inputContainerStyle={{
              borderBottomColor: Colors.tintColor
            }}
            inputStyle={{
              fontSize: 24,
              color: Colors.tintColor,
              fontFamily: "overpass-bold"
            }}
            containerStyle={{
              marginTop: 48
            }}
          />
          <Input
            value={tickets}
            errorMessage="Tickets"
            onChangeText={text => setTickets(text.toLowerCase())}
            errorStyle={{ color: Colors.tintColor }}
            inputContainerStyle={{
              borderBottomColor: Colors.tintColor
            }}
            inputStyle={{
              fontSize: 24,
              color: Colors.tintColor,
              fontFamily: "overpass-bold"
            }}
            containerStyle={{
              marginTop: 48
            }}
          />
          <View
            style={{
              marginTop: "auto",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <Button
              type="clear"
              title="Cancel"
              onPress={() => {
                setTwitter(values.twitter);
                setWebsite(values.website);
                setTickets(values.tickets);
                onCancel();
              }}
              titleStyle={{
                fontFamily: "overpass-bold",
                color: Colors.inactive
              }}
            />
            <Button
              title="Done"
              onPress={() =>
                onChange({
                  twitter: twitter && twitter.length > 0 ? twitter : null,
                  website: website && website.length > 0 ? website : null,
                  tickets: tickets && tickets.length > 0 ? tickets : null
                })
              }
              titleStyle={{
                fontFamily: "overpass-black",
                color: Colors.foreground
              }}
              buttonStyle={{
                marginLeft: 16,
                width: 100,
                backgroundColor: Colors.tintColor
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const TasksForm = ({ showModal, onTaskCreated }) => {
  const [newTask, setNewTask] = useState({});

  return (
    <Modal animationType="slide" visible={showModal}>
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

              onTaskCreated(newTask);
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
  );
};

export default function EventDetailScreen({ navigation }) {
  const title = navigation.getParam("title", "Event");
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showActionBarModal, setShowActionBarModal] = useState(false);
  const [updating, setUpdating] = useState(true);
  const [touchedData, setTouchedData] = useState(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      .catch(error => console.log(error));
  }, [setUser]);

  useEffect(() => {
    const eventId = navigation.getParam("eventId", null);

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

    API.graphql(
      graphqlOperation(getEvent, {
        id: eventId
      })
    )
      .then(result => {
        const event = result.data.getEvent;
        setEvent({
          ...event,
          displayDates: getDisplayDates(event.dates.start, event.dates.end),
          timeToEvent: getTimeToEvent(event.dates.start)
        });
        setUpdating(false);
      })
      .catch(error => console.log(error));
  }, [setEvent, setUpdating, navigation]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateEvent, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onUpdateEvent: updatedEvent }
        }
      }) => {
        if (updatedEvent.id === event.id) {
          setEvent({
            ...event,
            ...updatedEvent
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateTask, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onUpdateTask: updatedTask }
        }
      }) => {
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

  useEffect(() => {
    if (!touchedData) return;

    setUpdating(true);

    if (touchedData.task) {
      API.graphql(
        graphqlOperation(createTask, {
          input: {
            taskEventId: event.id,
            completed: false,
            ...touchedData.task
          }
        })
      )
        .then(() => {
          setUpdating(false);
          setTouchedData(null);
        })
        .catch(error => {
          Alert.alert(error.message);
          setUpdating(false);
        });
    } else {
      API.graphql(
        graphqlOperation(updateEvent, {
          input: {
            id: event.id,
            ...touchedData
          }
        })
      )
        .then(() => {
          setUpdating(false);
          setTouchedData(null);
        })
        .catch(error => {
          Alert.alert(error.message);
          setUpdating(false);
        });
    }
  }, [event, touchedData, setTouchedData, setUpdating]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Actions style={{ paddingHorizontal: 16 }}>
          <Button
            onPress={() => navigation.goBack()}
            containerStyle={{ marginTop: 6, marginRight: "auto" }}
            titleStyle={{
              fontFamily: "overpass-bold",
              color: Colors.inactive
            }}
            type="clear"
            title="Go Back"
          />
          {updating && <ActivityIndicator color={Colors.tintColor} />}
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            onPress={() => {
              Alert.alert("Delete Event", "Are you sure?", [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "OK",
                  onPress: async () => {
                    setUpdating(true);
                    await API.graphql(
                      graphqlOperation(deleteEvent, {
                        input: { id: event.id }
                      })
                    );
                    setUpdating(false);
                    navigation.goBack();
                  }
                }
              ]);
            }}
          >
            <Icon
              size={24}
              type="feather"
              name="delete"
              color={Colors.tintColor}
            />
          </TouchableOpacity>
        </Actions>
        <View
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            paddingHorizontal: 24
          }}
        >
          <TouchableOpacity onPress={() => setShowTitleModal(true)}>
            <Title>{event ? event.title : title}</Title>
          </TouchableOpacity>
        </View>
        {event && (
          <EventDatesContainer>
            <DatesPicker
              style={{ marginTop: -24 }}
              required={false}
              value={event.dates}
              onDatesSelected={value => {
                setTouchedData({ dates: value });
              }}
            />
          </EventDatesContainer>
        )}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
        >
          {event && (
            <View>
              <View style={{ paddingHorizontal: -16 }}>
                <Weather forecast={event.weather} />
              </View>
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: Colors.borders
                }}
              >
                <Contacts
                  showControls={true}
                  contacts={event.contacts}
                  onContactsSelected={contacts => {
                    setTouchedData({
                      contacts
                    });
                  }}
                />
              </View>
              <View>
                <View
                  style={
                    event.hotel ? { marginBottom: 4, flex: 1 } : { flex: 1 }
                  }
                >
                  <Location
                    onPress={() => setShowVenueModal(true)}
                    title="Tap to change venue"
                    location={event.venue}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Location
                    onPress={() => setShowHotelModal(true)}
                    title="Tap to change hotel"
                    location={event.hotel}
                  />
                </View>
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.borders
                }}
              >
                <ActionBar
                  showEditButton
                  onPress={() => setShowActionBarModal(true)}
                  event={event}
                />
              </View>
              <View>
                {!!event.tasks.items.length && (
                  <Tasks showDeleteButton tasks={event.tasks.items} />
                )}
              </View>
            </View>
          )}
        </ScrollView>
        <AddTaskButton onPress={() => setShowTasksModal(true)}>
          <Feather name="plus" color={Colors.tintColor} size={24} />
        </AddTaskButton>
        {event && (
          <View>
            <TitleInput
              value={event.title}
              showModal={showTitleModal}
              onCancel={() => setShowTitleModal(false)}
              onChange={value => {
                setTouchedData({ title: value });
                setShowTitleModal(false);
              }}
            />
            <LocationInput
              value={event.venue}
              showModal={showVenueModal}
              onCancel={() => setShowVenueModal(false)}
              onChange={value => {
                setTouchedData({ venue: value });
                setShowVenueModal(false);
              }}
            />
            <LocationInput
              value={event.hotel}
              showModal={showHotelModal}
              onCancel={() => setShowHotelModal(false)}
              onChange={value => {
                setTouchedData({ hotel: value });
                setShowHotelModal(false);
              }}
            />
            <ActionsInput
              values={{
                twitter: event.twitter,
                website: event.website,
                tickets: event.tickets
              }}
              showModal={showActionBarModal}
              onCancel={() => setShowActionBarModal(false)}
              onChange={values => {
                setTouchedData({ ...values });
                setShowActionBarModal(false);
              }}
            />
            <TasksForm
              showModal={showTasksModal}
              onTaskCreated={task => {
                setShowTasksModal(false);
                setTouchedData({ task });
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

EventDetailScreen.navigationOptions = {
  header: null
};
