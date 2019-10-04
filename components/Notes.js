import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  View,
  Modal
} from "react-native";
import { Input, Button } from "react-native-elements";
import { Feather } from "@expo/vector-icons";
import styled from "@emotion/native";
import Markdown from "react-native-markdown-renderer";

import Colors from "../constants/Colors";

const AddNotes = styled.TouchableOpacity`
  align-items: center;
  background-color: ${Colors.grey["0"]};
  border-color: ${Colors.primary["500"]};
  border-radius: 2px;
  border-style: dashed;
  border-width: 1px;
  flex-direction: row;
  justify-content: center;
  margin: 16px;
  padding: 16px;
`;

const AddNotesButtonText = styled.Text`
  font-size: 18px;
  color: ${Colors.primary["500"]};
  font-family: "montserrat-extra-bold";
`;

export default ({ notes: value, onNotesAdded = () => {} }) => {
  const [notes, setNotes] = useState(() => value);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <React.Fragment>
      {!!notes && (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8
          }}
          activeOpacity={0.6}
          onPress={() => setShowPicker(true)}
        >
          <Feather
            size={24}
            style={{ marginRight: 16 }}
            name="file-text"
            color={Colors.primary["700"]}
          />
          <Markdown style={markdownStyles}>{notes}</Markdown>
        </TouchableOpacity>
      )}
      {!notes && (
        <AddNotes onPress={() => setShowPicker(true)}>
          <AddNotesButtonText>Add Notes</AddNotesButtonText>
          <Feather name="plus" color={Colors.primary["500"]} size={20} />
        </AddNotes>
      )}
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              padding: 24
            }}
          >
            <Input
              autoFocus
              multiline
              placeholder="Notes"
              value={notes}
              containerStyle={styles.containerStyle}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              onChangeText={text => setNotes(text)}
            />
            <Button
              title="Done"
              onPress={() => {
                onNotesAdded(notes);
                setShowPicker(false);
              }}
              titleStyle={{
                fontFamily: "montserrat-extra-bold",
                color: Colors.grey["0"]
              }}
              buttonStyle={{
                backgroundColor: Colors.primary["500"],
                marginBottom: 16
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    paddingHorizontal: 0,
    flex: 1
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    paddingVertical: 8,
    alignItems: "flex-start"
  },
  inputStyle: {
    fontSize: 20,
    color: Colors.primary["600"],
    fontFamily: "montserrat-bold",
    paddingTop: 0,
    alignSelf: "flex-start",
    minHeight: 20
  },
  doneButtonContainerStyle: {
    marginTop: "auto"
  },
  doneButtonStyle: {
    marginVertical: 24,
    backgroundColor: Colors.primary["500"]
  },
  doneButtonTitleStyle: {
    fontFamily: "montserrat-extra-bold"
  }
});

const markdownStyles = StyleSheet.create({
  heading1: {
    fontFamily: "montserrat-bold",
    fontSize: 18,
    marginBottom: 8
  },
  heading2: {
    fontFamily: "montserrat-bold",
    fontSize: 16,
    marginBottom: 8
  },
  heading3: {
    fontFamily: "montserrat-bold",
    fontSize: 14,
    marginBottom: 8
  },
  heading4: {
    fontFamily: "montserrat-bold",
    fontSize: 13,
    marginBottom: 8
  },
  heading5: {
    fontFamily: "montserrat-bold",
    fontSize: 12,
    marginBottom: 8
  },
  heading6: {
    fontFamily: "montserrat-bold",
    fontSize: 10,
    marginBottom: 8
  },
  text: {
    color: Colors.primary["500"]
  },
  link: {
    color: Colors.primary["300"]
  },
  blocklink: {},
  em: {
    fontFamily: "montserrat-bold"
  },
  paragraph: { marginTop: 0, marginBottom: 8 },
  listUnorderedItemIcon: { lineHeight: 16, marginHorizontal: 8 },
  listOrderedItemIcon: { lineHeight: 16, marginHorizontal: 8 }
});
