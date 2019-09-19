import React, { useState } from "react";
import { SafeAreaView, View, Text, Modal, Alert } from "react-native";
import { Button } from "react-native-elements";
import { Calendar } from "react-native-calendars";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import format from "date-fns/format";
import parse from "date-fns/parse";

import Colors from "../constants/Colors";

export default ({ onDatesSelected, value, required = true, style = {} }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [dates, setDates] = useState(value ? [value.start, value.end] : []);

  const getDatesInRange = (startDate, endDate) => {
    const start = parse(startDate, "yyyy-MM-dd", new Date());
    const end = parse(endDate, "yyyy-MM-dd", new Date());

    const allDates = eachDayOfInterval({ start, end });

    return allDates.map(date => format(date, "yyyy-MM-dd"));
  };

  const getMarkedDatesFromRange = (startDate, endDate) => {
    const dates = getDatesInRange(startDate, endDate);

    return dates.reduce((mem, val, index, self) => {
      const markedDate = {
        startingDay: index === 0,
        endingDay: index + 1 === self.length,
        color: Colors.tintColor,
        textColor: Colors.foreground
      };

      mem[val] = markedDate;

      return mem;
    }, {});
  };

  const markedDates = () => {
    if (!dates.length) return {};

    const datesForCalendar =
      dates.length > 1
        ? getMarkedDatesFromRange(dates[0], dates[1])
        : {
            [dates[0]]: {
              startingDay: true,
              endingDay: true,
              color: Colors.tintColor,
              textColor: Colors.foreground
            }
          };

    return datesForCalendar;
  };

  const displayDates = (startDate, endDate) => {
    const start = parse(startDate, "yyyy-MM-dd", new Date());
    const end = parse(endDate, "yyyy-MM-dd", new Date());

    if (startDate === endDate) {
      return format(start, "MMM do");
    }

    return `${format(start, "MMM do")} - ${format(end, "MMM do")}`;
  };

  const getTitle = () => {
    if (dates.length === 1) {
      return "Select End Date";
    }

    return "Select Start Date";
  };

  return (
    <View style={style}>
      <Button
        onPress={() => setShowPicker(true)}
        buttonStyle={{
          backgroundColor: "transparent",
          borderBottomWidth: 1,
          borderBottomColor: Colors.tintColor,
          borderRadius: 0,
          height: 60,
          paddingBottom: 0,
          paddingLeft: 0,
          justifyContent: "flex-start",
          alignItems: "flex-end"
        }}
        titleStyle={{
          fontFamily: "overpass-black",
          color: Colors.tintColor,
          fontSize: 24,
          marginBottom: -4
        }}
        title={dates.length === 2 ? displayDates(dates[0], dates[1]) : ""}
      />
      {required && (
        <Text style={{ fontSize: 10, margin: 5, color: Colors.tintColor }}>
          Required
        </Text>
      )}
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView>
          <View
            style={{
              height: "100%",
              padding: 24
            }}
          >
            <Text
              style={{
                fontFamily: "overpass-black",
                color: Colors.tintColor,
                textAlign: "center",
                marginBottom: 8,
                fontSize: 20
              }}
            >
              {getTitle()}
            </Text>
            <Calendar
              current={dates.length ? dates[0] : ""}
              markingType={"period"}
              onDayPress={day => {
                if (dates[1]) {
                  setDates([day.dateString]);
                } else {
                  const startDate = dates[0];
                  if (day.dateString < startDate) {
                    Alert.alert("End date cannot be before start date");
                    return;
                  }
                  setDates([...dates, day.dateString]);
                }
              }}
              markedDates={markedDates()}
              theme={{
                selectedDayBackgroundColor: Colors.tintColor,
                selectedDayTextColor: Colors.foreground,
                todayTextColor: Colors.tintColor,
                dayTextColor: Colors.text,
                textDisabledColor: Colors.inactive,
                dotColor: Colors.tintColor,
                selectedDotColor: Colors.foreground,
                arrowColor: Colors.tintColor,
                monthTextColor: Colors.text,
                indicatorColor: Colors.tintColor,
                textDayFontFamily: "overpass-black",
                textMonthFontFamily: "overpass-black",
                textDayHeaderFontFamily: "overpass-black"
              }}
            />
            <Button
              onPress={() => {
                if (dates.length !== 2) {
                  return;
                }

                onDatesSelected({ start: dates[0], end: dates[1] });
                setShowPicker(false);
              }}
              buttonStyle={{
                marginTop: 24,
                backgroundColor:
                  dates.length === 2 ? Colors.tintColor : Colors.inactive
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
