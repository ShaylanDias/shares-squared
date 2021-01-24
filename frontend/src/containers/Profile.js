import React, { useState, useEffect, useRef } from "react";
import { API, Auth } from "aws-amplify";
import { InputGroup, FormControl } from "react-bootstrap";
import _ from "lodash";

import { onError } from "../libs/errorLib";
import "./Profile.css";
import LoaderButton from "../components/LoaderButton";
import FriendList from "../components/FriendList";
import Table from "../components/Table";


export default function Profile({ otherUserId }) {

  const [watchlists, setWatchlists] = useState([]);
  const [userId, setUserId] = useState(null);

  const [isAddLoading, setIsAddLoading] = useState(false);

  const createListRef = useRef(null);

  console.log(watchlists);

  useEffect(() => {
    getWatchlists(watchlists);
    Auth.currentUserInfo().then(res => setUserId(res.id));
  }, [watchlists, userId])

  const getWatchlists = (watchlists) => {
    API.get("stonks", "/watchlist/self").then(
      res => {
        if (!_.isEqual(res, watchlists))
          setWatchlists(res);
      }
    ).catch(e => {
      console.log(e);
      onError(e);
    });
  }

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
        <Table tableData={tableData} getWatchlists={getWatchlists} userId={userId} />
      )
    }

    return tables;
  }

  return (
    <div className="Profile">
      <div className="lander">
        <h1>Stonks</h1>
        <p className="text-muted">Welcome to your profile!</p>
        {genTables(watchlists)}
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
        <FriendList username={userId} />
      </div>
    </div>
  );
}