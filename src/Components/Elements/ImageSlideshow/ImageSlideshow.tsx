import { useState } from "react";
import { TThemeColor } from "../../../types";
import styles from "./styles.module.css";

type TDirection = "next" | "prev";

const ImageSlideshow = ({
  images,
  randomColor,
}: {
  images:
    | {
        url: string | undefined;
      }[]
    | undefined;
  randomColor: TThemeColor | undefined;
}) => {
  const [imgIndex, setImgIndex] = useState<number>(0);

  const [slideshowDirection, setSlideshowDirection] = useState<TDirection>("next");

  const changeImage = (direction: TDirection): void => {
    /* Necessary to setSlideshowDirection state value here (its existence is necessary, too) because, if an image doesn't exist (error 404 occurs on the image) while user is scrolling through a park's images, the image that follows the erroneous image in the sequence, whether the user is moving forward or backward through the image array, should be displayed, & the onError callback function needs to know the direction in which the user is scrolling through the images. */
    if (direction !== slideshowDirection) {
      setSlideshowDirection(direction);
    }
    if (imgIndex !== undefined) {
      if (direction === "next" && images) {
        imgIndex === images.length - 1 ? setImgIndex(0) : setImgIndex(imgIndex + 1);
      } else {
        imgIndex === 0 && images
          ? setImgIndex(images.length - 1)
          : setImgIndex(imgIndex - 1);
      }
    }
  };

  return (
    <div className={styles.slideshowContainer}>
      {images && images.length > 1 && (
        <i
          onClick={() => {
            changeImage("prev");
          }}
          className="fas fa-angle-right"
          title="Previous Image"
        ></i>
      )}
      <div className={styles.slideshowImgContainer}>
        {/* If imgIndex is specifically not undefined (not just falsy), show image/alt text. imgIndex should never be falsy, as its value is set whenever this component renders, though it is initialized as undefined. It's not good practice to initialize it, then change it again as soon as component renders. */}
        {imgIndex !== undefined && (
          <img
            src={images && images[imgIndex].url}
            onError={() => changeImage(slideshowDirection)}
            style={{ "border": `2px solid ${randomColor}` }}
          />
        )}
      </div>
      {images && images.length > 1 && (
        <i
          onClick={() => {
            changeImage("next");
          }}
          className="fas fa-angle-right"
          title="Next Image"
        ></i>
      )}
    </div>
  );
};
export default ImageSlideshow;
