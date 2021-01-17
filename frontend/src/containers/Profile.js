import React, { useState, useEffect, useRef } from "react";
import { API } from "aws-amplify";
import { Table, Button, InputGroup, FormControl } from "react-bootstrap";

import { onError } from "../libs/errorLib";
import "./Profile.css";
import LoaderButton from "../components/LoaderButton";

export default function Profile({ username }) {

  const [watchlists, setWatchlists] = useState([]);
  const createListRef = useRef(null);

  console.log(watchlists);

  useEffect(() => {
    getWatchlists()
  })

  const getWatchlists = () => {
    API.get("stonks", "/watchlist").then(
      res => {
        // This is a kind of trash but functional way of comparing two objects.
        if (JSON.stringify(res) !== JSON.stringify(watchlists))
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
    console.log(data);
    API.post("stonks", "/watchlist", {body: data})
    .catch(e => {
      console.log(e);
      onError(e);
    })
  }

  const addSymbol = (symbol, watchlist) => {
    console.log(symbol);
    const data = {
      symbols: [symbol],
      watchlist
    };
    API.post("stonks", "/symbols", {body: data})
    .then(() => getWatchlists())
    .catch(e => {
      onError(e);
    })
  }

  const genTables = (data) => {
    let tables = [];

    for (const tableData of data) {
      const ref = React.createRef();
      tables.push(
        <React.Fragment key={tableData.watchlistId}>
          <h2>{tableData.watchlistId}</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Symbol</th>
              </tr>
            </thead>
            <tbody>
              {tableData.symbols.map(symbol =>
              symbol === "" ? 
              null
              :
                <tr key={symbol}>
                  <td>{symbol}</td>
                </tr>)}
              <tr>
                <InputGroup className="mb-3">
                  <FormControl
                    ref={ref}
                    placeholder="Add Symbol"
                    aria-describedby="basic-addon2"
                  />
                  <InputGroup.Append>
                    <LoaderButton isLoading={false} onClick={() => addSymbol(ref.current.value, tableData.watchlistId)}>Create</LoaderButton>
                  </InputGroup.Append>
                </InputGroup>
              </tr>
            </tbody>
          </Table>
        </React.Fragment>
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
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
          />
          <InputGroup.Append>
            <LoaderButton isLoading={false} onClick={createWatchlist}>Create</LoaderButton>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </div>
  );
}