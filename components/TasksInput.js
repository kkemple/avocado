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
import parse from "date-fns/parse";
import formatDistance from "date-fns/formatDistance";
import uuid from "uuid/v4";

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
  font-family: "montserrat-bold";
`;

const TaskDueDate = styled.Text`
  color: ${Colors.primary["600"]};
  font-family: "montserrat-regular";
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

  const AddTasksButton = styled.TouchableOpacity`
    align-items: center;
    align-self: flex-start;
    background-color: ${Colors.grey["0"]};
    border-radius: 28px;
    box-shadow: 1px 1px 1px ${Colors.shadow};
    height: 52px;
    justify-content: center;
    margin-bottom: 16px;
    margin: 8px;
    width: 52px;
  `;

  return (
    <View>
      <View>
        <AddTasksButton onPress={() => setShowPicker(true)}>
          <Icon type="feather" name="plus" color={Colors.primary["500"]} />
        </AddTasksButton>
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
                <Icon
                  name="delete"
                  type="feather"
                  color={Colors.primary["500"]}
                />
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
                color: Colors.primary["500"],
                fontFamily: "montserrat-extra-bold",
                fontSize: 24
              }}
              inputContainerStyle={{
                borderBottomColor: Colors.primary["500"]
              }}
            />
            <Text
              style={{
                marginTop: 32,
                textAlign: "center",
                fontFamily: "montserrat-extra-bold",
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
                selectedDayBackgroundColor: Colors.primary["500"],
                selectedDayTextColor: Colors.grey["0"],
                todayTextColor: Colors.primary["500"],
                dayTextColor: Colors.text,
                textDisabledColor: Colors.primary["200"],
                dotColor: Colors.primary["500"],
                selectedDotColor: Colors.grey["0"],
                monthTextColor: Colors.text,
                indicatorColor: Colors.primary["500"],
                agendaDayTextColor: Colors.primary["500"],
                agendaDayNumColor: Colors.primary["500"],
                agendaTodayColor: Colors.primary["500"],
                agendaKnobColor: Colors.primary["200"],
                textDayFontFamily: "montserrat-regular",
                textMonthFontFamily: "montserrat-bold",
                textDayHeaderFontFamily: "montserrat-bold"
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
                backgroundColor: Colors.primary["500"]
              }}
              titleStyle={{
                fontFamily: "montserrat-extra-bold"
              }}
              title="Done"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
