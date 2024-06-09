import { List, ActionPanel, Action, LocalStorage, Clipboard, popToRoot } from "@raycast/api";
import { useState, useEffect } from "react";

interface TimeAndMessage {
  startTime: string;
  endTime: string;
  message: string;
}

export default function Command() {
  const [timeAndMessages, setTimeAndMessages] = useState<TimeAndMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const obj = (await LocalStorage.getItem<string>("rayTimeText")) || "[]";
      const objToJSON = JSON.parse(obj);

      setTimeAndMessages(objToJSON);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const clearAll = async () => {
    await LocalStorage.setItem("rayTimeText", "[]");
    setTimeAndMessages([]);
  };

  const deleteItem = async (index: number) => {
    const newObj = timeAndMessages.filter((_, i) => i !== index);
    await LocalStorage.setItem("rayTimeText", JSON.stringify(newObj));
    setTimeAndMessages(newObj);
  };

  const handelPaste = async (message: string) => {
    await Clipboard.paste(message);
    popToRoot();
  };

  return (
    <List isLoading={isLoading}>
      {timeAndMessages.map((item, index) => (
        <List.Item
          key={index}
          title={`${item.startTime} - ${item.endTime}`}
          subtitle={item.message}
          actions={
            <ActionPanel>
              <Action title="Paste Message" onAction={() => handelPaste(item.message)} />
              <Action
                title="Copy to Clipboard"
                onAction={async () => {
                  await Clipboard.copy(item.message);
                  popToRoot();
                }}
              />
              <Action title="Delete Item" onAction={() => deleteItem(index)} />
              <Action title="Clear All" onAction={clearAll} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
