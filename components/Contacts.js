import React, { useState, useEffect } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Icon, Avatar, ListItem, Button } from "react-native-elements";
import styled from "@emotion/native";
import * as DeviceContacts from "expo-contacts";
import * as Sharing from "expo-sharing";

import Colors from "../constants/Colors";

const buildTitle = contact => {
  const f = contact.firstName.substring(0, 1).toUpperCase();
  const l = contact.lastName.substring(0, 1).toUpperCase();

  return `${f}${l}`;
};

const Contacts = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-vertical: 8;
`;

const ContactButton = styled.TouchableOpacity`
  margin-right: 8px;
  justify-content: center;
  align-items: center;
`;

const EditContactsButton = styled.TouchableOpacity`
  align-items: center;
  align-self: flex-start;
  background-color: ${Colors.grey["0"]};
  border-radius: ${props => (props.size === "medium" ? "28px" : "20px")};
  box-shadow: 1px 1px 1px ${Colors.shadow};
  height: ${props => (props.size === "medium" ? "52px" : "36px")};
  justify-content: center;
  margin: 8px;
  width: ${props => (props.size === "medium" ? "52px" : "36px")};
`;

const ContactsList = ({ onContactSelected = () => {}, value = [] }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(value);

  useEffect(() => {
    DeviceContacts.getContactsAsync()
      .then(result => setContacts(result.data))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    onContactSelected(selectedContacts);
  }, [selectedContacts, setSelectedContacts]);

  return (
    <View>
      {contacts.map(contact => {
        const isSelected = !!selectedContacts.find(c => c.id === contact.id);
        const data = {
          id: contact.id,
          subtitle: contact[DeviceContacts.Fields.Emails]
            ? contact[DeviceContacts.Fields.Emails][0].email
            : "",
          image: contact[DeviceContacts.Fields.Image],
          name: contact[DeviceContacts.Fields.Name],
          firstName: contact[DeviceContacts.Fields.FirstName],
          lastName: contact[DeviceContacts.Fields.LastName],
          emails: contact[DeviceContacts.Fields.Emails]
        };

        return (
          <TouchableOpacity
            key={contact.id}
            activeOpacity={0.6}
            onPress={() => {
              if (isSelected) {
                setSelectedContacts(
                  selectedContacts.filter(c => c.id !== contact.id)
                );
              } else {
                setSelectedContacts([...selectedContacts, data]);
              }
            }}
          >
            <ListItem
              bottomDivider
              title={data.name}
              subtitle={data.subtitle}
              containerStyle={styles.listItemContainerStyles}
              titleStyle={[
                styles.listItemTitleStyles,
                { color: isSelected ? Colors.primary["500"] : Colors.text }
              ]}
              subtitleStyle={[
                styles.listItemSubtitleStyles,
                { color: isSelected ? Colors.primary["500"] : Colors.text }
              ]}
              leftAvatar={{
                source: {
                  uri: data.image
                },
                placeholderStyle: {
                  backgroundColor: isSelected
                    ? Colors.primary["500"]
                    : Colors.inactive
                }
              }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Contact = ({ contact, size = "small" }) => (
  <ContactButton
    activeOpacity={0.6}
    onPress={async () => {
      const localUri = await Contacts.writeContactToFileAsync({
        id: contact.id
      });
      Sharing.shareAsync(localUri);
    }}
  >
    <Avatar
      rounded
      key={contact.id}
      size={size}
      title={contact.image ? "" : buildTitle(contact)}
      source={contact.image ? { uri: contact.image } : null}
      titleStyle={{
        fontFamily: "montserrat-black"
      }}
      overlayContainerStyle={{
        backgroundColor: Colors.primary["500"]
      }}
    />
  </ContactButton>
);

export default ({
  size,
  showControls = false,
  contacts: value = [],
  onContactsSelected = () => {}
}) => {
  const [contacts, setContacts] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    Promise.all(value.map(id => DeviceContacts.getContactByIdAsync(id)))
      .then(result => setContacts(result))
      .catch(error => console.log(error));
  }, [value]);

  return (
    <Contacts>
      {showControls && (
        <EditContactsButton
          size={size}
          activeOpacity={0.6}
          onPress={() => setShowPicker(true)}
        >
          <Icon
            size={size === "medium" ? 24 : 16}
            name="plus"
            type="feather"
            color={Colors.primary["700"]}
          />
        </EditContactsButton>
      )}
      {contacts.map(contact => (
        <Contact size={size} key={contact.id} contact={contact} />
      ))}
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              paddingVertical: 24
            }}
          >
            {showPicker && (
              <ScrollView>
                <ContactsList
                  value={contacts}
                  onContactSelected={contacts => {
                    setContacts(contacts);
                  }}
                />
              </ScrollView>
            )}
            <Button
              title="Done"
              activeOpacity={0.6}
              onPress={() => {
                onContactsSelected(contacts.map(c => c.id));
                setShowPicker(false);
              }}
              buttonStyle={styles.doneButtonStyle}
              titleStyle={styles.doneButtonTitleStyle}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </Contacts>
  );
};

const styles = StyleSheet.create({
  listItemContainerStyles: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  listItemTitleStyles: {
    marginTop: 4,
    fontFamily: "montserrat-bold",
    fontSize: 14,
    lineHeight: 15
  },
  listItemSubtitleStyles: {
    fontFamily: "montserrat-regular",
    fontSize: 12,
    lineHeight: 13
  },
  doneButtonStyle: {
    margin: 24,
    backgroundColor: Colors.primary["500"]
  },
  doneButtonTitleStyle: {
    fontFamily: "montserrat-extra-bold"
  }
});
