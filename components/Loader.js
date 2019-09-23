import React, { useState, useEffect } from "react";
import { Animated, View } from "react-native";
import { Icon } from "react-native-elements";

import Colors from "../constants/Colors";

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export default () => {
  const [pulseAnimation] = useState(new Animated.Value(0));
  const [bounceAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true
      })
    ).start(() => {
      pulseAnimation.setValue(0);
    });

    return () => pulseAnimation.stopAnimation();
  }, [pulseAnimation]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(bounceAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ).start(() => {
      bounceAnimation.setValue(0);
    });

    return () => bounceAnimation.stopAnimation();
  }, [bounceAnimation]);

  const pulseAnimationStyles = {
    opacity: pulseAnimation.interpolate({
      inputRange: [0, 0.3, 0.8, 1],
      outputRange: [1, 0.5, 0.3, 0]
    }),
    transform: [
      {
        scale: pulseAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2]
        })
      }
    ]
  };

  const bounceAnimationStyles = {
    transform: [
      {
        translateY: bounceAnimation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, -1, 1]
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
          <AnimatedIcon
            style={bounceAnimationStyles}
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
