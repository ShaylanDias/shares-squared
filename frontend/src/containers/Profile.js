import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";

import { onError } from "../libs/errorLib";
import "./Profile.css";

export default function Profile({ username }) {

  const [watchlists, setWatchlists] = useState([]);

  useEffect(() => {
    API.get("stonks", "/watchlist").then(
      res => setWatchlists(res)
    ).catch(e => {
      console.log(e);
      onError(e)
    });
  }, [watchlists])

  return (
    <div className="Profile">
      <div className="lander">
        <h1>Stonks</h1>
        <p className="text-muted">Make fun of your friends over at r/WSB</p>
      </div>
    </div>
  );
}