import axios from "axios";
const FEEDBACK_URL = "https://noxon.wpmix.net/counter.php";

export enum STATUS {
  danger = 1,
  success,
  warning,
  attention,
  unimportant,
  voteIdea,
  bonusFuel,
}

const MARKS = {
  [STATUS.danger]: "⭕",
  [STATUS.success]: "🟢",
  [STATUS.warning]: "🔥",
  [STATUS.attention]: "💥",
  [STATUS.unimportant]: "💤",
  [STATUS.voteIdea]: "🐤",
  [STATUS.bonusFuel]: "⛽",
};

export const sendMessage = ({
  msg,
  status,
}: {
  msg: string;
  status?: STATUS;
}) => {
  let host = window.location.hostname || document.location.host;

  if (host === "localhost") return;

  const statusMark =
    host === "localhost"
      ? `${MARKS[STATUS.unimportant]} `
      : status && MARKS[status]
      ? `${MARKS[status]} `
      : "";

  const textToSend = [statusMark, `[${host}] `, msg].join("");

  try {
    axios({
      url: `${FEEDBACK_URL}?msg=${encodeURI(textToSend)}&toonoutdev=1&version=2`,
      method: "post",
    }).catch((e) => console.error(e));
  } catch (error) {
    console.error(error);
  }
};
