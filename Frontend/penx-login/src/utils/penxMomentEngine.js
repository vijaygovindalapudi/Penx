// ======================================================
// PenX Moment Engine
// ======================================================
//
// Responsible for:
// - Selecting a fresh PenX Moment
// - Preventing recent message repetition
// - Avoiding repeated categories
// - Morning / night awareness
// - Personalizing selected messages
// - Persisting recent history using localStorage
//
// ======================================================

import {
  PENX_MOMENTS,
} from "../constants/penxMoments.js";

// ======================================================
// Storage Keys
// ======================================================

const STORAGE_KEYS = {
  HISTORY: "penx_moment_history",
  LAST_CATEGORY: "penx_moment_last_category",
};

// ======================================================
// Configuration
// ======================================================

const CONFIG = {
  // Number of recent messages that cannot repeat
  RECENT_MESSAGE_LIMIT: 8,

  // Number of recent categories to avoid
  RECENT_CATEGORY_LIMIT: 2,

  // Storage version
  VERSION: 1,
};

// ======================================================
// Safe localStorage Access
// ======================================================

function isStorageAvailable() {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const testKey = "__penx_storage_test__";

    window.localStorage.setItem(
      testKey,
      "1"
    );

    window.localStorage.removeItem(
      testKey
    );

    return true;

  } catch {
    return false;
  }
}

// ======================================================
// Read JSON Safely
// ======================================================

function readStorage(
  key,
  fallback
) {
  try {
    if (!isStorageAvailable()) {
      return fallback;
    }

    const value =
      window.localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);

  } catch (error) {

    console.warn(
      `PenX Moment storage read failed for ${key}:`,
      error
    );

    return fallback;
  }
}

// ======================================================
// Write JSON Safely
// ======================================================

function writeStorage(
  key,
  value
) {
  try {

    if (!isStorageAvailable()) {
      return false;
    }

    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {

    console.warn(
      `PenX Moment storage write failed for ${key}:`,
      error
    );

    return false;
  }
}

// ======================================================
// Get Recent Message History
// ======================================================

function getHistory() {

  const stored =
    readStorage(
      STORAGE_KEYS.HISTORY,
      null
    );

  // ----------------------------------------------------
  // First run
  // ----------------------------------------------------

  if (!stored) {
    return {
      version: CONFIG.VERSION,
      messages: [],
      categories: [],
    };
  }

  // ----------------------------------------------------
  // Validate stored structure
  // ----------------------------------------------------

  if (
    typeof stored !== "object" ||
    !Array.isArray(stored.messages) ||
    !Array.isArray(stored.categories)
  ) {

    return {
      version: CONFIG.VERSION,
      messages: [],
      categories: [],
    };
  }

  return stored;
}

// ======================================================
// Save History
// ======================================================

function saveHistory(
  history
) {

  const safeHistory = {

    version:
      CONFIG.VERSION,

    messages:
      history.messages.slice(
        -CONFIG.RECENT_MESSAGE_LIMIT
      ),

    categories:
      history.categories.slice(
        -CONFIG.RECENT_CATEGORY_LIMIT
      ),

  };

  writeStorage(
    STORAGE_KEYS.HISTORY,
    safeHistory
  );
}

// ======================================================
// Get Current Time Category
// ======================================================

function getTimeCategory() {

  const hour =
    new Date().getHours();

  // ----------------------------------------------------
  // Morning
  // 05:00 - 11:59
  // ----------------------------------------------------

  if (
    hour >= 5 &&
    hour < 12
  ) {
    return "morning";
  }

  // ----------------------------------------------------
  // Night
  // 21:00 - 04:59
  // ----------------------------------------------------

  if (
    hour >= 21 ||
    hour < 5
  ) {
    return "night";
  }

  // ----------------------------------------------------
  // Daytime
  // ----------------------------------------------------

  return null;
}

// ======================================================
// Random Item
// ======================================================

function randomItem(
  items
) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return null;
  }

  const index =
    Math.floor(
      Math.random() * items.length
    );

  return items[index];
}

// ======================================================
// Shuffle Array
// ======================================================

function shuffle(
  items
) {

  const array = [
    ...items,
  ];

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      array[i],
      array[j],
    ] = [
      array[j],
      array[i],
    ];
  }

  return array;
}

// ======================================================
// Filter Recent Messages
// ======================================================

function removeRecentMessages(
  messages,
  history
) {

  const recentIds =
    new Set(
      history.messages
    );

  return messages.filter(
    message =>
      !recentIds.has(
        message.id
      )
  );
}

// ======================================================
// Filter Recent Categories
// ======================================================

function removeRecentCategories(
  messages,
  history
) {

  const recentCategories =
    new Set(
      history.categories
    );

  return messages.filter(
    message =>
      !recentCategories.has(
        message.category
      )
  );
}

// ======================================================
// Get Time-Aware Messages
// ======================================================

function getTimeAwareMessages(
  messages
) {

  const timeCategory =
    getTimeCategory();

  // ----------------------------------------------------
  // Morning
  // ----------------------------------------------------

  if (
    timeCategory === "morning"
  ) {

    const morningMessages =
      messages.filter(
        message =>
          message.category ===
          "morning"
      );

    if (
      morningMessages.length > 0
    ) {
      return morningMessages;
    }
  }

  // ----------------------------------------------------
  // Night
  // ----------------------------------------------------

  if (
    timeCategory === "night"
  ) {

    const nightMessages =
      messages.filter(
        message =>
          message.category ===
          "night"
      );

    if (
      nightMessages.length > 0
    ) {
      return nightMessages;
    }
  }

  // ----------------------------------------------------
  // Normal daytime
  // ----------------------------------------------------

  return messages;
}

// ======================================================
// Personalize Message
// ======================================================

function personalizeMessage(
  message,
  userName
) {

  if (
    !message ||
    !message.personalize
  ) {
    return message;
  }

  const cleanName =
    typeof userName === "string"
      ? userName.trim()
      : "";

  if (!cleanName) {
    return message;
  }

  let personalizedText =
    message.message;

  // ----------------------------------------------------
  // Add name naturally
  // ----------------------------------------------------

  personalizedText =
    `${cleanName}, ${personalizedText}`;

  return {
    ...message,
    message:
      personalizedText,
  };
}

// ======================================================
// Record Selected Moment
// ======================================================

function recordMoment(
  message
) {

  if (!message) {
    return;
  }

  const history =
    getHistory();

  history.messages.push(
    message.id
  );

  history.categories.push(
    message.category
  );

  // ----------------------------------------------------
  // Limit message history
  // ----------------------------------------------------

  if (
    history.messages.length >
    CONFIG.RECENT_MESSAGE_LIMIT
  ) {

    history.messages =
      history.messages.slice(
        -CONFIG.RECENT_MESSAGE_LIMIT
      );
  }

  // ----------------------------------------------------
  // Limit category history
  // ----------------------------------------------------

  if (
    history.categories.length >
    CONFIG.RECENT_CATEGORY_LIMIT
  ) {

    history.categories =
      history.categories.slice(
        -CONFIG.RECENT_CATEGORY_LIMIT
      );
  }

  saveHistory(
    history
  );

  // ----------------------------------------------------
  // Keep compatibility with separate category key
  // ----------------------------------------------------

  writeStorage(
    STORAGE_KEYS.LAST_CATEGORY,
    message.category
  );
}

// ======================================================
// Find Best Candidate
// ======================================================

function findCandidate(
  messages,
  history
) {

  // ----------------------------------------------------
  // Step 1
  // Remove recently shown messages
  // ----------------------------------------------------

  let candidates =
    removeRecentMessages(
      messages,
      history
    );

  // ----------------------------------------------------
  // If nothing remains, reset message pool
  // ----------------------------------------------------

  if (
    candidates.length === 0
  ) {

    candidates =
      messages;
  }

  // ----------------------------------------------------
  // Step 2
  // Avoid recently used categories
  // ----------------------------------------------------

  const categoryFiltered =
    removeRecentCategories(
      candidates,
      history
    );

  if (
    categoryFiltered.length > 0
  ) {

    candidates =
      categoryFiltered;
  }

  // ----------------------------------------------------
  // Step 3
  // Randomly select
  // ----------------------------------------------------

  return randomItem(
    candidates
  );
}

// ======================================================
// Get PenX Moment
// ======================================================

export function getPenXMoment(
  userName = ""
) {

  // ----------------------------------------------------
  // Safety check
  // ----------------------------------------------------

  if (
    !Array.isArray(PENX_MOMENTS) ||
    PENX_MOMENTS.length === 0
  ) {

    console.error(
      "PenX Moment library is empty."
    );

    return null;
  }

  const history =
    getHistory();

  // ----------------------------------------------------
  // Try time-aware selection first
  // ----------------------------------------------------

  const timeAwareMessages =
    getTimeAwareMessages(
      PENX_MOMENTS
    );

  let candidate =
    findCandidate(
      timeAwareMessages,
      history
    );

  // ----------------------------------------------------
  // If no candidate found,
  // search complete library
  // ----------------------------------------------------

  if (!candidate) {

    candidate =
      findCandidate(
        PENX_MOMENTS,
        history
      );
  }

  // ----------------------------------------------------
  // Absolute fallback
  // ----------------------------------------------------

  if (!candidate) {

    candidate =
      randomItem(
        PENX_MOMENTS
      );
  }

  // ----------------------------------------------------
  // Record selected message
  // ----------------------------------------------------

  recordMoment(
    candidate
  );

  // ----------------------------------------------------
  // Personalize
  // ----------------------------------------------------

  return personalizeMessage(
    candidate,
    userName
  );
}

// ======================================================
// Preview Moment
// ======================================================
//
// Useful for development/testing.
// Does NOT save the message to history.
//

export function previewPenXMoment(
  userName = ""
) {

  if (
    !Array.isArray(PENX_MOMENTS) ||
    PENX_MOMENTS.length === 0
  ) {
    return null;
  }

  const message =
    randomItem(
      PENX_MOMENTS
    );

  return personalizeMessage(
    message,
    userName
  );
}

// ======================================================
// Clear Moment History
// ======================================================
//
// Useful when testing the feature.
//

export function clearPenXMomentHistory() {

  try {

    if (
      typeof window === "undefined"
    ) {
      return;
    }

    window.localStorage.removeItem(
      STORAGE_KEYS.HISTORY
    );

    window.localStorage.removeItem(
      STORAGE_KEYS.LAST_CATEGORY
    );

  } catch (error) {

    console.warn(
      "Unable to clear PenX Moment history:",
      error
    );
  }
}

// ======================================================
// Get Moment History
// ======================================================
//
// Useful for debugging.
//

export function getPenXMomentHistory() {

  return getHistory();
}

// ======================================================
// Export Configuration
// ======================================================

export const PENX_MOMENT_CONFIG = {
  ...CONFIG,
};