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
import TasksScreen from "../screens/TasksScreen";
import ToolsScreen from "../screens/ToolsScreen";
import Colors from "../constants/Colors";
import EventDetailScreen from "../screens/EventDetail";

const config = Platform.select({
  web: { headerMode: "screen" },
  default: {}
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    EventDetail: EventDetailScreen
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: "Upcoming",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name="access-time" />
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
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="event" />
};

EventsStack.path = "";

const TasksStack = createStackNavigator(
  {
    Tasks: TasksScreen
  },
  config
);

TasksStack.navigationOptions = {
  tabBarLabel: "Translate",
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="translate" />
};

TasksStack.path = "";

const ToolsStack = createStackNavigator(
  {
    Tools: ToolsScreen
  },
  config
);

ToolsStack.navigationOptions = {
  tabBarLabel: "Settings",
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="settings" />
};

ToolsStack.path = "";

const tabNavigator = createBottomTabNavigator(
  {
    HomeStack,
    EventsStack,
    TasksStack,
    ToolsStack
  },
  {
    initialRouteName: "HomeStack",
    tabBarOptions: {
      activeTintColor: Colors.tabIconSelected,
      inactiveTintColor: Colors.tabIconDefault,
      style: {
        backgroundColor: Colors.foreground
      },
      labelStyle: {
        fontWeight: "bold"
      }
    }
  }
);

tabNavigator.path = "";

export default tabNavigator;
