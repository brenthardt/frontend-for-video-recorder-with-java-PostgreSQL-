import { useEffect, useState } from "react";
import axios from "axios";

const Saved = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:9980/videos")
      .then((response) => {
        setVideos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load videos: " + err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:9980/videos/${id}`);
      setVideos(videos.filter((video) => video.id !== id));
    } catch (err) {
      alert("Error deleting video: " + err.message);
    }
  };

  return (
    <div className="container mt-3">
      <h5 className="text-center">Saved Videos</h5>

      {loading && <p className="text-center">Loading videos...</p>}
      {error && <p className="text-center text-danger">{error}</p>}

      {!loading && !error && videos.length === 0 && (
        <p className="text-center">No videos found.</p>
      )}

      {!loading && !error && videos.length > 0 && (
        <table className="table table-bordered text-center w-50 mx-auto">
          <thead>
            <tr>
              <th>Id</th>
              <th>Filename</th>
              <th>Video</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td>{video.id}</td>
                <td>{video.filename}</td>
                <td>
                  <video width="250" controls>
                    <source
                      src={`http://localhost:9980/${video.filepath}`}
                      type="video/webm"
                    />
                   errors here
                  </video>
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(video.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Saved;
