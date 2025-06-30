import { TThemeColor, TEvent, TBarebonesUser, TUser } from "../../../types";
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
import Methods from "../../../methods";

const EventPage = () => {
  const { isLoading, theme, error, setError } = useMainContext();

  if (error) {
    throw new Error(error);
  }

  const { currentUser, userCreatedAccount, setCurrentOtherUser, logout } =
    useUserContext();

  const {
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    setCurrentEvent,
    handleRemoveInvitee,
    showRSVPs,
    setShowRSVPs,
    showInvitees,
    showDeclinedInvitations,
    setShowInvitees,
    setShowDeclinedInvitations,
    currentEvent,
    handleRemoveDisinterestedUser,
  } = useEventContext();
  const { getStartOrOpenChatWithUserHandler } = useChatContext();

  // Get most current version of event to which this page pertains:
  const { eventID } = useParams();

  const userRSVPd: boolean =
    currentUser && currentUser._id && currentEvent
      ? currentEvent.interestedUsers.includes(currentUser._id.toString())
      : false;

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [fetchEventIsLoading, setFetchEventIsLoading] = useState<boolean>(false);
  const [fetchEventIsError, setFetchEventIsError] = useState<boolean>(false);

  const [fetchOrganizersIsLoading, setFetchOrganizersIsLoading] =
    useState<boolean>(false);
  const [fetchOrganizersIsError, setFetchOrganizersIsError] = useState<boolean>(false);

  const [currentUserIsFriendOfFriend, setCurrentUserIsFriendOfFriend] =
    useState<boolean>(false);

  const [
    organizersWhoHaveNotBlockedUserButHaveHiddenProfile,
    setOrganizersWhoHaveNotBlockedUserButHaveHiddenProfile,
  ] = useState<TBarebonesUser[]>([]);

  const [organizersWhoseProfileIsVisible, setOrganizersWhoseProfileIsVisible] = useState<
    TBarebonesUser[]
  >([]);

  const [userDoesNotHaveAccess, setUserDoesNotHaveAccess] = useState<boolean>(false);

  useEffect(() => {
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

    window.scrollTo(0, 0);

    // Set currentEvent based on param:
    if (eventID) {
      setFetchEventIsLoading(true);
      Requests.getEventByID(eventID)
        .then((res) => {
          if (res.ok) {
            res.json().then((event: TEvent) => setCurrentEvent(event));
          } else {
            setFetchEventIsError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchEventIsLoading(false));
    } else {
      setFetchEventIsError(true);
    }
  }, []);

  useEffect(() => {
    // Set eventOrganizers, other vars:
    if (currentEvent) {
      // Redirect user to their homepage or to login page if event is private & they are not an invitee or organizer
      const promisesToAwaitOrganizers = currentEvent.organizers.map((id) => {
        return Requests.getUserByID(id).then((res) => {
          return res.json().then((user: TUser) => user);
        });
      });

      if (!fetchOrganizersIsLoading) {
        setFetchOrganizersIsLoading(true);
      }

      Promise.all(promisesToAwaitOrganizers)
        .then((organizers: TUser[]) => {
          if (currentUser && currentUser._id) {
            const currentUserHasBeenBlockedByAnOrganizer = organizers.some((o) => {
              if (currentUser && currentUser._id) {
                return o.blockedUsers.includes(currentUser?._id?.toString());
              }
            });

            const eventIsPrivateAndCurrentUserIsNotOrganizerOrInvitee =
              currentEvent &&
              currentEvent.publicity === "private" &&
              (!currentEvent.invitees.includes(currentUser._id.toString()) ||
                !currentEvent.organizers.includes(currentUser._id.toString()))
                ? true
                : false;

            const userDoesNotHaveAccess: boolean =
              eventIsPrivateAndCurrentUserIsNotOrganizerOrInvitee ||
              currentUserHasBeenBlockedByAnOrganizer ||
              !currentUser ||
              userCreatedAccount === null;

            setUserDoesNotHaveAccess(userDoesNotHaveAccess);

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

            setOrganizersWhoHaveNotBlockedUserButHaveHiddenProfile(
              organizers
                .map((o) => {
                  const currentUserIsFriend = currentUser._id
                    ? o.friends.includes(currentUser._id.toString())
                    : false;

                  const promisesToAwaitOrganizerFriends = o.friends.map((id) => {
                    return Requests.getUserByID(id).then((res) => {
                      return res.json().then((user: TUser) => user);
                    });
                  });

                  Promise.all(promisesToAwaitOrganizerFriends)
                    .then((organizerFriends: TUser[]) => {
                      if (
                        organizerFriends.some((f) => {
                          if (currentUser._id) {
                            return f.friends.includes(currentUser._id?.toString());
                          }
                        })
                      ) {
                        setCurrentUserIsFriendOfFriend(true);
                      }
                    })
                    .catch((error) => {
                      console.log(error);
                      setFetchOrganizersIsError(true);
                    });

                  if (
                    currentUser._id &&
                    !o.blockedUsers.includes(currentUser._id.toString()) &&
                    ((o.profileVisibleTo === "friends" && !currentUserIsFriend) ||
                      (o.profileVisibleTo === "friends of friends" &&
                        !currentUserIsFriendOfFriend))
                  ) {
                    return Methods.getTBarebonesUser(o);
                  }
                })
                .filter((elem) => elem !== undefined)
            );

            setOrganizersWhoseProfileIsVisible(
              organizers
                .map((o) => {
                  const currentUserIsFriend = currentUser._id
                    ? o.friends.includes(currentUser._id.toString())
                    : false;

                  if (
                    o.profileVisibleTo === "anyone" ||
                    (o.profileVisibleTo === "friends" && currentUserIsFriend) ||
                    (o.profileVisibleTo === "friends of friends" &&
                      currentUserIsFriendOfFriend)
                  ) {
                    return Methods.getTBarebonesUser(o);
                  }
                })
                .filter((elem) => elem !== undefined)
            );
          }
        })
        .catch((error) => {
          console.log(error);
          setFetchOrganizersIsError(true);
        })
        .finally(() => setFetchOrganizersIsLoading(false));
    }
  }, [currentEvent]);

  const nextEventDateTime = currentEvent
    ? new Date(currentEvent.eventStartDateTimeInMS)
    : undefined;

  // Explicitly return true or false to avoid TS error
  const userIsOrganizer: boolean =
    currentUser &&
    currentUser._id &&
    currentEvent?.organizers.includes(currentUser._id.toString())
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

  const isNoFetchError: boolean = !fetchEventIsError && !fetchOrganizersIsError;

  const fetchIsLoading: boolean = fetchEventIsLoading || fetchOrganizersIsLoading;

  return (
    !userDoesNotHaveAccess && (
      <>
        {isNoFetchError && !fetchIsLoading && currentEvent && (
          <>
            {showInvitees && (
              <UserListModal
                listType="invitees"
                renderButtonOne={true}
                renderButtonTwo={true}
                closeModalMethod={setShowInvitees}
                header="Invitees"
                users={currentEvent.invitees}
                fetchUsers={true}
                buttonOneText="Message"
                buttonOneHandler={getStartOrOpenChatWithUserHandler}
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
                users={currentEvent.interestedUsers}
                fetchUsers={true}
                buttonOneText="Message"
                buttonOneHandler={getStartOrOpenChatWithUserHandler}
                buttonOneHandlerNeedsEventParam={false}
                buttonTwoText="Remove"
                buttonTwoHandler={handleDeleteUserRSVP}
                buttonTwoHandlerNeedsEventParam={false}
                randomColor={randomColor}
              />
            )}
            {showDeclinedInvitations && (
              <UserListModal
                listType="declined-invitations"
                renderButtonOne={true}
                renderButtonTwo={false}
                closeModalMethod={setShowDeclinedInvitations}
                header="Declined Invitations"
                users={currentEvent.disinterestedUsers}
                fetchUsers={true}
                buttonOneText="Message"
                buttonOneHandler={getStartOrOpenChatWithUserHandler}
                buttonOneHandlerNeedsEventParam={false}
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
                <p style={{ backgroundColor: randomColor, padding: "0.5rem" }}>
                  {status}
                </p>
              )}
              <h1 style={{ "color": randomColor }}>{currentEvent.title}</h1>
              <div className="event-organizers-container">
                {currentEvent.organizers.length > 1 ? (
                  <p>Organizers: </p>
                ) : (
                  <p>Organizer: </p>
                )}
                <div className="organizer-tabs-container">
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
                            } else {
                              setError("Could not load other user's info.");
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
                  {organizersWhoHaveNotBlockedUserButHaveHiddenProfile.map(
                    (organizer) => (
                      <Tab
                        key={organizer._id?.toString()}
                        info={organizer}
                        randomColor={randomColor}
                        userMayNotDelete={true}
                      />
                    )
                  )}
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
                    {currentUser &&
                      currentUser._id &&
                      currentEvent.invitees.length > 0 &&
                      currentEvent.organizers.includes(currentUser._id.toString()) && (
                        <p>
                          Invitees:{" "}
                          <span
                            onClick={() => setShowInvitees(true)}
                            className="show-listed-users-or-invitees"
                          >{`${currentEvent.invitees.length}`}</span>
                        </p>
                      )}
                    <p>
                      RSVPs:{" "}
                      <span
                        onClick={() =>
                          currentUser?._id &&
                          currentEvent.organizers.includes(currentUser._id.toString()) &&
                          currentEvent.interestedUsers.length > 0
                            ? setShowRSVPs(true)
                            : undefined
                        }
                        className={
                          currentUser?._id &&
                          currentEvent.organizers.includes(currentUser._id.toString()) &&
                          currentEvent.interestedUsers.length > 0
                            ? "show-listed-users-or-invitees"
                            : undefined
                        }
                      >{`${currentEvent.interestedUsers.length}`}</span>
                    </p>
                    {currentUser &&
                      currentUser._id &&
                      currentEvent.disinterestedUsers.length > 0 &&
                      currentEvent.organizers.includes(currentUser._id?.toString()) && (
                        <p>
                          Declined invitations:{" "}
                          <span
                            onClick={() => setShowDeclinedInvitations(true)}
                            className="show-listed-users-or-invitees"
                          >{`${currentEvent.disinterestedUsers.length}`}</span>
                        </p>
                      )}
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
                    Please log in or sign up to edit RSVP or to make changes to this
                    event.
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
                !userIsOrganizer && (
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
                )}
              {currentEvent.eventEndDateTimeInMS > now &&
                currentUser &&
                userCreatedAccount !== null &&
                userIsOrganizer && (
                  <Link to={`/edit-event/${currentEvent._id}`}>
                    <div className="theme-element-container">
                      <button onClick={() => setCurrentEvent(currentEvent)}>
                        Edit Event
                      </button>
                    </div>
                  </Link>
                )}
              {currentEvent.eventEndDateTimeInMS > now &&
                currentUser &&
                currentUser._id &&
                userCreatedAccount !== null &&
                currentEvent.disinterestedUsers.includes(currentUser._id.toString()) &&
                currentEvent.invitees.includes(currentUser._id.toString()) && (
                  <>
                    <p>
                      You declined an invitation to this event. Would you like to undo
                      that?
                    </p>
                    <div className="theme-element-container">
                      <button
                        disabled={maxInviteesReached || isLoading}
                        onClick={() =>
                          handleRemoveDisinterestedUser(
                            currentEvent,
                            Methods.getTBarebonesUser(currentUser)
                          )
                        }
                      >
                        Undo
                      </button>
                    </div>
                  </>
                )}
            </div>
          </>
        )}
        {isNoFetchError && !fetchIsLoading && !currentEvent && (
          <>
            <h1>Sorry, this event doesn't exist.</h1>
            <Link to={"/find-events"}>
              <div className="theme-element-container">
                <button>See All Events</button>
              </div>
            </Link>
          </>
        )}
        {fetchIsLoading && (
          <header style={{ marginTop: "3rem" }} className="query-status-text">
            Loading...
          </header>
        )}
        {!isNoFetchError && !fetchIsLoading && (
          <p>Couldn't fetch data; try reloading the page.</p>
        )}
      </>
    )
  );
};

export default EventPage;
