
import Lottie from "lottie-react";
import animationData from "./Celebration.json"; // your animation file

const Celebration = () => {
  return (
    <div className="celebration"> 
      <Lottie animationData={animationData} loop={true} />
    </div>
  )
}

export default Celebration