import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PeerContext = createContext();

export const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState(null);

  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    []
  );

  const createOffer = async () => {
    if (peer) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  };

  const createAnswer = async (offer) => {
    if (peer) {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    }
  };

  const setRemoteAns = async (ans) => {
    if (peer) {
      // await peer.setLocalDescription(new RTCSessionDescription(ans));
      await peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  };

  const sendStream = async (stream) => {
    // if (stream) {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
    // }
  };

  const handleTrackEvent = useCallback((ev) => {
    const streams = ev.streams;
    console.log("streams---", streams);
    setRemoteStream(streams[0]);
  }, []);

  useEffect(() => {
    if (peer) {
      peer.addEventListener("track", handleTrackEvent);
      return () => {
        peer.removeEventListener("track", handleTrackEvent);
      };
    }
  }, [handleTrackEvent, peer]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        remoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => useContext(PeerContext);
