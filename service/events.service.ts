import * as coda from "@codahq/packs-sdk";

import { BASE_URL } from "../utils/constants.helpers";
import { Reminder } from "../types";


function getEvent(event: string, calendar: string) {
  return async function(fetcher: coda.Fetcher) {
    return await fetcher.fetch({
      method: "GET",
      url: `${BASE_URL}/calendars/${calendar}/events/${event}`
    });
  }
}

function updateEventReminders(event: string, calendar: string, reminders: { useDefault: boolean, overrides: Reminder[] }) {
  return async function(fetcher: coda.Fetcher) {
    return await fetcher.fetch({
      method: "PATCH",
      url: `${BASE_URL}/calendars/${calendar}/events/${event}`,
      body: JSON.stringify({ reminders, }),
    });
  }
}


export {
  getEvent,
  updateEventReminders,
}