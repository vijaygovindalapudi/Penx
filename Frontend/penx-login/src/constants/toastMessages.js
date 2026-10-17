export const toastMessages = {
  copy: [
    {
      telugu: "📋 దాచిపెట్టాం... ఎవరికీ తెలీదు! 🤫",
      english: "FILE COPIED",
    },
    {
      telugu: "😏 ఇంకోటి రెడీ చేసేశాం!",
      english: "FILE COPIED",
    },
    {
      telugu: "📦 జాగ్రత్తగా పక్కన పెట్టేశాం!",
      english: "FILE COPIED",
    },
    {
      telugu: "🪄 ఒక్కటి... రెండైపోయింది!",
      english: "FILE COPIED",
    },
    {
      telugu: "😉 భద్రంగా మడత పెట్టేశాం!",
      english: "FILE COPIED",
    },
  ],

  paste: [
    {
      telugu: "📂 చోటు చూసి కూర్చోబెట్టాం! 😌",
      english: "FILE PASTED",
    },
    {
      telugu: "🏠 కొత్త చోటికి చేర్చేశాం!",
      english: "FILE PASTED",
    },
    {
      telugu: "😎 ఇదే సరైన చోటు అనుకున్నాం!",
      english: "FILE PASTED",
    },
    {
      telugu: "📍 సరైన చోటే దిగిపోయింది!",
      english: "FILE PASTED",
    },
    {
      telugu: "👌 హాయిగా సర్దుకుపోయింది!",
      english: "FILE PASTED",
    },
  ],

  delete: [
    {
      telugu: "🗑 ఇక వెతికినా దొరకదు! 😂",
      english: "FILE DELETED",
    },
    {
      telugu: "👋 పంపించేశాం... తిరిగి రాదు!",
      english: "FILE DELETED",
    },
    {
      telugu: "💨 గాలిలో కలిసిపోయింది!",
      english: "FILE DELETED",
    },
    {
      telugu: "🧹 ఆనవాలు కూడా లేకుండా చేశాం!",
      english: "FILE DELETED",
    },
    {
      telugu: "😌 పని అయిపోయింది!",
      english: "FILE DELETED",
    },
  ],

  rename: [
    {
      telugu: "✏️ కొత్త పేరు బాగానే కుదిరింది! 😎",
      english: "FILE RENAMED",
    },
    {
      telugu: "😄 పాత పేరు రిటైర్ అయింది!",
      english: "FILE RENAMED",
    },
    {
      telugu: "🎭 కొత్త గుర్తింపు వచ్చేసింది!",
      english: "FILE RENAMED",
    },
    {
      telugu: "👌 ఇప్పుడు క్లాస్‌గా ఉంది!",
      english: "FILE RENAMED",
    },
    {
      telugu: "📝 పేరు మార్చి మెరిపించేశాం!",
      english: "FILE RENAMED",
    },
  ],

  createFolder: [
    {
      telugu: "📁 కొత్త గూడు రెడీ! 🏠",
      english: "FOLDER CREATED",
    },
    {
      telugu: "😎 కొత్త అడ్డు సిద్ధం!",
      english: "FOLDER CREATED",
    },
    {
      telugu: "📦 నింపేయడానికి రెడీగా ఉంది!",
      english: "FOLDER CREATED",
    },
    {
      telugu: "🎉 ఇంకో మూల దొరికేసింది!",
      english: "FOLDER CREATED",
    },
    {
      telugu: "🏡 మీ కోసం చోటు దాచేశాం!",
      english: "FOLDER CREATED",
    },
  ],
};

export const getRandomToast = (action) => {
  const messages = toastMessages[action];

  if (!messages || messages.length === 0) {
    return {
      telugu: "✨ పని అయిపోయింది!",
      english: "ACTION COMPLETED",
    };
  }

  const randomIndex = Math.floor(Math.random() * messages.length);

  return messages[randomIndex];
};