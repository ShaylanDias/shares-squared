import React, { useState, useEffect, useRef } from "react";
import { API } from "aws-amplify";
import { Table, InputGroup, Button, FormControl } from "react-bootstrap";
import _ from "lodash";

import { onError } from "../libs/errorLib";
import "./Profile.css";
import LoaderButton from "../components/LoaderButton";


export default function Profile({ username }) {

  const [watchlists, setWatchlists] = useState([]);
  const createListRef = useRef(null);

  console.log(watchlists);

  useEffect(() => {
    getWatchlists(watchlists)
  }, [watchlists])

  const getWatchlists = (watchlists) => {
      API.get("stonks", "/watchlist").then(
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
    API.post("stonks", "/watchlist", {body: data})
    .then(() => getWatchlists())
    .catch(e => {
      console.log(e);
      onError(e);
    })
  }

  const deleteWatchlist = (watchlist) => {
    const data = {
      name: watchlist
    };
    console.log(data);
    API.del("stonks", "/watchlist", {body: data})
    .then(() => getWatchlists())
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

  const removeSymbol = (symbol, watchlist) => {
    console.log(symbol);
    const data = {
      symbols: [symbol],
      watchlist
    };
    API.del("stonks", "/symbols", {body: data})
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
                <th>Name</th>
                <th>Bid</th>
                <th>50 Day Avg.</th>
                <th>Market Change ($)</th>
                <th>Market Change (%)</th>
                <th>Peg Ratio</th>
                <th>Dividend Yield</th>
              </tr>
            </thead>
            <tbody>
              {tableData.symbols.map(item => {
                return item === null ? 
                null
                :
                  <tr key={item.symbol}>
                    <td>{item.symbol}</td>
                    <td>{item.longName}</td>
                    <td>{item.bid}</td>
                    <td>{item.fiftyDayAverage}</td>
                    <td>{item.regularMarketChange}</td>
                    <td>{item.regularMarketChangePercent}</td>
                    <td>{item.pegRatio}</td>
                    <td>{item.dividendYield}</td>
                    <td>
                      <Button variant="danger" onClick={removeSymbol.bind(this, item.symbol, tableData.watchlistId)}>
                        X
                      </Button>
                    </td>
                  </tr>
              })}
              <tr>
                <td>
                  <InputGroup className="mb-3">
                    <FormControl
                      ref={ref}
                      placeholder="Add Symbol"
                      aria-describedby="basic-addon2"
                    />
                    <InputGroup.Append>
                      <LoaderButton isLoading={false} onClick={() => addSymbol(ref.current.value, tableData.watchlistId)}>Add</LoaderButton>
                    </InputGroup.Append>
                  </InputGroup>
                </td>
                <td>
                  <Button variant="danger" onClick={deleteWatchlist.bind(this, tableData.watchlistId)}>
                    Delete
                  </Button>
                </td>
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