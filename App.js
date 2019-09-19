import { AppLoading } from "expo";
import * as Font from "expo-font";
import React, { useState, useEffect } from "react";
import { YellowBox, Platform, StatusBar, StyleSheet, View } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather
} from "@expo/vector-icons";
import Amplify, { Hub } from "aws-amplify";
import { AmazonAIPredictionsProvider } from "@aws-amplify/predictions";
import { withAuthenticator, AmplifyTheme } from "aws-amplify-react-native";

YellowBox.ignoreWarnings([
  "Possible Unhandled Promise Rejection",
  "Remote debugger",
  "ReactNative.NativeModules.LottieAnimationView"
]);

import AppNavigator from "./navigation/AppNavigator";
import amplifyConfig from "./aws-exports";
import Colors from "./constants/Colors";

Amplify.configure(amplifyConfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const theme = {
  ...AmplifyTheme,
  ...StyleSheet.create({
    container: {
      ...AmplifyTheme.container,
      backgroundColor: Colors.foreground,
      marginTop: 16,
      paddingTop: 0
    },
    section: { ...AmplifyTheme.section, paddingTop: 0 },
    button: {
      ...AmplifyTheme.button,
      backgroundColor: Colors.tintColor,
      borderRadius: 4
    },
    buttonDisabled: {
      ...AmplifyTheme.buttonDisabled,
      backgroundColor: Colors.tintColor
    },
    sectionFooterLink: {
      ...AmplifyTheme.sectionFooterLink,
      color: Colors.tintColor
    },
    input: {
      ...AmplifyTheme.input,
      color: Colors.tintColor,
      borderColor: Colors.tintColor,
      fontFamily: "overpass-bold"
    },
    inputLabel: {
      ...AmplifyTheme.inputLabel,
      color: Colors.tintColor,
      fontFamily: "overpass-bold"
    },
    sectionHeaderText: {
      ...AmplifyTheme.sectionHeaderText,
      color: Colors.tintColor,
      fontFamily: "permanent-marker"
    },
    greetingMessage: {
      color: Colors.tintColor
    }
  })
};

const AppWithAuthState = props => {
  useEffect(() => {
    const onAuthEvent = async data => {
      const {
        payload: { event }
      } = data;

      if (event === "signOut") {
        props.onStateChange("signedOut", null);
      }
    };

    Hub.listen("auth", onAuthEvent);

    return () => Hub.remove("auth", onAuthEvent);
  }, []);

  return <AppNavigator />;
};

const AppWithAuth = withAuthenticator(
  AppWithAuthState,
  {
    usernameAttributes: "email",
    signUpConfig: {
      hiddenDefaults: ["phone_number"]
    }
  },
  null,
  null,
  theme
);

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === "ios" && <StatusBar barStyle="dark-content" />}
        <AppWithAuth />
      </View>
    );
  }
}

async function loadResourcesAsync() {
  await Promise.all([
    // Asset.loadAsync([
    //   require("./assets/images/robot-dev.png"),
    //   require("./assets/images/robot-prod.png")
    // ]),
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      ...FontAwesome5.font,
      ...MaterialIcons.font,
      ...MaterialCommunityIcons.font,
      ...Feather.font,
      // We include SpaceMono because we use it in HomeScreen.js. Feel free to
      // remove this if you are not using it in your app
      "permanent-marker": require("./assets/fonts/PermanentMarker-Regular.ttf"),
      "overpass-regular": require("./assets/fonts/Overpass-Regular.ttf"),
      "overpass-light": require("./assets/fonts/Overpass-Light.ttf"),
      "overpass-bold": require("./assets/fonts/Overpass-Bold.ttf"),
      "overpass-black": require("./assets/fonts/Overpass-Black.ttf")
    })
  ]);
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  }
});
