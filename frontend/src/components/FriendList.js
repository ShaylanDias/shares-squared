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
    console.log("USE EFFECT")
    getFriends();
  }, [username]);

  const getFriends = () => {
    // API.get("stonks", "/user-relation", { body: { relation: "FRIEND" }}).then(
    //   res => {
    //     setFriends(res.body);
    //   }
    // ).catch(err => onError(err));
  }

  const addFriend = () => {

    const data = {
      relationship: "FRIEND",
      otherUserId: addFriendRef.current.value
    }
    API.post("stonks", "/user-relation", { body: data })
    .then(res => {
      console.log(res)
      setIsAddLoading(false);

    })
    .catch(err => {
      onError(err);
      setIsAddLoading(false);
    });
  }

  const handleClick = () => {
    history.push(`/profile/${username}`);
  }

  const genFriends = (friends) => {
    return friends.map(username => <ListGroup.Item onClick={handleClick}>{username}</ListGroup.Item>)
  }

  return (
    <div>
      <ListGroup>
        {genFriends(friends)}
      </ListGroup>
      <h2>Your Friend ID: {username}</h2>
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
    </div>
  );
}