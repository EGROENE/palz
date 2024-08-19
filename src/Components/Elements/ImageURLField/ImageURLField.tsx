import Methods from "../../../methods";
import { TThemeColor } from "../../../types";

type TImageURLFieldProps = {
  imageNumber: "one" | "two" | "three";
  ref: React.MutableRefObject<HTMLInputElement | null>;
  onFocusHandler: (
    value: React.SetStateAction<
      | "title"
      | "description"
      | "additionalInfo"
      | "city"
      | "state"
      | "address"
      | "date"
      | "time"
      | "maxParticipants"
      | "public"
      | "private"
      | "imageOne"
      | "imageTwo"
      | "imageThree"
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
    | "date"
    | "time"
    | "maxParticipants"
    | "public"
    | "private"
    | "imageOne"
    | "imageTwo"
    | "imageThree"
    | "coOrganizers"
    | "invitees"
    | undefined;
  randomColor: TThemeColor | undefined;
  isLoading: boolean;
  imageError: string;
  imageURL: string;
  handleImageURLInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    imageNumber: "one" | "two" | "three"
  ) => void;
};

const imageURLField = ({
  imageNumber,
  ref,
  onFocusHandler,
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
        ref={ref}
        onFocus={() => onFocusHandler}
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
export default imageURLField;
