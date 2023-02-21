export const TWO_SIDED_FLASHCARDS = ["NORMAL"];
export const clozeRegex = /{{c\d*::.*?}}/gm;
export const AUTO_FLASHCARD_LIMITS = {
  pro: 500,
  regular: 50,
};
export const SOURCE_TEXT_MAX_LENS = {
  SINGLE: 250,
  MULTI: 1000,
  CLOZE: 200,
  NOTES: 8000,
};
export const NUMBER_TO_WORD = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
};
export const DOUBLE_RETURN = "<DOUBLE RETURN>";

export const languageToPrompt = {
  ENGLISH: {
    mainPrompt: "Make <NUM> flashcards from my notes:",
    front: "Front:",
    back: "Back:",
    whatWord: " Wh",
  },
  SPANISH: {
    mainPrompt: "Crear <NUM> flashcards de mis notas:",
    front: "Frente:",
    back: "Respuesta:",
    whatWord: " ¿",
  },
  FRENCH: {
    mainPrompt: "Créez <NUM> flashcards à partir de mes notes :",
    front: "Recto:",
    back: "Verso:",
    whatWord: " Qu",
  },
  GERMAN: {
    mainPrompt: "Erstelle <NUM> Karteikarten aus meinen Notizen:",
    front: "Voderseite:",
    back: "Rückseite:",
    whatWord: " W",
  },
  MANDARIN: {
    mainPrompt: "根据我的笔记创建<NUM>张抽认卡:",
    front: "正面:",
    back: "后面:",
    whatWord: " 什么",
  },
  DUTCH: {
    mainPrompt: "Maak <NUM> flashcards van mijn aantekenigen:",
    front: "Voorzijde:",
    back: "Achterzijde:",
    whatWord: " W",
  },
  RUSSIAN: {
    mainPrompt: "Создайте <NUM> карточек из моих заметок:",
    front: "Спереди:",
    back: "Сзади",
    whatWord: " Что",
  },
  PORTUGUESE: {
    mainPrompt: "Crie <NUM> flashcards de minhas anotações:",
    front: "Frente:",
    back: "Atrás:",
    whatWord: " O que",
  },
  // HINDI: {
  //   mainPrompt: "मेरे नोट्स से <NUM> फ्लैशकार्ड बनाएं:",
  //   front: "सामने:",
  //   whatWord: " ",
  // },
  INDONESIAN: {
    mainPrompt: "Buat <NUM> kartu flash dari catatan saya:",
    front: "Depan:",
    back: "Belakang:",
    whatWord: " Apa",
  },
  JAPANESE: {
    mainPrompt: "メモから <NUM> 枚のフラッシュ カードを作成します。",
    front: "前:",
    back: "後:",
    whatWord: " ",
  },
  ESPERANTO: {
    mainPrompt: "Faru <NUM> kartojn el miaj notoj.\n\nFronto: ...\nMalantaŭe: ...:",
    front: "Fronto:",
    back: "Malantaŭe:",
    whatWord: " Ki",
  },
};
