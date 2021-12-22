import * as coda from "@codahq/packs-sdk";

import { getEvent, updateEventReminders } from "../service/events.service";
import { getCalendarEntry } from "../service/calendarList.service";


const isDefaultNotifications = async function ([event, calendar], context: coda.ExecutionContext) {
  try {
    const eventResponse = await getEvent(event, calendar)(context.fetcher);
    const reminders = eventResponse.body.reminders;
    return reminders.useDefault;
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      let statusError = error as coda.StatusCodeError;
      // If the API returned an error message in the body, show it to the user.
      let message = statusError.body?.message;
      if (message) {
        throw new coda.UserVisibleError(message);
      }
    }
    // The request failed for some other reason. Re-throw the error so that it bubbles up.
    throw error;
  }
}

const notifications = async function([event, calendar = "primary"], context: coda.ExecutionContext) {
  try {
    const eventResponse = await getEvent(event, calendar)(context.fetcher); 
    const reminders = eventResponse.body.reminders;

    if (reminders.useDefault) {
      const calendarEntry = (await getCalendarEntry(calendar)(context.fetcher)).body;
      return calendarEntry.defaultReminders;
    }

    return reminders.overrides;
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      let statusError = error as coda.StatusCodeError;
      // If the API returned an error message in the body, show it to the user.
      let message = statusError.body?.message;
      if (message) {
        throw new coda.UserVisibleError(message);
      }
    }
    // The request failed for some other reason. Re-throw the error so that it bubbles up.
    throw error;
  }
}

const setNotifications = async function ([event, calendar = "primary", ...varargs], context: coda.ExecutionContext) {
  const reminders = [];
  for (let i = 0; i < varargs.length; i += 2) {
    reminders.push({
      method: varargs[i],
      minutes: varargs[i + 1]
    });
  }

  if (reminders.length > 5) {
    throw new coda.UserVisibleError("Exceeds the allowed maximum number of notifications.");
  }

  reminders.forEach(({ method, minutes }) => {
    if (minutes < 0 || minutes > 40320) {
      throw new coda.UserVisibleError("minutes must be between 0 and 40320.");
    }

    if (method !== "email" && method !== "popup") {
      throw new coda.UserVisibleError(`method must be either "email" or "popup".`);
    }
  });

  try {
    const eventResponse = await updateEventReminders(event, calendar, { useDefault: false, overrides: reminders, })(context.fetcher);
    return eventResponse.body.htmlLink;
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      let statusError = error as coda.StatusCodeError;
      // If the API returned an error message in the body, show it to the user.
      let message = statusError.body?.message;
      if (message) {
        throw new coda.UserVisibleError(message);
      }
    }
    // The request failed for some other reason. Re-throw the error so that it bubbles up.
    throw error;
  }
}

const clearNotifications = async function([event, calendar = "primary", restoreDefault = false], context: coda.ExecutionContext) {
  try {
    const eventResponse = await updateEventReminders(event, calendar, { useDefault: restoreDefault, overrides: [], })(context.fetcher);
    return eventResponse.body.htmlLink;
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      let statusError = error as coda.StatusCodeError;
      // If the API returned an error message in the body, show it to the user.
      let message = statusError.body?.message;
      if (message) {
        throw new coda.UserVisibleError(message);
      }
    }
    // The request failed for some other reason. Re-throw the error so that it bubbles up.
    throw error;
  }
}


export {
  isDefaultNotifications,
  notifications,
  setNotifications,
  clearNotifications,
}
