import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "../provider/socket";

const HomePage = () => {
  const navigator = useNavigate();
  const { socket } = useSocket();
  const [data, setData] = useState({
    email: "",
    room: "",
  });

  const handleRoomJoined = useCallback((data) => {
    const {room} = data
    console.log(`Data from BE ${room} ${data.email}`)
    navigator(`/room/${room}`)
  }, [navigator])

  useEffect(() => {
    socket.on('room:join', handleRoomJoined)

    return () => {
      socket.off('room:join', handleRoomJoined)
    }
  }, [handleRoomJoined, socket])

  const onChangeForm = (flType, val) => {
    setData({
      ...data,
      [flType]: val,
    });
  };

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
    toast.success(`Hello ${data.email}, entered in room '${data.room}' successfully.`);
    socket.emit("room:join", data);
  }, [data, socket]);

  return (
    <div className="bg-img">
      <div className="container d-flex align-items-center justify-content-center flex-column min-vh-100 ">
      
          <div className="row m-0 bg-light rounded-5 login-part">
            {/* for left image in login page */}
            <div className="col-md-6 col-sm-6 col-xs-12 login-left-img rounded-5 "></div>
            {/* for login form */}
            <div className="col-md-6 col-sm-6 col-xs-12 ps-0 rounded-5 ">
              <div className="rounded-5 border-1 border-dark py-4 px-4 bg-light ">
                <h2>Start Call</h2>
                <p>Please login to continue</p>
                <form className="mt-5" onSubmit={handleSubmitForm}>
                  <div className="row">
                    <div className="col-md-12 col-xs-12 mb-3">
                      <input
                        type="email"
                        required
                        autoFocus
                        className="form-control"
                        placeholder="Enter you Email address here...."
                        value={data?.email}
                        onChange={(e) =>
                          onChangeForm("email", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-12 col-xs-12 mb-3">
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="Enter your room code here....."
                        value={data?.room}
                        onChange={(e) => onChangeForm("room", e.target.value)}
                      />
                    </div>
                    <div className="col-md-12 col-xs-12 mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary mt-3 w-100"
                      >
                        Enter Room
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default HomePage;
