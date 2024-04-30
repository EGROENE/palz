import { useEffect, useState } from "react";
import { TEvent } from "../../types";

const EventCard = ({ event }: { event: TEvent }) => {
  const [randomColor, setRandomColor] = useState<string>("");

  const nextEventDateTime: Date = new Date(event.nextEventTime);

  // Set color of event card's border randomly:
  useEffect(() => {
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  return (
    <div className="event-card" style={{ borderColor: randomColor }}>
      <div className="event-info-container">
        <header>{event.title}</header>
        <p>
          {nextEventDateTime.toDateString()} at {nextEventDateTime.toLocaleTimeString()}
        </p>
        <div className="event-buttons-container">
          <button style={{ backgroundColor: randomColor }}>See Event</button>
          <button>Remove RSVP</button>
        </div>
      </div>
      <img src={event.imageOne?.src} alt={event.imageOne?.altText} />
    </div>
  );
};

export default EventCard;
