import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView
} from "react-native";
import styled from "@emotion/native";
import { Button, Icon, Input } from "react-native-elements";
import { API, graphqlOperation } from "aws-amplify";
import { SafeAreaView } from "react-navigation";
import MapView, { Marker } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import Color from "color";

import ActionBar from "../components/ActionBar";
import Colors from "../constants/Colors";
import Contacts from "../components/Contacts";
import DatesPicker from "../components/DatesPicker";
import LocationPicker from "../components/LocationPicker";
import Tasks from "../components/Tasks";
import Weather from "../components/Weather";
import { deleteEvent, updateEvent, createTask } from "../graphql/mutations";
import useEventConnection from "../hooks/event-connection";
import useKeyboardVisible from "../hooks/keyboard-visible";

const Actions = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
  padding: 16px;
  width: 100%;
`;

const Title = styled.Text`
  color: ${Colors.text};
  font-family: "montserrat-black";
  font-size: 28px;
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
  margin-bottom: 16;
  padding-horizontal: 24px;
`;

const StyledMapView = styled(MapView)`
  background-color: ${Colors.primary["500"]};
  width: 100%;
`;

const AddTaskButton = styled.TouchableOpacity`
  align-items: center;
  background-color: ${Colors.grey["0"]};
  border-color: ${Colors.primary["500"]};
  border-radius: 2px;
  border-style: dashed;
  border-width: 1px;
  flex-direction: row;
  justify-content: center;
  margin: 16px;
  padding: 16px;
`;

const ChangeLocationButton = styled.TouchableOpacity`
  align-items: center;
  background-color: ${Colors.grey["0"]};
  border-radius: 28px;
  box-shadow: 1px 1px 1px ${Colors.shadow};
  height: 52px;
  justify-content: center;
  margin: 8px;
  width: 52px;
`;

const CancelButton = styled.TouchableOpacity`
  margin-left: 16px;
`;

const TitleContainer = styled.View`
  justify-content: flex-start;
  align-items: flex-start;
  padding-horizontal: 24px;
`;

const WeatherContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.borders};
  padding-horizontal: -16px;
`;

const ContactsContainer = styled.View`
  padding-horizontal: 8px;
`;

const ActionBarContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.borders};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-horizontal: 4px;
`;

const EditActionsButton = styled.TouchableOpacity`
  align-items: center;
  align-self: flex-start;
  background-color: ${Colors.grey["0"]};
  border-radius: 20px;
  box-shadow: 1px 1px 1px ${Colors.shadow};
  height: 36px;
  justify-content: center;
  margin: 8px;
  margin-left: 16px;
  width: 36px;
`;

const LocationTitleContainer = styled.View`
  position: absolute;
  top: 12px;
  left: 12px;
  flex-direction: row;
  align-items: center;
  // rgb of Colors.primary["200"]
  background-color: rgba(212, 222, 249, 0.5);
  border-radius: 4px;
`;

const LocationTitleText = styled.Text`
  font-family: "montserrat-black";
  font-size: 18px;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  color: ${Colors.primary["400"]};
`;

const EmptyLocation = styled.View`
  height: 150px;
  padding: 8px;
  margin: 8px;
  border-color: ${Colors.primary["500"]};
  border-style: "dashed";
  border-radius: 2px;
  border-width: 1px;
`;

const AddTaskButtonText = styled.Text`
  font-size: 18px;
  color: ${Colors.primary["500"]};
  font-family: "montserrat-extra-bold";
`;

const InputActionsContainer = styled.View`
  margin-top: auto;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
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
            icon={require("../assets/images/map-marker.png")}
            coordinate={{
              latitude: location.location.lat,
              longitude: location.location.lng
            }}
            title={location.name}
            description={location.address}
          >
            <Image
              style={{ width: 40, height: 40 }}
              source={require("../assets/images/map-marker.png")}
            />
          </Marker>
        </StyledMapView>
      ) : (
        <EmptyLocation />
      )}
      <LocationTitleContainer>
        <LocationTitleText>{title}</LocationTitleText>
      </LocationTitleContainer>

      <View
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <ChangeLocationButton onPress={onPress}>
          <Icon
            size={24}
            type="material-community"
            name="map-search"
            color={Colors.primary["500"]}
          />
        </ChangeLocationButton>
      </View>
    </View>
  );
};

const TitleInput = ({
  showModal,
  value,
  onChange,
  onCancel,
  keyboardVisible
}) => {
  const [title, setTitle] = useState(value);

  return (
    <Modal visible={showModal} animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              padding: 24,
              justifyContent: keyboardVisible ? "flex-end" : "center",
              alignItems: "stretch",
              height: "100%"
            }}
          >
            <Input
              value={title}
              onChangeText={text => setTitle(text)}
              errorMessage="Required"
              errorStyle={styles.inputErrorStyle}
              inputContainerStyle={styles.inputContainerContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.inputContainerStyle}
            />
            <InputActionsContainer>
              <Button
                type="clear"
                title="Cancel"
                onPress={() => {
                  setTitle(value);
                  onCancel();
                }}
                titleStyle={{
                  fontFamily: "montserrat-bold",
                  color: Colors.inactive
                }}
              />
              <Button
                title="Done"
                onPress={() => {
                  if (title.length < 3) {
                    Alert.alert("Title required!");
                    return;
                  }
                  onChange(title && title.length > 0 ? title : null);
                }}
                titleStyle={{
                  fontFamily: "montserrat-extra-bold",
                  color: Colors.grey["0"]
                }}
                buttonStyle={{
                  marginLeft: 16,
                  width: 100,
                  backgroundColor: Colors.primary["500"]
                }}
              />
            </InputActionsContainer>
          </View>
          {keyboardVisible && <View style={{ flex: 1 }} />}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const LocationInput = ({
  showModal,
  value,
  onChange,
  onCancel,
  required = false,
  keyboardVisible
}) => {
  const [location, setLocation] = useState(value);
  return (
    <Modal visible={showModal} animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              padding: 24,
              justifyContent: keyboardVisible ? "flex-end" : "center",
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
            <InputActionsContainer>
              <Button
                type="clear"
                title="Cancel"
                onPress={() => {
                  setLocation(value);
                  onCancel();
                }}
                titleStyle={{
                  fontFamily: "montserrat-bold",
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
                  fontFamily: "montserrat-extra-bold",
                  color: Colors.grey["0"]
                }}
                buttonStyle={{
                  marginLeft: 16,
                  width: 100,
                  backgroundColor: Colors.primary["500"]
                }}
              />
            </InputActionsContainer>
          </View>
          {keyboardVisible && <View style={{ flex: 1 }} />}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ActionsInput = ({
  showModal,
  values,
  onChange,
  onCancel,
  keyboardVisible
}) => {
  const [twitter, setTwitter] = useState(values.twitter);
  const [website, setWebsite] = useState(values.website);
  const [tickets, setTickets] = useState(values.tickets);

  return (
    <Modal visible={showModal} animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              padding: 24,
              justifyContent: keyboardVisible ? "flex-end" : "center",
              alignItems: "stretch",
              height: "100%"
            }}
          >
            <Input
              value={twitter}
              onChangeText={text => setTwitter(text)}
              errorMessage="Twitter"
              errorStyle={styles.inputErrorStyle}
              inputContainerStyle={styles.inputContainerContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.inputContainerStyle}
            />
            <Input
              value={website}
              errorMessage="Website"
              onChangeText={text => setWebsite(text.toLowerCase())}
              errorStyle={styles.inputErrorStyle}
              inputContainerStyle={styles.inputContainerContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={{ marginTop: 48 }}
            />
            <Input
              value={tickets}
              errorMessage="Tickets"
              onChangeText={text => setTickets(text.toLowerCase())}
              errorStyle={styles.inputErrorStyle}
              inputContainerStyle={styles.inputContainerContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={{ marginTop: 48 }}
            />
            <InputActionsContainer>
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
                  fontFamily: "montserrat-bold",
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
                  fontFamily: "montserrat-extra-bold",
                  color: Colors.grey["0"]
                }}
                buttonStyle={{
                  marginLeft: 16,
                  width: 100,
                  backgroundColor: Colors.primary["500"]
                }}
              />
            </InputActionsContainer>
          </View>
          {keyboardVisible && <View style={{ flex: 1 }} />}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const TasksForm = ({ showModal, onTaskCreated, onCancel, keyboardVisible }) => {
  const [newTask, setNewTask] = useState({});

  return (
    <Modal animationType="slide" visible={showModal}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              padding: 24,
              justifyContent: keyboardVisible ? "flex-end" : "center",
              paddingTop: keyboardVisible ? 56 : 24
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
              containerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              inputContainerStyle={styles.inputContainerContainerStyle}
            />
            <Text
              style={[
                {
                  marginTop: 32,
                  textAlign: "center",
                  fontFamily: "montserrat-extra-bold",
                  color: Colors.inactive,
                  fontSize: 18
                },
                keyboardVisible && { display: "none" }
              ]}
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
                selectedDayBackgroundColor: Colors.primary["500"],
                selectedDayTextColor: Colors.grey["0"],
                todayTextColor: Colors.primary["500"],
                dayTextColor: Colors.text,
                textDisabledColor: Colors.inactive,
                dotColor: Colors.primary["500"],
                selectedDotColor: Colors.grey["0"],
                arrowColor: Colors.primary["500"],
                monthTextColor: Colors.text,
                indicatorColor: Colors.primary["500"],
                textDayFontFamily: "montserrat-extra-bold",
                textMonthFontFamily: "montserrat-extra-bold",
                textDayHeaderFontFamily: "montserrat-extra-bold"
              }}
            />
            <InputActionsContainer style={keyboardVisible && { marginTop: 16 }}>
              <Button
                type="clear"
                title="Cancel"
                onPress={() => {
                  setNewTask({});
                  onCancel();
                }}
                titleStyle={{
                  fontFamily: "montserrat-bold",
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
                  fontFamily: "montserrat-extra-bold",
                  color: Colors.grey["0"]
                }}
                buttonStyle={{
                  marginLeft: 16,
                  width: 100,
                  backgroundColor: Colors.primary["500"]
                }}
              />
            </InputActionsContainer>
          </View>
          {keyboardVisible && <View style={{ flex: 1 }} />}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function EventDetailScreen({ navigation }) {
  const title = navigation.getParam("title");
  const eventId = navigation.getParam("eventId");

  const [event] = useEventConnection(eventId);
  const [keyboardVisible] = useKeyboardVisible();
  const [showActionBarModal, setShowActionBarModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [touchedData, setTouchedData] = useState(null);
  const [updating, setUpdating] = useState(true);

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

  const onCancel = () => {
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
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Actions>
          <Button
            onPress={() => navigation.goBack()}
            containerStyle={{ marginTop: 6, marginRight: "auto" }}
            titleStyle={{
              fontFamily: "montserrat-bold",
              color: Colors.inactive
            }}
            type="clear"
            title="Go Back"
          />
          {updating && <ActivityIndicator color={Colors.primary["500"]} />}
          <CancelButton onPress={onCancel}>
            <Icon
              size={24}
              type="feather"
              name="delete"
              color={Colors.primary["500"]}
            />
          </CancelButton>
        </Actions>
        <TitleContainer>
          <TouchableOpacity onPress={() => setShowTitleModal(true)}>
            <Title>{event ? event.title : title}</Title>
          </TouchableOpacity>
        </TitleContainer>
        {event && (
          <EventDatesContainer>
            <DatesPicker
              style={{ marginTop: -8 }}
              required={false}
              value={event.dates}
              onDatesSelected={value => {
                setTouchedData({ dates: value });
              }}
            />
          </EventDatesContainer>
        )}
        {event && (
          <WeatherContainer>
            <Weather forecast={event.weather} />
          </WeatherContainer>
        )}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {event && (
            <View>
              <ContactsContainer>
                <Contacts
                  showControls={true}
                  contacts={event.contacts}
                  onContactsSelected={contacts => {
                    setTouchedData({
                      contacts
                    });
                  }}
                />
              </ContactsContainer>
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
              <ActionBarContainer>
                <EditActionsButton onPress={() => setShowActionBarModal(true)}>
                  <Icon
                    size={16}
                    type="feather"
                    name="edit"
                    color={Colors.primary["700"]}
                  />
                </EditActionsButton>
                <ActionBar style={{ flex: 1 }} event={event} />
              </ActionBarContainer>
              <View>
                {!!event.tasks.items.length && (
                  <Tasks showDeleteButton tasks={event.tasks.items} />
                )}
                <AddTaskButton onPress={() => setShowTasksModal(true)}>
                  <AddTaskButtonText>Add Task</AddTaskButtonText>
                  <Feather
                    name="plus"
                    color={Colors.primary["500"]}
                    size={20}
                  />
                </AddTaskButton>
              </View>
            </View>
          )}
        </ScrollView>
        {event && (
          <View>
            <TitleInput
              keyboardVisible={keyboardVisible}
              value={event.title}
              showModal={showTitleModal}
              onCancel={() => setShowTitleModal(false)}
              onChange={value => {
                setTouchedData({ title: value });
                setShowTitleModal(false);
              }}
            />
            <LocationInput
              keyboardVisible={keyboardVisible}
              value={event.venue}
              showModal={showVenueModal}
              onCancel={() => setShowVenueModal(false)}
              onChange={value => {
                setTouchedData({ venue: value });
                setShowVenueModal(false);
              }}
            />
            <LocationInput
              keyboardVisible={keyboardVisible}
              value={event.hotel}
              showModal={showHotelModal}
              onCancel={() => setShowHotelModal(false)}
              onChange={value => {
                setTouchedData({ hotel: value });
                setShowHotelModal(false);
              }}
            />
            <ActionsInput
              keyboardVisible={keyboardVisible}
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
              keyboardVisible={keyboardVisible}
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

const styles = StyleSheet.create({
  inputErrorStyle: { color: Colors.primary["500"] },
  inputContainerContainerStyle: {
    borderBottomColor: Colors.primary["500"]
  },
  inputContainerStyle: {
    marginTop: "auto"
  },
  inputStyle: {
    fontSize: 24,
    color: Colors.primary["500"],
    fontFamily: "montserrat-extra-bold"
  }
});
