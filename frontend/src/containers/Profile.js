import React, { useState, useEffect, useRef } from "react";
import { API, Auth } from "aws-amplify";
import { InputGroup, FormControl } from "react-bootstrap";
import { useParams } from "react-router-dom";
import _ from "lodash";

import { onError } from "../libs/errorLib";
import "./Profile.css";
import LoaderButton from "../components/LoaderButton";
import FriendList from "../components/FriendList";
import Table from "../components/Table";


export default function Profile() {

  const [watchlists, setWatchlists] = useState([]);
  const [userId, setUserId] = useState(null);

  const [isAddLoading, setIsAddLoading] = useState(false);

  const createListRef = useRef(null);

  const { otherUserId } = useParams();

  const getWatchlists = (watchlists) => {
    API.get("stonks", `/watchlist/${otherUserId ? otherUserId : ""}`).then(
      res => {
        if (!_.isEqual(res, watchlists))
          setWatchlists(res);
      }
    ).catch(e => {
      console.log(e);
      onError(e);
    });
  }

  useEffect(() => {
    getWatchlists(watchlists);

    if (otherUserId) {
      setUserId(otherUserId)
    } else {
      Auth.currentUserInfo().then(res => setUserId(res.id));
    }
  }, [watchlists, userId, otherUserId])

  const createWatchlist = () => {
    const data = {
      name: createListRef.current.value
    };
    API.post("stonks", "/watchlist", { body: data })
      .then(() => {
        getWatchlists();
        setIsAddLoading(false);
      })
      .catch(e => {
        console.log(e);
        onError(e);
      })
  }

  const genTables = (data) => {
    let tables = [];

    for (const tableData of data) {
      tables.push(
        <Table tableData={tableData} getWatchlists={getWatchlists}/>
      )
    }

    return tables;
  }

  return (
    <div className="Profile">
      <div className="lander">
        <h1>Stonks</h1>
        <p className="text-muted">Welcome to {otherUserId ? `${otherUserId}'s profile` : "your profile!"}</p>
        {genTables(watchlists)}
        {!otherUserId &&
          <React.Fragment>
            <h2>Add List</h2>
            <InputGroup className="mb-3">
              <FormControl
                ref={createListRef}
                placeholder="Watchlist name"
                aria-describedby="basic-addon2"
              />
              <InputGroup.Append>
                <LoaderButton isLoading={isAddLoading} onClick={() => {
                  setIsAddLoading(true);
                  createWatchlist();
                }}>
                  Create
              </LoaderButton>
              </InputGroup.Append>
            </InputGroup>
            <br />
            <br />
            <FriendList username={userId} />
          </React.Fragment>
        }
      </div>
    </div>
  );
}