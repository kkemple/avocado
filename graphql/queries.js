/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getEvent = `query GetEvent($id: ID!) {
  getEvent(id: $id) {
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
export const listEvents = `query ListEvents(
  $filter: ModelEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
        location {
          lat
          lng
        }
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
        location {
          lat
          lng
        }
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
    nextToken
  }
}
`;
export const getTask = `query GetTask($id: ID!) {
  getTask(id: $id) {
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
        location {
          lat
          lng
        }
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
        location {
          lat
          lng
        }
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
    due
    createdAt
    updatedAt
    owner
  }
}
`;
export const listTasks = `query ListTasks(
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
) {
  listTasks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      completed
      event {
        id
        title
        timestamp
        twitter
        website
        tickets
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
    nextToken
  }
}
`;
