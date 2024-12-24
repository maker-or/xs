import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
// import { Plus } from "lucide-react";
// import { Button } from "~/components/ui/button";

type Event = {
  id: number;
  date: number;
  text: string;
  month: number;
  year: number;
};

export default function CalendarTimeline() {
  const currentDate = useMemo(() => new Date(), []);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const activeDateRef = useRef<HTMLButtonElement | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/task");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = (await response.json()) as {
        taskId: number;
        month: string;
        year: string;
        task: string;
        date: string;
      }[];
      console.log("response", response);
      console.log("dataget", data);

      const formattedEvents: Event[] = data.map((task) => ({
        id: task.taskId,
        date: parseInt(task.date, 10),
        text: task.task,
        month: parseInt(task.month, 12),
        year: parseInt(task.year, 2024),
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleNewEvent = () => {
    const newEvent: Event = {
      date: selectedDate,
      text: "",
      id: 0,
      month: currentMonth,
      year: currentYear,
    };
    setEvents([...events, newEvent]);
    setEditingEvent(newEvent);
    setEditText("");
  };

  const handleEditStart = (event: Event) => {
    setEditingEvent(event);
    setEditText(event.text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const mon = currentMonth + 1;

  const handleSaveEdit = useCallback(async () => {
    if (editingEvent) {
      const data = {
        task: editText,
        date: selectedDate.toString(),
        month: mon.toString(),
        year: currentYear.toString(),
      };

      const method = editingEvent.id ? "PATCH" : "POST";
      const url = editingEvent.id
        ? `/api/task/${editingEvent.id}`
        : "/api/task";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // console.log("datapost",data)
      if (!response.ok) {
        console.error("Failed to save task:", response.statusText);
      } else {
        await fetchTasks();
      }
      setEditingEvent(null);
    }
  }, [editingEvent, editText, selectedDate, mon, currentYear]);

  useEffect(() => {
    fetchTasks().catch((error) =>
      console.log("Failed to fetch tasks:", error)
    );
  }, []);

  useEffect(() => {
    // Scroll to the active date button on load
    if (activeDateRef.current && datePickerRef.current) {
      const datePicker = datePickerRef.current;
      const activeDateButton = activeDateRef.current;
      datePicker.scrollTo({
        left:
          activeDateButton.offsetLeft -
          datePicker.offsetWidth / 2 +
          activeDateButton.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedDate, daysInMonth]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleSaveEdit();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        void handleSaveEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleSaveEdit]);

  const filteredEvents = events.filter((event) => event.date === selectedDate);

  return (
    <div className="mx-auto w-full rounded-lg border-2 border-[#f7eee323] bg-[#121212] p-6 text-[#f7eee3]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl">{monthNames[currentMonth]}</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewEvent}
            // variant="default"
            className="border-2 flex px-4 py-1 rounded-md border-[#f7eee323] font-serif hover:border-none justify-center items-end hover:bg-orange-600"
          >
            Add 
          </button>
        </div>
      </div>

      {/* Date Picker */}
      <div
        ref={datePickerRef}
        className="no-scrollbar mb-4 flex h-auto space-x-4 overflow-x-auto border-b border-neutral-800 pb-2"
      >
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => (
          <button
            key={date}
            onClick={() => handleDateClick(date)}
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-serif font-bold ${
              selectedDate === date
                ? "border-2 border-[#f7eee323] bg-neutral-800 text-[#f7eee3]"
                : "text-gray-400 hover:bg-neutral-800"
            }`}
            ref={selectedDate === date ? activeDateRef : null}
          >
            {date}
          </button>
        ))}
      </div>

      {/* Events box for the selected date */}
      <div className="relative h-40 overflow-y-auto" id="box">
        {filteredEvents.map((event, index) => (
          <div
            key={event.id || index}
            className="absolute flex h-8 items-center justify-center rounded-md bg-neutral-800 p-2 text-[#f7eee3]"
            style={{
              left: "0",
              right: "0",
              top: `${index * 3}rem`,
            }}
            onDoubleClick={() => handleEditStart(event)}
          >
            {editingEvent === event ? (
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-neutral-800 p-1 tracking-tight text-white"
                value={editText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <span>{event.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}