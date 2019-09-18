import React, { useState } from "react";
import { Alert, ActivityIndicator, TouchableOpacity, View } from "react-native";
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
  color: ${Colors.tintColor};
`;

export default ({ tasks, showDeleteButton }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={async () => {
                  if (isUpdating) return;

                  setActiveIndex(index);
                  setIsUpdating(true);

                  await API.graphql(
                    graphqlOperation(updateTask, {
                      input: {
                        id: task.id,
                        completed: !task.completed
                      }
                    })
                  );

                  setIsUpdating(false);
                  setActiveIndex(null);
                }}
                style={{
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {isUpdating && activeIndex === index ? (
                  <ActivityIndicator color={Colors.tintColor} />
                ) : (
                  <Feather
                    name={task.completed ? "check" : "square"}
                    color={Colors.tintColor}
                    size={20}
                  />
                )}
              </TouchableOpacity>
              {showDeleteButton && (
                <TouchableOpacity
                  onPress={async () => {
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
                                id: task.id
                              }
                            })
                          );

                          setIsDeleting(false);
                          setActiveIndex(null);
                        }
                      }
                    ]);
                  }}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 8
                  }}
                >
                  {isDeleting && activeIndex === index ? (
                    <ActivityIndicator color={Colors.tintColor} />
                  ) : (
                    <Feather name="delete" color={Colors.tintColor} size={20} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Task>
        );
      })}
    </Tasks>
  );
};
