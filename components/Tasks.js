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
  font-family: "overpass-bold";
`;

const TaskDueDate = styled.Text`
  color: ${Colors.primary["600"]};
`;

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Action = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

export default ({ tasks, showDeleteButton }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const onDelete = (id, index) => async () => {
    if (isDeleting) return;

    Alert.alert("Delete Event", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          setActiveIndex(index);
          setIsDeleting(true);

          await API.graphql(
            graphqlOperation(deleteTask, {
              input: {
                id
              }
            })
          );

          setIsDeleting(false);
          setActiveIndex(null);
        }
      }
    ]);
  };

  const onToggleCompleted = (id, current, index) => async () => {
    if (isUpdating) return;

    setActiveIndex(index);
    setIsUpdating(true);

    await API.graphql(
      graphqlOperation(updateTask, {
        input: {
          id,
          completed: !current
        }
      })
    );

    setIsUpdating(false);
    setActiveIndex(null);
  };

  return (
    <Tasks>
      {tasks.map((task, index) => {
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
            <Actions>
              <Action
                activeOpacity={0.6}
                onPress={onToggleCompleted(task.id, task.completed, index)}
              >
                {isUpdating && activeIndex === index ? (
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
                  onPress={onDelete(task.id, index)}
                  style={{ marginLeft: 8 }}
                >
                  {isDeleting && activeIndex === index ? (
                    <ActivityIndicator color={Colors.primary["500"]} />
                  ) : (
                    <Feather
                      name="delete"
                      color={Colors.primary["500"]}
                      size={20}
                    />
                  )}
                </Action>
              )}
            </Actions>
          </Task>
        );
      })}
    </Tasks>
  );
};
