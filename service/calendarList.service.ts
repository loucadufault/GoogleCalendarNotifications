import * as coda from "@codahq/packs-sdk";

import { BASE_URL } from "../utils/constants.helpers";

function getCalendarEntry(calendar: string) {
  return async function(context: coda.ExecutionContext) {
    return await context.fetcher.fetch({
      method: "GET",
      url: `${BASE_URL}/users/me/calendarList/${calendar}`
    });
  }
}

export {
  getCalendarEntry,
}