import { Clipboard, LocalStorage, showToast, Toast } from "@raycast/api";

const toMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

export default async function Command() {
  const [nowHour, nowMinute] = new Date().toLocaleTimeString().split(":"); // ["16", "00"]

  const objList = (await LocalStorage.getItem<string>("rayTimeText")) || "[]";

  console.log(objList);

  // 現在の時刻が設定されている時刻の範囲内であれば、メッセージをクリップボードにコピーする
  const pasteMessage = async (objList: string) => {
    const objToJSON = JSON.parse(objList);

    const nowMinutes = toMinutes(`${nowHour}:${nowMinute}`);

    for (const obj of objToJSON) {
      const startMinutes = toMinutes(obj.startTime);
      const endMinutes = toMinutes(obj.endTime);

      if (
        (nowMinutes >= startMinutes && nowMinutes <= endMinutes) ||
        (endMinutes < startMinutes && (nowMinutes >= startMinutes || nowMinutes <= endMinutes))
      ) {
        return await Clipboard.paste(obj.message);
      }
    }

    await showToast(Toast.Style.Failure, "undefined time range (未設定の時間帯です)");
  };

  await pasteMessage(objList);
}
