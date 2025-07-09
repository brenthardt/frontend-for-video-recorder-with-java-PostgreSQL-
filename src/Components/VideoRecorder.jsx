import { useState, useRef } from "react";

const mimeType = 'video/webm; codecs="opus,vp8"';

const VideoRecorder = () => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);

  const liveVideoFeed = useRef(null);

  const [recordingStatus, setRecordingStatus] = useState("inactive");

  const [stream, setStream] = useState(null);

  const [recordedVideo, setRecordedVideo] = useState(null);

  const [videoChunks, setVideoChunks] = useState([]);

  const getCameraPermission = async () => {
    setRecordedVideo(null);
    if ("MediaRecorder" in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: true,
        };
        const audioConstraints = { audio: true };

        const audioStream = await navigator.mediaDevices.getUserMedia(
          audioConstraints
        );
        const videoStream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        );

        setPermission(true);

        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);

        setStream(combinedStream);

        liveVideoFeed.current.srcObject = videoStream;
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");

    const media = new MediaRecorder(stream, { mimeType });

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localVideoChunks = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
    };

    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    setPermission(false);
    setRecordingStatus("inactive");
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }

    mediaRecorder.current.onstop = async () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);

      const videoFile = new File([videoBlob], "recorded-video.webm", {
        type: mimeType,
      });

      const formData = new FormData();
      formData.append("file", videoFile);

      try {
        const response = await fetch("http://localhost:9980/videos", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("Video uploaded successfully");
          const data = await response.json();
          setRecordedVideo(`http://localhost:9980/${data.filepath}`);
        } else {
          console.error("Failed to upload video");
        }
      } catch (error) {
        console.error("Error uploading video:", error);
      }

      setVideoChunks([]);
    };
  };

  const downloadRecording = () => {
    if (!recordedVideo) return;

    fetch(recordedVideo)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Download error:", error));
  };

  return (
    <div className="text-center">
      <h2>Video Recorder</h2>
      <main>
        <div className="video-controls">
          {!permission ? (
            <button onClick={getCameraPermission} type="button">
              Get Camera
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <button onClick={startRecording} type="button">
              Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          ) : null}
        </div>
      </main>

      <div className="video-player">
        {!recordedVideo ? (
          <video
            ref={liveVideoFeed}
            autoPlay
            className="live-player camera-preview"
          ></video>
        ) : null}
        {recordedVideo ? (
          <div className="recorded-player">
            <video className="recorded" src={recordedVideo} controls></video>
            <button
              className="btn btn-sm btn-primary w-25 mt-2"
              onClick={downloadRecording}
            >
              Download Recording
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VideoRecorder;
