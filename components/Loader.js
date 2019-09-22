import React, { useState, useEffect } from "react";
import { Animated, View } from "react-native";
import { Icon } from "react-native-elements";

import Colors from "../constants/Colors";

export default () => {
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ).start(() => {
      animatedValue.setValue(0);
    });

    return () => animatedValue.stopAnimation();
  }, [animatedValue]);

  const pulseAnimationStyles = {
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    }),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2]
        })
      }
    ]
  };

  const spinAnimationStyles = {
    transform: [
      {
        rotate: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"]
        })
      }
    ]
  };

  return (
    <View
      style={{
        flex: 1
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Animated.View
          style={[
            {
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: Colors.primary["500"]
            },
            pulseAnimationStyles
          ]}
        />
      </View>
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Animated.View
          style={[
            {
              justifyContent: "center",
              alignItems: "center",
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: Colors.grey["0"]
            },
            spinAnimationStyles
          ]}
        >
          <Icon
            name="loading"
            type="material-community"
            color={Colors.primary["500"]}
          />
        </Animated.View>
      </View>
    </View>
  );
};
