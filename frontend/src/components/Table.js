import React, { useState, useRef, useEffect } from "react";
import { Table as BootstrapTable, InputGroup, Button, FormControl, Form } from "react-bootstrap";
import { API, Auth } from "aws-amplify";

import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";

export default function Table({ tableData, getWatchlists}) {

  const [privacy, setPrivacy] = useState(tableData.privacy.charAt(0) + tableData.privacy.toLowerCase().slice(1));
  const formRef = useRef(null);

  const [actualUserId, setActualUserId] = useState("");

  useEffect(() => {
    Auth.currentUserInfo().then(res => setActualUserId(res.id));
  }, [actualUserId])

  const isUserTable = actualUserId === tableData.userId;

  const handleTableChange = (event) => {
    event.preventDefault();
    setPrivacy(event.target.value);
    API.post("stonks", "/watchlist-update", {
      body: {
        name: tableData.watchlistId,
        privacy: event.target.value.toUpperCase(),
      }
    }).then(res => console.log(res))
    .catch(err => onError(err));
  }

  const addSymbol = (symbol, watchlist) => {
    console.log(symbol);
    const data = {
      symbols: [symbol],
      watchlist
    };
    API.post("stonks", "/symbols", { body: data })
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
    API.del("stonks", "/symbols", { body: data })
      .then(() => getWatchlists())
      .catch(e => {
        onError(e);
      })
  }

  const deleteWatchlist = (watchlist) => {
    const data = {
      name: watchlist
    };
    console.log(data);
    API.del("stonks", "/watchlist", { body: data })
      .then(() => getWatchlists())
      .catch(e => {
        console.log(e);
        onError(e);
      })
  }

  return (
    <React.Fragment key={tableData.watchlistId}>
      <h2>{tableData.watchlistId}</h2>
      <BootstrapTable striped bordered hover>
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
            {isUserTable &&
              <th>
                <Form.Group>
                  <Form.Control style={{ width: "100px" }} as="select" onChange={handleTableChange} value={privacy}>
                    <option>Private</option>
                    <option>Public</option>
                    <option>Friends</option>
                  </Form.Control>
                </Form.Group>
              </th>
            }
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
                {isUserTable &&
                  <td>
                    <Button variant="danger" onClick={removeSymbol.bind(this, item.symbol, tableData.watchlistId)}>
                      X
                      </Button>
                  </td>
                }
              </tr>
          })}
          {isUserTable &&
            <tr>
              <td>
                <InputGroup className="mb-3">
                  <FormControl
                    ref={formRef}
                    placeholder="Add Symbol"
                    aria-describedby="basic-addon2"
                  />
                  <InputGroup.Append>
                    <LoaderButton isLoading={false} onClick={() => addSymbol(formRef.current.value, tableData.watchlistId)}>Add</LoaderButton>
                  </InputGroup.Append>
                </InputGroup>
              </td>
              <td>
                <Button variant="danger" onClick={deleteWatchlist.bind(this, tableData.watchlistId)}>
                  Delete
                  </Button>
              </td>
            </tr>
          }
        </tbody>
      </BootstrapTable>
    </React.Fragment>
  )
}