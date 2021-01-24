import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import { ListGroup } from "react-bootstrap"

export default function FriendList({ username }) {

  const [friends, setFriends] = useState([]);

  const history = useHistory();

  useEffect(() => {
    API.get("stonks", "/friends").then(
      res => setFriends(res.body)
    ).catch(err => console.log(err));
  }, [username]);

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
    </div>
  );
}