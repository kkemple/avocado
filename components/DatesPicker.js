import React, { useState } from "react";
import { StyleSheet, SafeAreaView, View, Modal, Alert } from "react-native";
import { Button } from "react-native-elements";
import { Calendar } from "react-native-calendars";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import format from "date-fns/format";
import parse from "date-fns/parse";
import styled from "@emotion/native";

import Colors from "../constants/Colors";

const calendarTheme = {
  selectedDayBackgroundColor: Colors.primary["500"],
  selectedDayTextColor: Colors.grey["0"],
  todayTextColor: Colors.primary["500"],
  dayTextColor: Colors.text,
  textDisabledColor: Colors.inactive,
  dotColor: Colors.primary["500"],
  selectedDotColor: Colors.grey["0"],
  arrowColor: Colors.primary["500"],
  monthTextColor: Colors.text,
  indicatorColor: Colors.primary["500"],
  textDayFontFamily: "overpass-black",
  textMonthFontFamily: "overpass-black",
  textDayHeaderFontFamily: "overpass-black"
};

const RequiredText = styled.Text`
  color: ${Colors.primary["500"]};
  font-size: 10px;
  margin: 5px;
`;

const DatePickerTitle = styled.Text`
  color: ${Colors.primary["500"]};
  font-family: "overpass-black;
  font-size: 20px;
  margin-bottom: 8px;
  text-align: center;
`;

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
        color: Colors.primary["500"],
        textColor: Colors.grey["0"]
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
              color: Colors.primary["500"],
              textColor: Colors.grey["0"]
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
        activeOpacity={0.6}
        onPress={() => setShowPicker(true)}
        buttonStyle={styles.buttonStyles}
        titleStyle={styles.buttonTitleStyles}
        title={dates.length === 2 ? displayDates(dates[0], dates[1]) : ""}
      />
      {required && <RequiredText>Required</RequiredText>}
      <Modal animationType="slide" visible={showPicker}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 24 }}>
            <DatePickerTitle>{getTitle()}</DatePickerTitle>
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
              theme={calendarTheme}
            />
            <Button
              activeOpacity={0.6}
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
                  dates.length === 2 ? Colors.primary["500"] : Colors.inactive
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

const styles = StyleSheet.create({
  buttonStyles: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary["500"],
    borderRadius: 0,
    height: 60,
    paddingBottom: 0,
    paddingLeft: 0,
    justifyContent: "flex-start",
    alignItems: "flex-end"
  },
  buttonTitleStyles: {
    fontFamily: "overpass-black",
    color: Colors.primary["500"],
    fontSize: 24,
    marginBottom: -4
  }
});
