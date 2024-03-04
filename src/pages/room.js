import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../provider/socket";
import { usePeer } from "../provider/peer";

const RoomPage = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState();
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const handleNewUserJoined = useCallback(async (data) => {
    const { email, id } = data;
    console.log("New User Joined ROom---", email, id);
    setRemoteSocketId(id);
    setRemoteEmailId(email)
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await createOffer();
    socket.emit("user:call", {to: remoteSocketId, offer})
    setMyStream(stream);
  }, [createOffer, remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer, to } = data;
      console.log("incoming call from ", from, offer, to);
      setRemoteEmailId(to)
      setRemoteSocketId(from)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await createAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { from, ans } = data;
      await setRemoteAns(ans);
      console.log("Call got accepted ---- ", from, ans);
      sendStream(myStream)
    },
    [myStream, sendStream, setRemoteAns]
  );

  const handleNegoNeedIncomming = useCallback(async(data) => {
    const {from, offer} = data;
    const ans = await createAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans })
  }, [createAnswer, socket])

  const handleNegoNeedFinal = useCallback(async(data) => {
    const {ans} = data;
    console.log(ans)
    await setRemoteAns(ans)
    // await peer.setLocalDescription(ans)
  }, [setRemoteAns])

  useEffect(() => {
    socket.on("user:joined", handleNewUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleNewUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [handleCallAccepted, handleIncommingCall, handleNewUserJoined, handleNegoNeedIncomming, handleNegoNeedFinal, socket]);

  const handleNegotiation = useCallback(async () => {
    const offer = await createOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
  }, [createOffer, remoteSocketId, socket])

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation)
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation)
    }
  }, [handleNegotiation, peer]);

  return (
    <div className="container">
      <h2>Room</h2>
      <h3>You are connected to {remoteEmailId}</h3>
      <h4>{remoteSocketId ? "connected" : "No one in room"}</h4>
      {myStream && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => sendStream(myStream)}
        >
          Send Stream
        </button>
      )}
      {remoteSocketId && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCallUser}
        >
          Call
        </button>
      )}
      {myStream && (
        <>
          {" "}
          <h2>My Stream</h2>
          <ReactPlayer url={myStream} playing height="200px" width="200px" />
        </>
      )}
      {remoteStream && (
        <>
          {" "}
          <h2>Remote Stream</h2>
          <ReactPlayer url={remoteStream} playing height="200px" width="200px" />
        </>
      )}
      {/* <ReactPlayer url={remoteStream} playing /> */}
    </div>
  );
};

export default RoomPage;
