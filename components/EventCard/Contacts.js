import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import * as Contacts from "expo-contacts";
import * as Sharing from "expo-sharing";

import Colors from "../../constants/Colors";

const buildTitle = contact => {
  const f = contact.firstName.substring(0, 1).toUpperCase();
  const l = contact.lastName.substring(0, 1).toUpperCase();

  return `${f}${l}`;
};

const Avatar = props => (
  <TouchableOpacity
    onPress={async () => {
      const localUri = await Contacts.writeContactToFileAsync({
        id: props.contactId
      });
      Sharing.shareAsync(localUri);
    }}
    style={{
      width: 40,
      height: 40,
      backgroundColor: Colors.tintColor,
      borderRadius: 20,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <Text
      style={{
        color: Colors.foreground,
        fontFamily: "permanent-marker",
        fontSize: 18
      }}
    >
      {props.title}
    </Text>
  </TouchableOpacity>
);

export default props => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    Promise.all(props.contacts.map(id => Contacts.getContactByIdAsync(id)))
      .then(result => setContacts(result))
      .catch(error => console.log(error));
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.borders
      }}
    >
      {contacts.map(contact => (
        <Avatar
          key={contact.id}
          contactId={contact.id}
          title={buildTitle(contact)}
        />
      ))}
    </View>
  );
};
