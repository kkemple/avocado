import React from "react";
import { TouchableOpacity, SafeAreaView, View } from "react-native";
import styled from "@emotion/native";
import { FontAwesome5 } from "@expo/vector-icons";

import Colors from "../constants/Colors";

const Tasks = styled.View``;

const Task = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  padding: 8px 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.borders};
`;

const TaskTitle = styled.Text`
  font-family: "overpass-bold";
`;

const TaskDueDate = styled.Text`
  color: ${Colors.tintColor};
`;

const AddTaskButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 32px;
  right: 32px;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${Colors.tintColor};
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
`;

export default function TasksScreen() {
  /**
   * Go ahead and delete ExpoConfigView and replace it with your content;
   * we just wanted to give you a quick view of your config.
   */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tasks>
        <TouchableOpacity>
          <Task>
            <View>
              <TaskTitle>Order stickers and t-shirts</TaskTitle>
              <TaskDueDate>Due last week</TaskDueDate>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <FontAwesome5
                name="check-square"
                color={Colors.tintColor}
                size={20}
              />
            </View>
          </Task>
        </TouchableOpacity>
        <TouchableOpacity>
          <Task>
            <View>
              <TaskTitle>Review slides</TaskTitle>
              <TaskDueDate>Due in 3 days</TaskDueDate>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <FontAwesome5 name="square" color={Colors.tintColor} size={20} />
            </View>
          </Task>
        </TouchableOpacity>
      </Tasks>
      <AddTaskButton>
        <FontAwesome5 name="tasks" color={Colors.foreground} size={24} />
      </AddTaskButton>
    </SafeAreaView>
  );
}

TasksScreen.navigationOptions = {
  title: "Tasks",
  headerTintColor: Colors.tintColor,
  headerTitleStyle: {
    fontFamily: "permanent-marker",
    fontSize: 24
  }
};
