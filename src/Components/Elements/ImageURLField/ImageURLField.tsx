import Methods from "../../../methods";
import { TThemeColor } from "../../../types";

type TImageURLFieldProps = {
  imageNumber: "one" | "two" | "three";
  imageFieldRef: React.MutableRefObject<HTMLInputElement | null>;
  onFocusHandler: (
    value: React.SetStateAction<
      | "title"
      | "description"
      | "additionalInfo"
      | "city"
      | "state"
      | "address"
      | "startDate"
      | "startTime"
      | "endDate"
      | "endTime"
      | "maxParticipants"
      | "public"
      | "private"
      | `image${string}`
      | "coOrganizers"
      | "invitees"
      | undefined
    >
  ) => void;
  onBlurHandler: (
    value: React.SetStateAction<
      | "title"
      | "description"
      | "additionalInfo"
      | "city"
      | "state"
      | "address"
      | "startDate"
      | "startTime"
      | "endDate"
      | "endTime"
      | "maxParticipants"
      | "public"
      | "private"
      | `image${string}`
      | "coOrganizers"
      | "invitees"
      | undefined
    >
  ) => void;
  focusedElement:
    | "title"
    | "description"
    | "additionalInfo"
    | "city"
    | "state"
    | "address"
    | "startDate"
    | "startTime"
    | "endDate"
    | "endTime"
    | "maxParticipants"
    | "public"
    | "private"
    | `image${string}`
    | "coOrganizers"
    | "invitees"
    | undefined;
  randomColor: TThemeColor | undefined;
  isLoading: boolean;
  imageError: string;
  imageURL: string | undefined;
  handleImageURLInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    imageNumber: "one" | "two" | "three"
  ) => void;
};

const ImageURLField = ({
  imageNumber,
  imageFieldRef,
  onFocusHandler,
  onBlurHandler,
  focusedElement,
  randomColor,
  isLoading,
  imageError,
  imageURL,
  handleImageURLInput,
}: TImageURLFieldProps) => {
  return (
    <label>
      <p>{`Image ${Methods.getCapitalizedWord(imageNumber)} (optional)`}</p>
      <input
        ref={imageFieldRef}
        onFocus={() => onFocusHandler(`image${Methods.getCapitalizedWord(imageNumber)}`)}
        onBlur={() => onBlurHandler(undefined)}
        style={
          focusedElement === `image${Methods.getCapitalizedWord(imageNumber)}`
            ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
            : undefined
        }
        disabled={isLoading}
        className={imageError !== "" ? "erroneous-field" : undefined}
        value={imageURL}
        onChange={(e) => handleImageURLInput(e, imageNumber)}
        placeholder="Link to image"
      />
    </label>
  );
};
export default ImageURLField;
