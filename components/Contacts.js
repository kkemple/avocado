import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  SafeAreaView,
  Modal,
  ScrollView
} from "react-native";
import { Icon, Avatar, ListItem, Button } from "react-native-elements";
import * as Contacts from "expo-contacts";
import * as Sharing from "expo-sharing";

import Colors from "../constants/Colors";

const buildTitle = contact => {
  const f = contact.firstName.substring(0, 1).toUpperCase();
  const l = contact.lastName.substring(0, 1).toUpperCase();

  return `${f}${l}`;
};

const ContactsList = ({ onContactSelected = () => {}, value = [] }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(value);

  useEffect(() => {
    Contacts.getContactsAsync()
      .then(result => setContacts(result.data))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    onContactSelected(selectedContacts);
  }, [selectedContacts, setSelectedContacts]);

  return (
    <View>
      {contacts.map(contact => {
        const data = {
          id: contact.id,
          subtitle: contact[Contacts.Fields.Emails]
            ? contact[Contacts.Fields.Emails][0].email
            : "",
          image: contact[Contacts.Fields.Image],
          name: contact[Contacts.Fields.Name],
          firstName: contact[Contacts.Fields.FirstName],
          lastName: contact[Contacts.Fields.LastName],
          emails: contact[Contacts.Fields.Emails]
        };
        const isSelected = !!selectedContacts.find(c => c.id === contact.id);

        return (
          <TouchableOpacity
            onPress={() => {
              if (isSelected) {
                setSelectedContacts(
                  selectedContacts.filter(c => c.id !== contact.id)
                );
              } else {
                setSelectedContacts([...selectedContacts, data]);
              }
            }}
            key={contact.id}
          >
            <ListItem
              bottomDivider
              title={data.name}
              subtitle={data.subtitle}
              containerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 8
              }}
              titleStyle={{
                marginTop: 4,
                fontFamily: "overpass-bold",
                fontSize: 14,
                lineHeight: 15,
                color: isSelected ? Colors.tintColor : Colors.text
              }}
              subtitleStyle={{
                fontFamily: "overpass-regular",
                fontSize: 12,
                lineHeight: 13,
                color: isSelected ? Colors.tintColor : Colors.text
              }}
              leftAvatar={{
                source: {
                  uri: data.image
                },
                placeholderStyle: {
                  backgroundColor: isSelected
                    ? Colors.tintColor
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
  <TouchableOpacity
    onPress={async () => {
      const localUri = await Contacts.writeContactToFileAsync({
        id: contact.id
      });
      Sharing.shareAsync(localUri);
    }}
    style={{
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <Avatar
      rounded
      key={contact.id}
      size={size}
      title={contact.image ? "" : buildTitle(contact)}
      source={contact.image ? { uri: contact.image } : null}
      titleStyle={{
        fontFamily: "permanent-marker"
      }}
      overlayContainerStyle={{
        backgroundColor: Colors.tintColor
      }}
    />
  </TouchableOpacity>
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
    Promise.all(value.map(id => Contacts.getContactByIdAsync(id)))
      .then(result => setContacts(result))
      .catch(error => console.log(error));
  }, [value]);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8
      }}
    >
      {showControls && (
        <TouchableOpacity
          style={{ marginRight: 8 }}
          onPress={() => setShowPicker(true)}
        >
          <Icon
            size={size === "medium" ? 24 : 16}
            name="add"
            raised
            color={Colors.tintColor}
          />
        </TouchableOpacity>
      )}
      {contacts.map(contact => (
        <Contact size={size} key={contact.id} contact={contact} />
      ))}
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView>
          <View
            style={{
              height: "100%",
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
              onPress={() => {
                onContactsSelected(contacts.map(c => c.id));
                setShowPicker(false);
              }}
              buttonStyle={{
                margin: 24,
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
