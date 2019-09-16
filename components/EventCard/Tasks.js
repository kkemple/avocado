import React, { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import styled from "@emotion/native";
import { FontAwesome5 } from "@expo/vector-icons";
import parse from "date-fns/parse";
import formatDistance from "date-fns/formatDistance";
import { API, graphqlOperation } from "aws-amplify";

import Colors from "../../constants/Colors";
import { updateTask } from "../../graphql/mutations";

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

export default props => (
  <Tasks>
    {props.tasks.map(task => {
      const timeTillDue = formatDistance(
        new Date(),
        parse(task.due, "yyyy-MM-dd", new Date())
      );

      const [isUpdating, setIsUpdating] = useState(false);

      return (
        <Task key={task.id}>
          <View>
            <TaskTitle>{task.title}</TaskTitle>
            <TaskDueDate>Due in {timeTillDue}</TaskDueDate>
          </View>
          <TouchableOpacity
            onPress={async () => {
              if (isUpdating) return;

              setIsUpdating(true);
              await API.graphql(
                graphqlOperation(updateTask, {
                  input: {
                    ...task,
                    completed: !task.completed
                  }
                })
              );
              setIsUpdating(false);
            }}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {isUpdating ? (
              <ActivityIndicator color={Colors.tintColor} />
            ) : (
              <FontAwesome5
                name={task.completed ? "check-square" : "square"}
                color={Colors.tintColor}
                size={20}
              />
            )}
          </TouchableOpacity>
        </Task>
      );
    })}
  </Tasks>
);
