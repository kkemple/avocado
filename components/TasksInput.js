import React, { useState, useEffect } from "react";
import styled from "@emotion/native";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Modal
} from "react-native";
import { Button, Icon, Input } from "react-native-elements";
import { Calendar } from "react-native-calendars";
import formatDistance from "date-fns/formatDistance";

import Colors from "../constants/Colors";

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

export default ({ onTasksCreated = () => {} }) => {
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
