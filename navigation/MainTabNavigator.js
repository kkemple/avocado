import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import EventsScreen from "../screens/EventsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import TranslateScreen from "../screens/TranslateScreen";
import SettingsScreen from "../screens/SettingsScreen";
import Colors from "../constants/Colors";
import EventDetailScreen from "../screens/EventDetail";
import EventsMapScreen from "../screens/EventsMapScreen";

const config = Platform.select({
  web: { headerMode: "screen" },
  default: {}
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    EventDetail: EventDetailScreen,
    CreateEvent: CreateEventScreen
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: "Upcoming",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name="calendar-clock" />
  )
};

HomeStack.path = "";

const EventsStack = createStackNavigator(
  {
    Events: EventsScreen,
    CreateEvent: CreateEventScreen,
    EventDetail: EventDetailScreen
  },
  { ...config, initialRouteName: "Events" }
);

EventsStack.navigationOptions = {
  tabBarLabel: "Events",
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="calendar" />
};

EventsStack.path = "";

const MapStack = createStackNavigator(
  {
    Map: EventsMapScreen,
    EventDetail: EventDetailScreen
  },
  { ...config, initialRouteName: "Map" }
);

MapStack.navigationOptions = {
  tabBarLabel: "Locations",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name="map-marker-multiple" />
  )
};

MapStack.path = "";

const TranslateStack = createStackNavigator(
  {
    Translate: TranslateScreen
  },
  config
);

TranslateStack.navigationOptions = {
  tabBarLabel: "Translate",
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="translate" />
};

TranslateStack.path = "";

const SettingsStack = createStackNavigator(
  {
    Settings: SettingsScreen
  },
  config
);

SettingsStack.navigationOptions = {
  tabBarLabel: "Settings",
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="settings" />
};

SettingsStack.path = "";

const tabNavigator = createBottomTabNavigator(
  {
    HomeStack,
    MapStack,
    EventsStack,
    TranslateStack,
    SettingsStack
  },
  {
    initialRouteName: "HomeStack",
    tabBarOptions: {
      keyboardHidesTabBar: true,
      activeTintColor: Colors.tabIconSelected,
      inactiveTintColor: Colors.tabIconDefault,
      style: {
        backgroundColor: Colors.tabBar
      },
      labelStyle: {
        fontFamily: "montserrat-bold"
      }
    }
  }
);

tabNavigator.path = "";

export default tabNavigator;
