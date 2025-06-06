import { TThemeColor, TUser, TEvent, TEventInviteeOrOrganizer } from "../../../types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ImageSlideshow from "../../Elements/ImageSlideshow/ImageSlideshow";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import Tab from "../../Elements/Tab/Tab";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useChatContext } from "../../../Hooks/useChatContext";
import Requests from "../../../requests";

const EventPage = () => {
  const { isLoading, theme, error, setError } = useMainContext();

  if (error) {
    throw new Error(error);
  }

  const {
    currentUser,
    userCreatedAccount,
    setCurrentOtherUser,
    logout,
    getOtherUserFriends,
  } = useUserContext();

  const {
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    setCurrentEvent,
    handleRemoveInvitee,
    fetchAllEventsQuery,
    showRSVPs,
    setShowRSVPs,
    showInvitees,
    setShowInvitees,
  } = useEventContext();
  const { startConversation } = useChatContext();

  // Get most current version of event to which this page pertains:
  const { eventID } = useParams();
  const allEvents = fetchAllEventsQuery.data;
  const currentEvent: TEvent | undefined = allEvents
    ? allEvents.filter((ev) => ev._id === eventID)[0]
    : undefined;

  const userRSVPd: boolean =
    currentUser && currentUser._id && currentEvent
      ? currentEvent.interestedUsers
          .map((i) => i._id)
          .includes(currentUser._id.toString())
      : false;

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [
    currentUserHasBeenBlockedByAnOrganizer,
    setCurrentUserHasBeenBlockedByAnOrganizer,
  ] = useState<boolean>(false);

  const [
    organizersWhoHaveNotBlockedUserButHaveHiddenProfile,
    setOrganizersWhoHaveNotBlockedUserButHaveHiddenProfile,
  ] = useState<TEventInviteeOrOrganizer[]>([]);

  const [organizersWhoseProfileIsVisible, setOrganizersWhoseProfileIsVisible] = useState<
    TEventInviteeOrOrganizer[]
  >([]);

  /* 
  If event is private & currentUser isn't organizer or invitee, or if currentUser was blocked by one of the organizers, currentUser doesn't have access to event
  */
  const eventOrganizersIDs: (string | undefined)[] | undefined =
    currentEvent?.organizers.map((org) => org._id && org._id.toString());

  const getEventOrganizers = async (): Promise<TUser[]> => {
    let eventOrganizers: TUser[] = [];

    if (eventOrganizersIDs) {
      for (const org of eventOrganizersIDs) {
        if (org) {
          await Requests.getUserByID(org)
            .then((res) => {
              if (res.ok) {
                res.json().then((organizer: TUser) => eventOrganizers.push(organizer));
              } else {
                setError("Error fetching event organizers");
              }
            })
            .catch((error) => console.log(error));
        }
      }
    }

    if (currentUser) {
      setOrganizersWhoseProfileIsVisible(
        eventOrganizers
          .filter((organizer) => {
            if (currentUser && currentUser._id) {
              const currentUserIsFriend: boolean = organizer.friends.includes(
                currentUser._id.toString()
              );

              const currentUserIsFriendOfFriend: boolean =
                currentUser && currentUser._id && organizer._id
                  ? getOtherUserFriends(organizer._id.toString()).some(
                      (otherUserFriend) =>
                        currentUser._id &&
                        otherUserFriend.friends.includes(currentUser._id.toString())
                    )
                  : false;

              // Return TOtherUser version of event organizer
              if (
                (organizer._id !== currentUser._id &&
                  organizer.profileVisibleTo === "friends" &&
                  currentUserIsFriend) ||
                (organizer.profileVisibleTo === "friends of friends" &&
                  currentUserIsFriendOfFriend) ||
                organizer.profileVisibleTo === "anyone"
              ) {
                return organizer;
              }
            }
          })
          .map((organizer) => {
            return {
              _id: organizer._id,
              username: organizer.username,
              firstName: organizer.firstName,
              lastName: organizer.lastName,
              profileImage: organizer.profileImage,
              emailAddress: organizer.emailAddress,
            };
          })
      );

      setOrganizersWhoHaveNotBlockedUserButHaveHiddenProfile(
        eventOrganizers
          .filter((organizer) => {
            if (organizer._id && currentUser && currentUser._id) {
              const currentUserIsFriend: boolean = organizer.friends.includes(
                currentUser._id.toString()
              );

              const currentUserIsFriendOfFriend: boolean =
                currentUser && currentUser._id && organizer._id
                  ? getOtherUserFriends(organizer._id.toString()).some(
                      (otherUserFriend) =>
                        currentUser._id &&
                        otherUserFriend.friends.includes(currentUser._id.toString())
                    )
                  : false;

              // Return TOtherUser version of event organizer
              if (
                (organizer.profileVisibleTo === "friends" && !currentUserIsFriend) ||
                (organizer.profileVisibleTo === "friends of friends" &&
                  !currentUserIsFriendOfFriend)
              ) {
                return organizer;
              }
            }
          })
          .map((organizer) => {
            return {
              _id: organizer._id,
              username: organizer.username,
              firstName: organizer.firstName,
              lastName: organizer.lastName,
              profileImage: organizer.profileImage,
              emailAddress: organizer.emailAddress,
            };
          })
      );
    }

    return eventOrganizers;
  };

  const eventIsPrivateAndCurrentUserIsNotOrganizerOrInvitee =
    currentEvent &&
    currentUser &&
    currentUser._id &&
    currentEvent.publicity === "private" &&
    (!currentEvent.invitees.map((i) => i._id).includes(currentUser._id.toString()) ||
      !currentEvent.organizers.map((o) => o._id).includes(currentUser._id.toString()))
      ? true
      : false;

  const userDoesNotHaveAccess: boolean =
    eventIsPrivateAndCurrentUserIsNotOrganizerOrInvitee ||
    currentUserHasBeenBlockedByAnOrganizer ||
    !currentUser ||
    userCreatedAccount === null;

  useEffect(() => {
    // Redirect user to their homepage or to login page if event is private & they are not an invitee or organizer
    if (userDoesNotHaveAccess) {
      toast.error("You do not have permission to edit or view this event.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      if (currentUser && userCreatedAccount !== null) {
        navigation(`/${currentUser.username}`);
      } else {
        logout();
      }
    }

    // Set randomColor:
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);

    setCurrentEvent(currentEvent);

    window.scrollTo(0, 0);
  }, [currentUserHasBeenBlockedByAnOrganizer]);

  /* Every time fetchAllVisibleOtherUsersQuery.data or allEvents change, set refinedInterestedUsers, which checks that the id in event's interestedUsers array exists, so that when a user deletes their account, they won't still be counted as an interested user in a given event. */
  useEffect(() => {
    getEventOrganizers().then((userArray) => {
      if (currentUser && currentUser._id) {
        for (const organizer of userArray) {
          if (organizer.blockedUsers.includes(currentUser._id.toString())) {
            setCurrentUserHasBeenBlockedByAnOrganizer(true);
          }
        }
      }
    });
  }, [allEvents]);

  const nextEventDateTime = currentEvent
    ? new Date(currentEvent.eventStartDateTimeInMS)
    : undefined;

  // Explicitly return true or false to avoid TS error
  const userIsOrganizer: boolean =
    currentUser &&
    currentUser._id &&
    currentEvent?.organizers.map((o) => o._id).includes(currentUser._id.toString())
      ? true
      : false;

  const maxInviteesReached: boolean =
    currentEvent && currentEvent.maxParticipants
      ? currentEvent.invitees.length ===
        currentEvent.maxParticipants - currentEvent?.organizers.length
      : false;

  const getRSVPButtonText = (): string => {
    if (maxInviteesReached) {
      return "Max participants reached";
    } else if (userRSVPd) {
      return "Remove RSVP";
    }
    return "RSVP";
  };
  const rsvpButtonText = getRSVPButtonText();

  const now = Date.now();

  const getStatus = (): string | undefined => {
    if (
      currentEvent &&
      Math.abs(currentEvent.eventStartDateTimeInMS - now) <= 3600000 &&
      currentEvent.eventEndDateTimeInMS > now
    ) {
      return "Recently started";
    } else if (
      currentEvent &&
      currentEvent.eventEndDateTimeInMS > now &&
      currentEvent.eventStartDateTimeInMS < now
    ) {
      return "Happening now!";
    }
    return undefined;
  };
  const status: string | undefined = getStatus();

  const isNoFetchError: boolean = !fetchAllEventsQuery.isError;

  const fetchIsLoading: boolean = fetchAllEventsQuery.isLoading;

  return (
    <>
      {isNoFetchError && !fetchIsLoading && currentEvent && !userDoesNotHaveAccess && (
        <>
          {showInvitees && (
            <UserListModal
              listType="invitees"
              renderButtonOne={true}
              renderButtonTwo={true}
              closeModalMethod={setShowInvitees}
              header="Invitees"
              userIDArray={currentEvent.invitees.map((i) => i._id?.toString())}
              buttonOneText="Message"
              buttonOneHandler={startConversation}
              buttonOneHandlerNeedsEventParam={false}
              buttonTwoText="Remove"
              buttonTwoHandler={handleRemoveInvitee}
              buttonTwoHandlerNeedsEventParam={true}
              randomColor={randomColor}
            />
          )}
          {showRSVPs && (
            <UserListModal
              listType="rsvpd-users"
              renderButtonOne={true}
              renderButtonTwo={true}
              closeModalMethod={setShowRSVPs}
              header="RSVPs"
              userIDArray={currentEvent.interestedUsers.map((user) =>
                user._id?.toString()
              )}
              buttonOneText="Message"
              buttonOneHandler={startConversation}
              buttonOneHandlerNeedsEventParam={false}
              buttonTwoText="Remove"
              buttonTwoHandler={handleDeleteUserRSVP}
              buttonTwoHandlerNeedsEventParam={false}
              randomColor={randomColor}
            />
          )}
          <div
            style={{
              border: `2px solid ${randomColor}`,
              boxShadow: `${randomColor} 0px 7px 90px`,
            }}
            className="eventMainInfoContainer"
          >
            {status && (
              <p style={{ backgroundColor: randomColor, padding: "0.5rem" }}>{status}</p>
            )}
            <h1 style={{ "color": randomColor }}>{currentEvent.title}</h1>
            <div className="event-organizers-container">
              {currentEvent.organizers.length > 1 ? (
                <p>Organizers: </p>
              ) : (
                <p>Organizer: </p>
              )}
              <div className="organizer-tabs-container">
                {currentUser &&
                  currentUser._id &&
                  eventOrganizersIDs?.includes(currentUser._id.toString()) && (
                    <Tab
                      info={currentUser}
                      randomColor={randomColor}
                      userMayNotDelete={true}
                    />
                  )}
                {organizersWhoseProfileIsVisible.map((organizer) => (
                  <Link
                    key={organizer._id?.toString()}
                    to={`/users/${organizer.username}`}
                    onClick={() => {
                      if (organizer._id) {
                        Requests.getUserByID(organizer._id.toString()).then((res) => {
                          if (res.ok) {
                            res.json().then((organizer) =>
                              setCurrentOtherUser({
                                _id: organizer._id,
                                index: undefined,
                                firstName: organizer.firstName,
                                lastName: organizer.lastName,
                                username: organizer.username,
                                city: organizer.city,
                                stateProvince: organizer.stateProvince,
                                country: organizer.country,
                                phoneCountry: organizer.phoneCountry,
                                phoneCountryCode: organizer.phoneCountryCode,
                                phoneNumberWithoutCountryCode:
                                  organizer.phoneNumberWithoutCountryCode,
                                emailAddress: organizer.emailAddress,
                                instagram: organizer.instagram,
                                facebook: organizer.facebook,
                                x: organizer.x,
                                profileImage: organizer.profileImage,
                                about: organizer.about,
                                friends: organizer.friends,
                                interests: organizer.interests,
                              })
                            );
                          }
                        });
                      }
                    }}
                  >
                    <Tab
                      info={organizer}
                      randomColor={randomColor}
                      userMayNotDelete={true}
                    />
                  </Link>
                ))}
                {organizersWhoHaveNotBlockedUserButHaveHiddenProfile.map((organizer) => (
                  <Tab
                    key={organizer._id?.toString()}
                    info={organizer}
                    randomColor={randomColor}
                    userMayNotDelete={true}
                  />
                ))}
              </div>
            </div>
            <div>
              <p>{currentEvent?.description}</p>
              {currentEvent?.additionalInfo !== "" && (
                <p>{currentEvent?.additionalInfo}</p>
              )}
            </div>

            <div className="eventDetailsContainer">
              <div
                style={{ borderColor: randomColor }}
                className={
                  currentEvent.images && currentEvent.images.length > 0
                    ? "eventMainInfoTextContainerWithImage"
                    : "eventMainInfoTextContainerNoImage"
                }
              >
                <div>
                  <p>
                    {nextEventDateTime?.toDateString()} at{" "}
                    {nextEventDateTime?.toLocaleTimeString()}
                  </p>
                  <p>{`${currentEvent.address}`}</p>
                  <p>{`${currentEvent.city}, ${currentEvent.stateProvince}, ${currentEvent.country}`}</p>
                </div>
                <div>
                  {currentEvent.invitees.length > 0 && (
                    <p>
                      Invitees:{" "}
                      <span
                        onClick={() =>
                          currentUser?._id &&
                          currentEvent.organizers
                            .map((o) => o._id)
                            .includes(currentUser._id.toString()) &&
                          currentEvent.invitees.length > 0
                            ? setShowInvitees(true)
                            : undefined
                        }
                        className={
                          currentUser?._id &&
                          currentEvent.organizers
                            .map((o) => o._id)
                            .includes(currentUser._id.toString()) &&
                          currentEvent.invitees.length > 0
                            ? "show-listed-users-or-invitees"
                            : undefined
                        }
                      >{`${currentEvent.invitees.length}`}</span>
                    </p>
                  )}
                  <p>
                    RSVPs:{" "}
                    <span
                      onClick={() =>
                        currentUser?._id &&
                        currentEvent.organizers
                          .map((o) => o._id)
                          .includes(currentUser._id.toString()) &&
                        currentEvent.interestedUsers.length > 0
                          ? setShowRSVPs(true)
                          : undefined
                      }
                      className={
                        currentUser?._id &&
                        currentEvent.organizers
                          .map((o) => o._id)
                          .includes(currentUser._id.toString()) &&
                        currentEvent.interestedUsers.length > 0
                          ? "show-listed-users-or-invitees"
                          : undefined
                      }
                    >{`${currentEvent.interestedUsers.length}`}</span>
                  </p>
                </div>
              </div>
              {currentEvent.images && currentEvent.images.length > 0 && (
                <ImageSlideshow
                  randomColor={randomColor}
                  images={currentEvent.images && currentEvent.images}
                />
              )}
            </div>
            {userCreatedAccount === null && (
              <>
                <p>
                  Please log in or sign up to edit RSVP or to make changes to this event.
                </p>
                <Link to={`/`}>
                  <div className="theme-element-container">
                    <button style={{ "backgroundColor": randomColor }}>
                      Log in/Sign up
                    </button>
                  </div>
                </Link>
              </>
            )}
            {currentEvent.eventEndDateTimeInMS > now &&
              currentUser &&
              userCreatedAccount !== null &&
              (!userIsOrganizer ? (
                <div className="theme-element-container">
                  <button
                    disabled={maxInviteesReached || isLoading}
                    onClick={(e) => {
                      if (userRSVPd && currentUser) {
                        handleDeleteUserRSVP(currentEvent, currentUser, e);
                      } else if (!userRSVPd) {
                        handleAddUserRSVP(e, currentEvent);
                      }
                    }}
                  >
                    {rsvpButtonText}
                  </button>
                </div>
              ) : (
                <Link to={`/edit-event/${currentEvent._id}`}>
                  <div className="theme-element-container">
                    <button onClick={() => setCurrentEvent(currentEvent)}>
                      Edit Event
                    </button>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
      {isNoFetchError && !fetchIsLoading && !currentEvent && (
        <>
          <h1>Sorry, this event doesn't exist.</h1>
          <Link to={"/find-events"}>
            <div className="theme-element-container">
              <button>Back to All Events</button>
            </div>
          </Link>
        </>
      )}
      {fetchIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {!isNoFetchError && (
        <div className="query-error-container">
          <header className="query-status-text">Couldn't fetch data.</header>
          <div className="theme-element-container">
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
    </>
  );
};

export default EventPage;
