import { TEvent } from "../../types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import ImageSlideshow from "../ImageSlideshow/ImageSlideshow";
import NavBar from "../NavBar/NavBar";

const EventPage = () => {
  const { allEvents, getMostCurrentEvents, currentUser } = useMainContext();
  const { handleDeleteUserRSVP, handleAddUserRSVP, showSidebar, setShowSidebar } =
    useUserContext();
  const { eventID } = useParams();
  const [event, setEvent] = useState<TEvent>(
    allEvents.filter((ev) => ev.id === eventID)[0]
  );

  const [randomColor, setRandomColor] = useState<string>("");
  useEffect(() => {
    getMostCurrentEvents();
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

  useEffect(() => {
    setEvent(allEvents.filter((ev) => ev.id === eventID)[0]);
  }, [allEvents]);

  const nextEventDateTime = event ? new Date(event.nextEventTime) : undefined;

  const userRSVPd =
    currentUser?.username && event?.interestedUsers.includes(currentUser.username);

  const getImagesArray = ():
    | {
        url: string | undefined;
        altText: string | undefined;
      }[]
    | undefined => {
    if (
      event?.imageOne?.src !== "" &&
      event?.imageTwo?.src !== "" &&
      event?.imageThree?.src !== ""
    ) {
      return [
        { url: event?.imageOne?.src, altText: event?.imageOne?.altText },
        { url: event?.imageTwo?.src, altText: event?.imageTwo?.altText },
        { url: event?.imageThree?.src, altText: event?.imageThree?.altText },
      ];
    } else if (event?.imageOne?.src !== "" && event?.imageTwo?.src !== "") {
      return [
        { url: event?.imageOne?.src, altText: event?.imageOne?.altText },
        { url: event?.imageTwo?.src, altText: event?.imageTwo?.altText },
      ];
    } else if (event?.imageOne?.src !== "") {
      return [{ url: event?.imageOne?.src, altText: event?.imageOne?.altText }];
    }
  };
  const eventImages = getImagesArray();

  return (
    <div onClick={() => showSidebar && setShowSidebar(false)} className="event-page-hero">
      <NavBar />
      {event ? (
        <>
          <div
            style={{
              border: `2px solid ${randomColor}`,
              boxShadow: `${randomColor} 0px 30px 90px`,
            }}
            className="event-main-info-container"
          >
            <h1 style={{ "color": randomColor }}>{event.title}</h1>
            <div className="event-main-info-text-container">
              <div>
                <p>
                  {nextEventDateTime?.toDateString()} at{" "}
                  {nextEventDateTime?.toLocaleTimeString()}
                </p>
                <p>{`${event.address} ${event.postalCode}`}</p>
                <p>{`${event.city}, ${event.stateProvince}, ${event.country}`}</p>
              </div>
              <div>
                {event?.organizers.length === 1 ? (
                  <p>Organizer: {event.organizers[0]}</p>
                ) : (
                  <p>Organizers: {event.organizers.join(", ")}</p>
                )}
                <p>{`RSVPs: ${event.interestedUsers.length}`}</p>
              </div>
            </div>
            <button
              style={{ "backgroundColor": randomColor }}
              onClick={(e) =>
                userRSVPd ? handleDeleteUserRSVP(e, event) : handleAddUserRSVP(e, event)
              }
            >
              {userRSVPd ? "Remove RSVP" : "RSVP"}
            </button>
          </div>
          <div className="further-event-info-container">
            {event.imageOne?.src !== "" && (
              <ImageSlideshow randomColor={randomColor} images={eventImages} />
            )}
            <div>
              <p>{event?.description}</p>
              {event?.additionalInfo !== "" && <p>{event?.additionalInfo}</p>}
            </div>
          </div>
        </>
      ) : (
        <>
          <h1>Sorry, this event doesn't exist anymore.</h1>
          <Link to={"/events"}>
            <button>Back to All Events</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default EventPage;
