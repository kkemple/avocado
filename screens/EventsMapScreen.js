import React, { createRef, useRef, useState, useEffect } from "react";
import {
  TouchableOpacity,
  Image,
  View,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar
} from "react-native";
import { API, graphqlOperation } from "aws-amplify";
import MapView, { Marker } from "react-native-maps";
import styled from "@emotion/native";
import parse from "date-fns/parse";
import isBefore from "date-fns/isBefore";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";

import Loader from "../components/Loader";
import Colors from "../constants/Colors";
import { listEvents } from "../graphql/queries";
import markerImage from "../assets/images/map-marker-reverse.png";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const getDisplayDates = (start, end) => {
  if (start === end) {
    return format(start, "MMM do");
  }

  return `${format(start, "MMM do")} / ${format(end, "MMM do")}`;
};

const getTimeToEvent = startDate => {
  return formatDistance(new Date(), startDate);
};

const EventTitle = styled.Text`
  color: ${Colors.grey["0"]};
  font-size: 20px;
  font-family: "permanent-marker";
`;

const EventDates = styled.Text`
  color: ${Colors.grey["0"]};
  font-family: "overpass-bold";
  font-size: 14px;
`;

const EventDatesContainer = styled.View`
  flex-direction: row;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 48px;
  left: 16px;
  justify-content: center;
  align-items: center;
`;

const Item = ({ event, onPress, width }) => {
  const start = parse(event.dates.start, "yyyy-MM-dd", new Date());
  const end = parse(event.dates.end, "yyyy-MM-dd", new Date());

  const displayDates = getDisplayDates(start, end);
  const displayTimeToEvent = getTimeToEvent(start);
  const eventInPast = isBefore(start, new Date());

  return (
    <View
      style={{
        width
      }}
    >
      <TouchableOpacity
        activeOpacity={0.6}
        style={{
          flex: 1,
          marginHorizontal: 16,
          backgroundColor: Colors.primary["500"],
          padding: 16,
          paddingBottom: 32,
          borderRadius: 4,
          elevation: 2,
          shadowColor: Colors.shadow,
          shadowOpacity: 1,
          shadowOffset: { x: 1, y: 1 },
          shadowRadius: 1
        }}
        activeOpacity={0.6}
        onPress={onPress}
      >
        <EventTitle>{event.title}</EventTitle>
        <EventDatesContainer>
          {eventInPast ? (
            <EventDates>
              {displayDates} - {displayTimeToEvent} ago
            </EventDates>
          ) : (
            <EventDates>
              {displayDates} - in {displayTimeToEvent}
            </EventDates>
          )}
        </EventDatesContainer>
      </TouchableOpacity>
    </View>
  );
};

export default function EventsMapScreen({ navigation }) {
  const [loaded, setLoaded] = useState(false);
  const [firstUpcomingEventFound, setFirstUpcomingEventFound] = useState(false);
  const [events, setEvents] = useState([]);
  const [index, setIndex] = useState(0);
  const [sortedEvents, setSortedEvents] = useState([]);
  const [animation] = useState(new Animated.Value(0));
  const { width: DEVICE_WIDTH } = Dimensions.get("window");
  const CARD_WIDTH = DEVICE_WIDTH - 64;
  const mapView = useRef();
  const timeout = useRef();
  const scrollView = createRef();

  useEffect(() => {
    API.graphql(graphqlOperation(listEvents))
      .then(result => {
        setEvents(result.data.listEvents.items);
        setLoaded(true);
      })
      .catch(error => console.log(error));
  }, [setEvents, setLoaded]);

  useEffect(() => {
    const sortedEvents = events.sort((a, b) => {
      if (a.dates.start < b.dates.start) return -1;
      if (a.dates.start > b.dates.start) return 1;
      return 0;
    });

    setSortedEvents(sortedEvents);
  }, [events, setEvents, setSortedEvents]);

  useEffect(() => {
    if (firstUpcomingEventFound || !sortedEvents.length || !scrollView.current)
      return;

    const today = new Date();
    const index = sortedEvents.findIndex(
      event =>
        !isBefore(parse(event.dates.start, "yyyy-MM-dd", new Date()), today)
    );

    scrollView.current.scrollTo({ x: CARD_WIDTH * index, animated: false });

    setTimeout(() => {
      setIndex(index);
      setFirstUpcomingEventFound(true);
    }, 0);
  }, [
    index,
    scrollView,
    sortedEvents,
    setSortedEvents,
    firstUpcomingEventFound,
    setFirstUpcomingEventFound
  ]);

  useEffect(() => {
    if (!sortedEvents.length || !mapView.current) return;

    const updateCamera = async () => {
      const camera = await mapView.current.getCamera();
      camera.center.latitude = sortedEvents[index].venue.location.lat;
      camera.center.longitude = sortedEvents[index].venue.location.lng;
      camera.pitch = 45;
      camera.heading = 0;
      camera.altitude = 10000;
      camera.zoom = 3;

      mapView.current.animateCamera(camera, { duration: 500 });
    };

    updateCamera();
  }, [index, sortedEvents]);

  const handleScroll = event => {
    if (timeout.current) clearTimeout(timeout.current);

    const value = event.nativeEvent.contentOffset.x;

    timeout.current = setTimeout(() => {
      let index = Math.floor(value / CARD_WIDTH + 0.3);

      if (index >= sortedEvents.length) {
        index = sortedEvents.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      setIndex(index);
      animation.setValue(index);
    }, 150);
  };

  return !loaded ? (
    <Loader />
  ) : (
    <View style={{ flex: 1, overflow: "hidden" }}>
      {!!sortedEvents.length && (
        <React.Fragment>
          <StatusBar barStyle="light-content" />
          <MapView
            provider="google"
            customMapStyle={require("../map-theme")}
            style={{ flex: 1 }}
            zoomControlEnabled={false}
            showsCompass={false}
            showsScale={false}
            showsBuildings={false}
            zoomEnabled={false}
            zoomTapEnabled={false}
            scrollEnabled={false}
            ref={mapView}
            initialCamera={{
              center: {
                latitude: sortedEvents[0].venue.location.lat,
                longitude: sortedEvents[0].venue.location.lng
              },
              pitch: 45,
              heading: 0,
              altitude: 10000,
              zoom: 3
            }}
          >
            {sortedEvents.map((event, eventIndex) => {
              const opacityStyles = {
                opacity: animation.interpolate({
                  inputRange: [eventIndex - 1, eventIndex, eventIndex + 1],
                  outputRange: [0.75, 1, 0.75],
                  extrapolate: "clamp"
                })
              };

              const scaleStyles = {
                transform: [
                  {
                    scale: animation.interpolate({
                      inputRange: [eventIndex - 1, eventIndex, eventIndex + 1],
                      outputRange: [0.75, 1, 0.75],
                      extrapolate: "clamp"
                    })
                  }
                ]
              };

              return (
                <Marker
                  key={event.id}
                  coordinate={{
                    latitude: event.venue.location.lat,
                    longitude: event.venue.location.lng
                  }}
                  title={event.name}
                  description={event.address}
                >
                  <Animated.View style={[{ padding: 8 }, scaleStyles]}>
                    <Animated.Image
                      style={[{ width: 40, height: 40 }, opacityStyles]}
                      source={markerImage}
                    />
                  </Animated.View>
                </Marker>
              );
            })}
          </MapView>
          <ScrollView
            ref={scrollView}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            onScroll={handleScroll}
            decelerationRate="fast"
            style={{
              position: "absolute",
              bottom: 30,
              paddingVertical: 10,
              width: CARD_WIDTH,
              paddingLeft: 32,
              overflow: "visible"
            }}
            contentContainerStyle={{
              alignItems: "stretch"
            }}
          >
            {sortedEvents.map(event => (
              <Item
                key={event.id}
                event={event}
                width={CARD_WIDTH}
                onPress={() => {
                  navigation.navigate("EventDetail", {
                    eventId: event.id,
                    title: event.title
                  });
                }}
              />
            ))}
          </ScrollView>
          <BackButton onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={30}
              color={Colors.grey["0"]}
            />
          </BackButton>
        </React.Fragment>
      )}
    </View>
  );
}

EventsMapScreen.navigationOptions = {
  header: null
};
