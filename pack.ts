import * as coda from "@codahq/packs-sdk";

import { clearNotifications, isDefaultNotifications, notifications, setNotifications } from "./controllers/controllers";
import { reminderSchema } from "./schemas";
import { GOOGLEAPIS_DOMAIN } from "./utils/constants.helpers";

export const pack = coda.newPack();

// per-user authentication
pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth", // see https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
  tokenUrl: "https://oauth2.googleapis.com/token", // see https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
  scopes: [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.calendarlist.readonly"
  ]
});

pack.addNetworkDomain(GOOGLEAPIS_DOMAIN);

const calendarParam = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "calendar",
  description: "The URL, ID, or name of the calendar to use.",
  optional: true,
  defaultValue: "primary"
});

const eventParam = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "event",
  description: "The URL or ID of an event."
});

// read whether the reminders of an event are the default ones
pack.addFormula({
  name: "IsDefaultNotifications",
  description: "Returns whether the notifications set on the given Google Calendar event are the default notification(s) of the calendar.",

  parameters: [
    eventParam,
    calendarParam,
  ],

  resultType: coda.ValueType.Boolean,

  execute: async function ([event, calendar = "primary"], context) {
    return isDefaultNotifications([event, calendar], context);
  },
});

// read the reminders of an event
pack.addFormula({
  name: "Notifications",
  description: "Returns the notifications set on the given Google Calendar event.",

  parameters: [
    eventParam,
    calendarParam,
  ],

  resultType: coda.ValueType.Array,
  items: reminderSchema,

  execute: async function ([event, calendar = "primary"], context) {
    return notifications([event, calendar], context);
  },
});


// set the reminders of an event
pack.addFormula({
  name: "SetNotifications",
  description: "Set one or more notifications on the given Google Calendar event. The maximum number of notifications is 5.",

  isAction: true,

  parameters: [
    eventParam,
    calendarParam,
  ],
  varargParameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "method",
      description: `The method used by this notification. Possible values are: "email" and "popup".`,
      autocomplete: ["popup", "email"],
      defaultValue: "popup" // in case this one day becomes supported, see https://coda.github.io/packs-sdk/guides/basics/parameters/#accepting-multiple-values
    }),
    coda.makeParameter({
      type: coda.ParameterType.Number,
      name: "minutes",
      description: "Number of minutes before the start of the event when the reminder should trigger. Valid values are between 0 and 40320 (4 weeks in minutes).",
      autocomplete: [5, 10, 15, 30, 60, 120]
    }),
  ],

  resultType: coda.ValueType.String,

  execute: async function ([event, calendar = "primary", ...varargs], context) {
    return setNotifications([event, calendar, varargs], context);
  },
});


// delete all overrride reminders of an event
pack.addFormula({
  name: "ClearNotifications",
  description: "Delete all notifications set on the given Google Calendar event.",

  isAction: true,

  parameters: [
    eventParam,
    calendarParam,
    coda.makeParameter({
      type: coda.ParameterType.Boolean,
      name: "restoreDefault",
      description: "Whether to restore the default notification(s) of the calendar on the event. Default is `False()`.",
      optional: true,
      defaultValue: false
    })
  ],

  resultType: coda.ValueType.String,

  execute: async function ([event, calendar = "primary", restoreDefault = false], context) {
    return clearNotifications([event, calendar, restoreDefault], context);
  },
});
