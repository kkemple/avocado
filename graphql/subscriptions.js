/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateEvent = `subscription OnCreateEvent($owner: String!) {
  onCreateEvent(owner: $owner) {
    id
    title
    dates {
      start
      end
    }
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
    contacts
    createdAt
    updatedAt
    owner
  }
}
`;
export const onUpdateEvent = `subscription OnUpdateEvent($owner: String!) {
  onUpdateEvent(owner: $owner) {
    id
    title
    dates {
      start
      end
    }
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
    contacts
    createdAt
    updatedAt
    owner
  }
}
`;
export const onDeleteEvent = `subscription OnDeleteEvent($owner: String!) {
  onDeleteEvent(owner: $owner) {
    id
    title
    dates {
      start
      end
    }
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
    contacts
    createdAt
    updatedAt
    owner
  }
}
`;
export const onCreateTask = `subscription OnCreateTask($owner: String!) {
  onCreateTask(owner: $owner) {
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
      contacts
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
export const onUpdateTask = `subscription OnUpdateTask($owner: String!) {
  onUpdateTask(owner: $owner) {
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
      contacts
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
export const onDeleteTask = `subscription OnDeleteTask($owner: String!) {
  onDeleteTask(owner: $owner) {
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
      contacts
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
