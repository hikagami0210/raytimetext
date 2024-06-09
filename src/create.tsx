import { Form, ActionPanel, Action, LocalStorage, Toast, showToast, popToRoot } from "@raycast/api";
import { useState } from "react";

interface TimeAndMessage {
  startTime: string;
  endTime: string;
  message: string;
}

const toMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

// 既存のものと範囲が被っているかどうかをチェックする
const checkOverlap = (timeAndMessages: TimeAndMessage[], newTimeAndMessage: TimeAndMessage): boolean => {
  const newStart = toMinutes(newTimeAndMessage.startTime);
  const newEnd = toMinutes(newTimeAndMessage.endTime);

  for (const timeAndMessage of timeAndMessages) {
    const start = toMinutes(timeAndMessage.startTime);
    const end = toMinutes(timeAndMessage.endTime);

    if (newStart < end && newEnd > start) {
      return false;
    }
  }
  return true;
};

export default function Create() {
  const hourList = Array.from({ length: 24 }, (_, i) => {
    return i.toString().padStart(2, "0");
  });
  const minuteList = ["00", "09", "10", "19", "20", "29", "30", "39", "40", "49", "50", "59"];

  const [timeAndMessage, setTimeAndMessage] = useState({
    startTimeHour: "00",
    startTimeMin: "00",
    endTimeHour: "00",
    endTimeMin: "00",
    message: "",
  });

  const handleSave = async () => {
    const obj = (await LocalStorage.getItem<string>("rayTimeText")) || "[]";
    const objToJSON = JSON.parse(obj);

    const newTimeAndMessage: TimeAndMessage = {
      startTime: `${timeAndMessage.startTimeHour}:${timeAndMessage.startTimeMin}`,
      endTime: `${timeAndMessage.endTimeHour}:${timeAndMessage.endTimeMin}`,
      message: timeAndMessage.message,
    };

    if (!checkOverlap(objToJSON, newTimeAndMessage)) {
      showToast(Toast.Style.Failure, "⚠️Time range overlaps (既存のものと時間が被っています)");
      return;
    }

    const setObj = [...objToJSON, newTimeAndMessage];

    await LocalStorage.setItem("rayTimeText", JSON.stringify(setObj));

    popToRoot();
  };

  return (
    <>
      <Form
        actions={
          <ActionPanel>
            <Action title="Save" onAction={handleSave} />
          </ActionPanel>
        }
      >
        <Form.Dropdown
          id="start-hour"
          title="Start Hour"
          value={timeAndMessage.startTimeHour}
          onChange={(value) => setTimeAndMessage({ ...timeAndMessage, startTimeHour: value })}
        >
          {hourList.map((i) => (
            <Form.Dropdown.Item key={i} value={i.toString()} title={i.toString()} />
          ))}
        </Form.Dropdown>
        <Form.Dropdown
          id="start-min"
          title="start-min"
          value={timeAndMessage.startTimeMin}
          onChange={(value) => setTimeAndMessage({ ...timeAndMessage, startTimeMin: value })}
        >
          {minuteList.map((i) => (
            <Form.Dropdown.Item key={i} value={i.toString()} title={i.toString()} />
          ))}
        </Form.Dropdown>

        <Form.Separator />

        <Form.Dropdown
          id="end-hour"
          title="end-hour"
          value={timeAndMessage.endTimeHour}
          onChange={(value) => setTimeAndMessage({ ...timeAndMessage, endTimeHour: value })}
        >
          {hourList.map((i) => (
            <Form.Dropdown.Item key={i} value={i.toString()} title={i.toString()} />
          ))}
        </Form.Dropdown>
        <Form.Dropdown
          id="end-min"
          title="end-min"
          value={timeAndMessage.endTimeMin}
          onChange={(value) => setTimeAndMessage({ ...timeAndMessage, endTimeMin: value })}
        >
          {minuteList.map((i) => (
            <Form.Dropdown.Item key={i} value={i.toString()} title={i.toString()} />
          ))}
        </Form.Dropdown>

        <Form.Separator />

        <Form.TextField
          id="message"
          title="message"
          placeholder="Enter text"
          defaultValue={timeAndMessage.message}
          onChange={(value) => setTimeAndMessage({ ...timeAndMessage, message: value })}
        />
      </Form>
    </>
  );
}
