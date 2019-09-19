import { useState, useEffect } from "react";
import { Auth, API, graphqlOperation } from "aws-amplify";

import parse from "date-fns/parse";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";

import { getEvent } from "../graphql/queries";
import {
  onUpdateEvent,
  onUpdateTask,
  onCreateTask,
  onDeleteTask
} from "../graphql/subscriptions";

const sortTasks = tasks =>
  tasks.sort((a, b) => {
    if (a.due > b.due) return 1;
    if (a.due < b.due) return -1;
    return 0;
  });

export default eventId => {
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      .catch(error => console.log(error));
  }, [setUser]);

  useEffect(() => {
    const getDisplayDates = (startDate, endDate) => {
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const end = parse(endDate, "yyyy-MM-dd", new Date());

      if (startDate === endDate) {
        return format(start, "MMM do");
      }

      return `${format(start, "MMM do")} / ${format(end, "MMM do")}`;
    };

    const getTimeToEvent = startDate => {
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      return formatDistance(new Date(), start);
    };

    API.graphql(
      graphqlOperation(getEvent, {
        id: eventId
      })
    )
      .then(result => {
        const event = result.data.getEvent;

        const sortedTasks = sortTasks(event.tasks.items);
        event.tasks = { ...event.tasks, items: sortedTasks };

        setEvent({
          ...event,
          displayDates: getDisplayDates(event.dates.start, event.dates.end),
          timeToEvent: getTimeToEvent(event.dates.start)
        });
      })
      .catch(error => console.log(error));
  }, [setEvent]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateEvent, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onUpdateEvent: updatedEvent }
        }
      }) => {
        if (updatedEvent.id === event.id) {
          const sortedTasks = sortTasks(updatedEvent.tasks.items);
          updatedEvent.tasks = { ...updatedEvent.tasks, items: sortedTasks };

          setEvent({
            ...event,
            ...updatedEvent
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onUpdateTask, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onUpdateTask: updatedTask }
        }
      }) => {
        if (updatedTask.event.id === event.id) {
          const updatedTasks = sortTasks(
            event.tasks.items.map(task => {
              if (task.id === updatedTask.id) {
                return {
                  id: updatedTask.id,
                  title: updatedTask.title,
                  due: updatedTask.due,
                  completed: updatedTask.completed
                };
              }

              return task;
            })
          );

          setEvent({
            ...event,
            tasks: { items: updatedTasks }
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onCreateTask, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onCreateTask: createdTask }
        }
      }) => {
        if (createdTask.event.id === event.id) {
          const sortedTasks = sortTasks([...event.tasks.items, createdTask]);

          setEvent({
            ...event,
            tasks: { items: sortedTasks }
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  useEffect(() => {
    if (!user || !event) return;

    const subscription = API.graphql(
      graphqlOperation(onDeleteTask, {
        owner: user.username
      })
    ).subscribe({
      next: ({
        value: {
          data: { onDeleteTask: deletedTask }
        }
      }) => {
        if (deletedTask.event.id === event.id) {
          const updatedTasks = event.tasks.items.filter(
            task => task.id !== deletedTask.id
          );

          setEvent({
            ...event,
            tasks: { items: updatedTasks }
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, setUser, event, setEvent]);

  return [event];
};
