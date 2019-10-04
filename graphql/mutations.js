/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createEvent = `mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    title
    dates {
      start
      end
    }
    timestamp
    venue {
      icon
      address
      googleMapsUrl
      location {
        lat
        lng
      }
      name
    }
    weather {
      temp
      icon
    }
    hotel {
      icon
      address
      googleMapsUrl
      location {
        lat
        lng
      }
      name
    }
    twitter
    website
    tickets
    tasks {
      items {
        id
        title
        completed
        due
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
    notes
    createdAt
    updatedAt
    owner
  }
}
`;
export const updateEvent = `mutation UpdateEvent($input: UpdateEventInput!) {
  updateEvent(input: $input) {
    id
    title
    dates {
      start
      end
    }
    timestamp
    venue {
      icon
      address
      googleMapsUrl
      location {
        lat
        lng
      }
      name
    }
    weather {
      temp
      icon
    }
    hotel {
      icon
      address
      googleMapsUrl
      location {
        lat
        lng
      }
      name
    }
    twitter
    website
    tickets
    tasks {
      items {
        id
        title
        completed
        due
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
    notes
    createdAt
    updatedAt
    owner
  }
}
`;
export const deleteEvent = `mutation DeleteEvent($input: DeleteEventInput!) {
  deleteEvent(input: $input) {
    id
    title
    dates {
      start
      end
    }
    timestamp
    venue {
      icon
      address
      googleMapsUrl
      location {
        lat
        lng
      }
      name
    }
    weather {
      temp
      icon
    }
    hotel {
      icon
      address
      googleMapsUrl
      location {
        lat
        lng
      }
      name
    }
    twitter
    website
    tickets
    tasks {
      items {
        id
        title
        completed
        due
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
    notes
    createdAt
    updatedAt
    owner
  }
}
`;
export const createTask = `mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    completed
    event {
      id
      title
      dates {
        start
        end
      }
      timestamp
      venue {
        icon
        address
        googleMapsUrl
        name
      }
      weather {
        temp
        icon
      }
      hotel {
        icon
        address
        googleMapsUrl
        name
      }
      twitter
      website
      tickets
      tasks {
        nextToken
      }
      notes
      createdAt
      updatedAt
      owner
    }
    due
    createdAt
    updatedAt
    owner
  }
}
`;
export const updateTask = `mutation UpdateTask($input: UpdateTaskInput!) {
  updateTask(input: $input) {
    id
    title
    completed
    event {
      id
      title
      dates {
        start
        end
      }
      timestamp
      venue {
        icon
        address
        googleMapsUrl
        name
      }
      weather {
        temp
        icon
      }
      hotel {
        icon
        address
        googleMapsUrl
        name
      }
      twitter
      website
      tickets
      tasks {
        nextToken
      }
      notes
      createdAt
      updatedAt
      owner
    }
    due
    createdAt
    updatedAt
    owner
  }
}
`;
export const deleteTask = `mutation DeleteTask($input: DeleteTaskInput!) {
  deleteTask(input: $input) {
    id
    title
    completed
    event {
      id
      title
      dates {
        start
        end
      }
      timestamp
      venue {
        icon
        address
        googleMapsUrl
        name
      }
      weather {
        temp
        icon
      }
      hotel {
        icon
        address
        googleMapsUrl
        name
      }
      twitter
      website
      tickets
      tasks {
        nextToken
      }
      notes
      createdAt
      updatedAt
      owner
    }
    due
    createdAt
    updatedAt
    owner
  }
}
`;
