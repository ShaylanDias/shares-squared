import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import { ListGroup, InputGroup, FormControl } from "react-bootstrap"

import LoaderButton from "./LoaderButton";
import { onError } from "../libs/errorLib";

export default function FriendList({ username }) {

  const [friends, setFriends] = useState([]);

  const [isAddLoading, setIsAddLoading] = useState(false);

  const addFriendRef = useRef(null);

  const history = useHistory();


  useEffect(() => {
    getFriends();
  }, [username]);

  const getFriends = () => {
    API.get("stonks", "/user-relation/FRIEND")
    .then(res => setFriends(res))
    .catch(err => onError(err));
  }

  const addFriend = () => {
    const data = {
      relationship: "FRIEND",
      otherUserId: addFriendRef.current.value
    }
    API.post("stonks", "/user-relation", { body: data })
    .catch(err => {
      onError(err);
    })
    .finally(() => setIsAddLoading(false));
  }

  const handleClick = (username) => {
    history.push(`/profile/${username}`);
  }

  const genFriends = (friends) => {
    return friends.map(username => <ListGroup.Item style={{cursor: "pointer"}} onClick={handleClick.bind(this, username)}>{username}</ListGroup.Item>)
  }

  return (
    <div>
      <h1>Friends List</h1>
      <ListGroup>
        {genFriends(friends)}
      </ListGroup>
      <br />
      <InputGroup className="mb-3">
          <FormControl
            ref={addFriendRef}
            placeholder="Friend ID"
            aria-describedby="basic-addon2"
          />
          <InputGroup.Append>
            <LoaderButton isLoading={isAddLoading} onClick={() => {
              setIsAddLoading(true);
              addFriend();
            }}>
              Add
            </LoaderButton>
          </InputGroup.Append>
        </InputGroup>
        <h2>Your Friend ID: {username}</h2>
    </div>
  );
}