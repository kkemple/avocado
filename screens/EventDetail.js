import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal
} from "react-native";
import styled from "@emotion/native";
import { Button, Icon, Input } from "react-native-elements";
import { API, graphqlOperation } from "aws-amplify";
import { SafeAreaView } from "react-navigation";

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

import { deleteEvent, updateEvent, createTask } from "../graphql/mutations";

import useEventConnection from "../hooks/event-connection";

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
  border-radius: 2px;
  border-style: dashed;
  border-color: ${Colors.tintColor};
  border-width: 1px;
  background-color: ${Colors.foreground};
  justify-content: center;
  align-items: center;
  margin: 16px;
  padding: 16px;
  flex-direction: row;
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
      camera.zoom = 17;

      mapView.current.animateCamera(camera, { duration: 400 });
    };

    updateCamera();
  }, [location]);

  return (
    <View>
      {location ? (
        <StyledMapView
          ref={mapView}
          style={{ height: 175 }}
          zoomControlEnabled={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          scrollEnabled={false}
          zoomEnabled={false}
          zoomTapEnabled={false}
          initialCamera={{
            center: {
              latitude: location.location.lat,
              longitude: location.location.lng
            },
            pitch: 45,
            heading: 0,
            altitude: 350,
            zoom: 17
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
        <View
          style={{
            height: 150,
            padding: 8,
            margin: 8,
            borderColor: Colors.tintColor,
            borderStyle: "dashed",
            borderRadius: 2,
            borderWidth: 1
          }}
        />
      )}
      <View
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors.foreground,
          borderRadius: 4
        }}
      >
        <Text
          style={{
            fontFamily: "permanent-marker",
            fontSize: 18,
            paddingHorizontal: 8,
            paddingVertical: 4,
            color: Colors.tintColor
          }}
        >
          {title}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <TouchableOpacity onPress={onPress}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Icon
              raised
              size={24}
              type="material-community"
              name="map-search"
              color={Colors.tintColor}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
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

const TasksForm = ({ showModal, onTaskCreated, onCancel }) => {
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
            containerStyle={{
              marginTop: "auto"
            }}
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
                setNewTask({});
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
                onTaskCreated(newTask);
                setNewTask({});
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

export default function EventDetailScreen({ navigation }) {
  const title = navigation.getParam("title");
  const eventId = navigation.getParam("eventId");

  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showActionBarModal, setShowActionBarModal] = useState(false);
  const [updating, setUpdating] = useState(true);
  const [touchedData, setTouchedData] = useState(null);

  const [event] = useEventConnection(eventId);

  useEffect(() => {
    if (event) {
      setUpdating(false);
    }
  }, [event]);

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
        {event && (
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: Colors.borders,
              paddingHorizontal: -16
            }}
          >
            <Weather forecast={event.weather} />
          </View>
        )}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {event && (
            <View>
              <View style={{ paddingHorizontal: 8 }}>
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
              <View
                style={event.hotel ? { marginBottom: 8, flex: 1 } : { flex: 1 }}
              >
                <Location
                  title="Venue"
                  onPress={() => setShowVenueModal(true)}
                  location={event.venue}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Location
                  title="Hotel"
                  onPress={() => setShowHotelModal(true)}
                  location={event.hotel}
                />
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.borders,
                  paddingHorizontal: 8
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
                <AddTaskButton onPress={() => setShowTasksModal(true)}>
                  <Text
                    style={{
                      marginBottom: -5,
                      fontSize: 18,
                      color: Colors.tintColor,
                      fontFamily: "overpass-black"
                    }}
                  >
                    Add Task
                  </Text>
                  <Feather name="plus" color={Colors.tintColor} size={20} />
                </AddTaskButton>
              </View>
            </View>
          )}
        </ScrollView>
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
              onCancel={() => setShowTasksModal(false)}
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
