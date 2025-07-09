import Saved from "./Components/Saved";
import VideoRecorder from "./Components/VideoRecorder";
import { Link, Routes, Route } from "react-router-dom";
const App = () => {
  return (
    <>
      <div className=" d-flex align-items-center justify-content-center gap-2 p-2">
        <Link to={"/"} className="btn btn-sm btn-primary">
          Video Recorder
        </Link>
        <Link to={"/saved"} className="btn btn-sm btn-primary">
         saved
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<VideoRecorder />} />
        <Route path="/saved" element={<Saved />} />
      </Routes>
    </>
  );
};

export default App;
