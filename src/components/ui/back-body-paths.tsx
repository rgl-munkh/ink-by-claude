interface BackBodyPathsProps {
  selectedBodyPart?: string;
  onBodyPartClick?: (bodyPart: string) => void;
  getBodyPartClass: (bodyPart: string) => string;
}

export const BackBodyPaths = ({ onBodyPartClick, getBodyPartClass }: BackBodyPathsProps) => {
  const handleBodyPartClick = (bodyPart: string) => {
    if (onBodyPartClick) {
      onBodyPartClick(bodyPart);
    }
  };

  return (
    <>
      {/* Head */}
      <path
        data-key="back-head"
        onClick={() => handleBodyPartClick("head")}
        className={getBodyPartClass("head")}
        d="M101.818 43.13L113.008 37.5L124.198 43.19C124.198 43.02 124.218 42.85 124.228 42.69L124.238 42.53L124.228 42.36L124.198 42.19L124.158 42.03L124.098 41.87L124.028 41.72L123.948 41.57L123.858 41.43L123.758 41.3L123.648 41.18L123.528 41.07L123.398 40.97L123.258 40.88L123.118 40.8L122.968 40.74L122.818 40.69L122.658 40.66L122.498 40.64L122.338 40.64L113.008 40.64L113.008 0L112.008 0L112.008 40.64L102.678 40.64C102.518 40.64 102.358 40.66 102.198 40.69L102.048 40.74L101.898 40.8L101.758 40.88L101.628 40.97L101.508 41.07L101.398 41.18L101.298 41.3L101.208 41.43L101.128 41.57L101.058 41.72L100.998 41.87L100.948 42.03L100.908 42.19L100.878 42.36L100.868 42.53L100.878 42.69L100.888 42.85L100.908 43.02L101.818 43.13Z"
      />

      {/* Neck */}
      <path
        data-key="back-neck"
        onClick={() => handleBodyPartClick("neck")}
        className={getBodyPartClass("neck")}
        d="M124.198 43.19L113.008 37.5L101.818 43.13L104.498 51.78L121.518 51.78L124.198 43.19Z"
      />

      {/* Left Shoulder */}
      <path
        data-key="back-left-shoulder"
        onClick={() => handleBodyPartClick("left-shoulder")}
        className={getBodyPartClass("left-shoulder")}
        d="M121.518 51.78L138.538 51.78L148.478 67.29L138.538 82.8L121.518 82.8L121.518 51.78Z"
      />

      {/* Right Shoulder */}
      <path
        data-key="back-right-shoulder"
        onClick={() => handleBodyPartClick("right-shoulder")}
        className={getBodyPartClass("right-shoulder")}
        d="M104.498 51.78L87.478 51.78L77.538 67.29L87.478 82.8L104.498 82.8L104.498 51.78Z"
      />

      {/* Left Upper Arm */}
      <path
        data-key="back-left-upper-arm"
        onClick={() => handleBodyPartClick("left-upper-arm")}
        className={getBodyPartClass("left-upper-arm")}
        d="M148.478 67.29L164.988 67.29L174.928 82.8L164.988 98.31L148.478 98.31L138.538 82.8L148.478 67.29Z"
      />

      {/* Right Upper Arm */}
      <path
        data-key="back-right-upper-arm"
        onClick={() => handleBodyPartClick("right-upper-arm")}
        className={getBodyPartClass("right-upper-arm")}
        d="M77.538 67.29L61.028 67.29L51.088 82.8L61.028 98.31L77.538 98.31L87.478 82.8L77.538 67.29Z"
      />

      {/* Torso/Back */}
      <path
        data-key="back-torso"
        onClick={() => handleBodyPartClick("back")}
        className={getBodyPartClass("back")}
        d="M87.478 82.8L138.538 82.8L138.538 164.37L87.478 164.37L87.478 82.8Z"
      />

      {/* Left Forearm */}
      <path
        data-key="back-left-forearm"
        onClick={() => handleBodyPartClick("left-forearm")}
        className={getBodyPartClass("left-forearm")}
        d="M164.988 98.31L181.498 98.31L191.438 113.82L181.498 129.33L164.988 129.33L154.048 113.82L164.988 98.31Z"
      />

      {/* Right Forearm */}
      <path
        data-key="back-right-forearm"
        onClick={() => handleBodyPartClick("right-forearm")}
        className={getBodyPartClass("right-forearm")}
        d="M61.028 98.31L44.518 98.31L34.578 113.82L44.518 129.33L61.028 129.33L71.968 113.82L61.028 98.31Z"
      />

      {/* Left Hand */}
      <path
        data-key="back-left-hand"
        onClick={() => handleBodyPartClick("left-hand")}
        className={getBodyPartClass("left-hand")}
        d="M181.498 129.33L198.008 129.33L207.948 144.84L198.008 160.35L181.498 160.35L171.558 144.84L181.498 129.33Z"
      />

      {/* Right Hand */}
      <path
        data-key="back-right-hand"
        onClick={() => handleBodyPartClick("right-hand")}
        className={getBodyPartClass("right-hand")}
        d="M44.518 129.33L28.008 129.33L18.068 144.84L28.008 160.35L44.518 160.35L54.458 144.84L44.518 129.33Z"
      />

      {/* Left Buttock */}
      <path
        data-key="back-left-buttock"
        onClick={() => handleBodyPartClick("left-buttock")}
        className={getBodyPartClass("left-buttock")}
        d="M121.518 164.37L138.538 164.37L138.538 196.41L121.518 196.41L121.518 164.37Z"
      />

      {/* Right Buttock */}
      <path
        data-key="back-right-buttock"
        onClick={() => handleBodyPartClick("right-buttock")}
        className={getBodyPartClass("right-buttock")}
        d="M104.498 164.37L87.478 164.37L87.478 196.41L104.498 196.41L104.498 164.37Z"
      />

      {/* Left Thigh */}
      <path
        data-key="back-left-thigh"
        onClick={() => handleBodyPartClick("left-thigh")}
        className={getBodyPartClass("left-thigh")}
        d="M121.518 196.41L138.538 196.41L138.538 244.98L121.518 244.98L121.518 196.41Z"
      />

      {/* Right Thigh */}
      <path
        data-key="back-right-thigh"
        onClick={() => handleBodyPartClick("right-thigh")}
        className={getBodyPartClass("right-thigh")}
        d="M104.498 196.41L87.478 196.41L87.478 244.98L104.498 244.98L104.498 196.41Z"
      />

      {/* Left Calf */}
      <path
        data-key="back-left-calf"
        onClick={() => handleBodyPartClick("left-calf")}
        className={getBodyPartClass("left-calf")}
        d="M121.518 244.98L138.538 244.98L138.538 310.58L121.518 310.58L121.518 244.98Z"
      />

      {/* Right Calf */}
      <path
        data-key="back-right-calf"
        onClick={() => handleBodyPartClick("right-calf")}
        className={getBodyPartClass("right-calf")}
        d="M104.498 244.98L87.478 244.98L87.478 310.58L104.498 310.58L104.498 244.98Z"
      />

      {/* Left Foot */}
      <path
        data-key="back-left-foot"
        onClick={() => handleBodyPartClick("left-foot")}
        className={getBodyPartClass("left-foot")}
        d="M121.518 310.58L138.538 310.58L148.478 326.09L138.538 341.6L121.518 341.6L111.578 326.09L121.518 310.58Z"
      />

      {/* Right Foot */}
      <path
        data-key="back-right-foot"
        onClick={() => handleBodyPartClick("right-foot")}
        className={getBodyPartClass("right-foot")}
        d="M104.498 310.58L87.478 310.58L77.538 326.09L87.478 341.6L104.498 341.6L114.438 326.09L104.498 310.58Z"
      />
    </>
  );
};