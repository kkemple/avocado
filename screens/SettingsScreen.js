import React from "react";
import { Linking, TouchableOpacity, Text, View } from "react-native";
import { Button } from "react-native-elements";
import { SafeAreaView } from "react-navigation";
import { Auth } from "aws-amplify";
import { FontAwesome5 } from "@expo/vector-icons";

import Colors from "../constants/Colors";

export default function Settings() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8
          }}
        >
          <Text
            style={{
              fontFamily: "overpass-bold",
              color: Colors.text
            }}
          >
            Built with{" "}
          </Text>
          <View>
            <FontAwesome5
              style={{ marginBottom: -3 }}
              size={20}
              name="aws"
              color={Colors.text}
            />
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://aws-amplify.github.io")}
          >
            <Text
              style={{
                fontFamily: "overpass-bold",
                color: Colors.primary["300"]
              }}
            >
              {" "}
              Amplify
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8
            }}
          >
            <Text
              style={{
                fontFamily: "overpass-bold",
                color: Colors.text
              }}
            >
              A React Native app using with{" "}
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://expo.io")}
            >
              <Text
                style={{
                  fontFamily: "overpass-bold",
                  color: Colors.primary["300"]
                }}
              >
                Expo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text
              style={{
                fontFamily: "overpass-bold",
                color: Colors.text
              }}
            >
              Weather powered by{" "}
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://darksky.net/poweredby/")}
            >
              <Text
                style={{
                  fontFamily: "overpass-bold",
                  color: Colors.primary["300"]
                }}
              >
                Dark Sky
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Button
          onPress={() => {
            Auth.signOut();
          }}
          containerStyle={{ marginTop: "auto" }}
          buttonStyle={{
            backgroundColor: Colors.primary["500"]
          }}
          titleStyle={{
            fontFamily: "overpass-black"
          }}
          title="Log Out"
        />
      </View>
    </SafeAreaView>
  );
}

Settings.navigationOptions = {
  header: null
};
