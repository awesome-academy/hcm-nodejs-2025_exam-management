import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import viAuth from "./vi/auth.json";
import viCommon from "./vi/common.json";
import viGuest from "./vi/guest.json";
import viHome from "./vi/home.json";
import viSupervisor from "./vi/supervisor.json";
import viUser from "./vi/user.json";
import viSubject from "./vi/subject.json";
import viQuestion from "./vi/question.json";
import viAnswer from "./vi/answer.json";

import enAuth from "./en/auth.json";
import enCommon from "./en/common.json";
import enGuest from "./en/guest.json";
import enHome from "./en/home.json";
import enSupervisor from "./en/supervisor.json";
import enUser from "./en/user.json";
import enSubject from "./en/subject.json";
import enQuestion from "./en/question.json";
import enAnswer from "./en/answer.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        auth: viAuth,
        common: viCommon,
        guest: viGuest,
        home: viHome,
        supervisor: viSupervisor,
        user: viUser,
        subject: viSubject,
        question: viQuestion,
        answer: viAnswer,
      },
      en: {
        auth: enAuth,
        common: enCommon,
        guest: enGuest,
        home: enHome,
        supervisor: enSupervisor,
        user: enUser,
        subject: enSubject,
        question: enQuestion,
        answer: enAnswer,
      },
    },
    fallbackLng: "vi",
    ns: [
      "auth",
      "common",
      "guest",
      "home",
      "supervisor",
      "user",
      "subject",
      "question",
      "answer",
    ],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
