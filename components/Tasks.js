import React, { useState } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import styled from "@emotion/native";
import { Feather } from "@expo/vector-icons";
import parse from "date-fns/parse";
import formatDistance from "date-fns/formatDistance";
import { API, graphqlOperation } from "aws-amplify";

import Colors from "../constants/Colors";
import { updateTask, deleteTask } from "../graphql/mutations";

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
  font-family: "montserrat-medium";
`;

const TaskDueDate = styled.Text`
  color: ${Colors.primary["600"]};
  font-family: "montserrat-regular";
`;

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Action = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

const Item = ({ task: originalTaskState, showDeleteButton }) => {
  const [task, setTask] = useState(originalTaskState);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const timeTillDue = formatDistance(
    new Date(),
    parse(task.due, "yyyy-MM-dd", new Date())
  );

  const onDelete = async () => {
    if (isDeleting || isUpdating) return;

    Alert.alert("Delete Event", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          setIsDeleting(true);
          setTask(null);

          try {
            await API.graphql(
              graphqlOperation(deleteTask, {
                input: {
                  id: task.id
                }
              })
            );
          } catch (error) {
            Alert.alert(error.message);
            setTask(task);
            setIsDeleting(false);
          }
        }
      }
    ]);
  };

  const onToggleCompleted = async () => {
    if (isUpdating || isDeleting) return;

    setIsUpdating(true);
    setTask({ ...task, completed: !task.completed });

    try {
      await API.graphql(
        graphqlOperation(updateTask, {
          input: {
            id: task.id,
            completed: !task.completed
          }
        })
      );
      setIsUpdating(false);
    } catch (error) {
      Alert.alert(error.message);
      setTask(task);
      setIsUpdating(false);
    }
  };

  return !task ? null : (
    <Task key={task.id}>
      <View>
        <TaskTitle>{task.title}</TaskTitle>
        <TaskDueDate>Due in {timeTillDue}</TaskDueDate>
      </View>
      <Actions>
        <Action activeOpacity={0.6} onPress={onToggleCompleted}>
          {isUpdating ? (
            <ActivityIndicator color={Colors.primary["500"]} />
          ) : (
            <Feather
              name={task.completed ? "check" : "square"}
              color={Colors.primary["500"]}
              size={20}
            />
          )}
        </Action>
        {showDeleteButton && (
          <Action
            activeOpacity={0.6}
            onPress={onDelete}
            style={{ marginLeft: 8 }}
          >
            {isDeleting ? (
              <ActivityIndicator color={Colors.primary["500"]} />
            ) : (
              <Feather name="delete" color={Colors.primary["500"]} size={20} />
            )}
          </Action>
        )}
      </Actions>
    </Task>
  );
};

export default ({ tasks, showDeleteButton }) => {
  return (
    <Tasks>
      {tasks.map(task => (
        <Item key={task.id} showDeleteButton={showDeleteButton} task={task} />
      ))}
    </Tasks>
  );
};
