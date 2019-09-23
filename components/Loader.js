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
        duration: 1500,
        useNativeDriver: true
      })
    ).start(() => {
      animatedValue.setValue(0);
    });

    return () => animatedValue.stopAnimation();
  }, [animatedValue]);

  const pulseAnimationStyles = {
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.3, 0.8, 1],
      outputRange: [1, 0.5, 0.3, 0]
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

  return (
    <View style={{ flex: 1 }}>
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
              width: 48,
              height: 48,
              borderRadius: 24,
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
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.grey["0"]
          }}
        >
          <Icon
            size={24}
            name="download-cloud"
            type="feather"
            color={Colors.primary["500"]}
          />
        </View>
      </View>
    </View>
  );
};
