const apiKey = "0ef6e373f72f4faabf111754a0299105";

const initialState = {
  busLine: null,
  busStops: null,
  busDirection: null,
  stopName: null,
  nextBusses: null
};

function updater(state, { type, payload }) {
  let newState = Object.assign({}, state);
  switch(type) {
    case "UPDATE_BUS_LINE": {
      newState.busLine = payload;
      break;
    }
    case "UPDATE_BUS_STOPS": {
      newState.busStops = payload;
      break;
    }
    case "UPDATE_BUS_DIRECTION": {
      newState.busDirection = payload;
      break;
    }
    case "UPDATE_NEXT_BUSSES": {
      newState.nextBusses = payload;
      break;
    }
    default: {
      newState = state;
    }
  }
  return newState;
}

const store = PutStuffOnWebsite.createStore({ updater, state: initialState });

function updateBusLine(busLine) {
  return {
    type: "UPDATE_BUS_LINE",
    payload: busLine
  };
}

function updateBusDirection(direction) {
  return {
    type: "UPDATE_BUS_DIRECTION",
    payload: direction
  };
}

function fetchBusLines() {
  const busLine = store.getState().busLine;
  window.fetch(
    `https://api.wmata.com/Bus.svc/json/jRouteSchedule?RouteId=${busLine}&api_key=${apiKey}`
  ).then(res => res.json()).then(res => store.dispatch({ 
    type: "UPDATE_BUS_STOPS",
    payload: res
  }));
};

function fetchRealTimeStopInfo(stopId) {
  return window.fetch(
    `https://api.wmata.com/NextBusService.svc/json/jPredictions?StopID=${stopId}&api_key=${apiKey}`
  ).then(res => res.json()).then(res => {
    const direction = store.getState().busDirection;
    const directionNum = direction.slice(direction.length - 1, direction.length);
    const getDirectionalPredictions = res.Predictions.filter(prediction => (
      prediction.DirectionNum === directionNum &&
      prediction.RouteID === store.getState().busLine
    ));
    return getDirectionalPredictions;
  });
}

function dispatchRealTimeStopInfo(stopId) {
  fetchRealTimeStopInfo(stopId).then(predictions => store.dispatch({
    type: "UPDATE_NEXT_BUSSES",
    payload: predictions
  }));
  setInterval(() => {
    fetchRealTimeStopInfo(stopId).then(predictions => store.dispatch({
      type: "UPDATE_NEXT_BUSSES",
      payload: predictions
    }));
  }, 30000);
}

function DisabledSelectOption({ val }) {
  return {
    tagName:"option",
    props: { disabled: true, selected: true },
    children: val
  };  
}

function BusLineInput({ busLine }) {
  return {
    tagName: "input",
    props: {
      className: "bus-div",
      value: busLine,
      placeholder: "Enter Bus Line",
      style: {
        width: "80vw",
        height: "25vh",
        fontSize: "10vw"
      },
      onkeyup: e => {
        if (e.keyCode === 13) {
          fetchBusLines();
        }
        else {
          store.dispatch(updateBusLine(e.target.value));
        }
      }
    }
  }
}

function BusStopSelect({ busStops }) {
  const options = busStops.map(stop => ({
    tagName: "option",
    props: {
      value: stop.StopID
    },
    children: stop.StopName
  }));
  return {
    tagName: "select",
    props: {
      onchange: e =>  dispatchRealTimeStopInfo(e.target.selectedOptions[0].value),
      style: { width: "80%" }
    },
    children: [DisabledSelectOption({ val: "Choose Stop"})].concat(options)
  };
}

function BusStopDirections({ directionOne, directionTwo }) {
  const options = [
    DisabledSelectOption({ val: "Select a Direction" }),
    {
      tagName: "option",
      props: {
        value: directionOne.value
      },
      children: directionOne.name
    },
    {
      tagName: "option",
      props: {
        value: directionTwo.value
      },
      children: directionTwo.name
    }
  ];

  return {
    tagName: "select",
    props: {
      onchange: e => store.dispatch((
        updateBusDirection(e.target.selectedOptions[0].value)
      )),
      style: { width: "80%" }
    },
    children: options
  };
}

function NextBusList({ nextBusses }) {
  const listItems = nextBusses.map(bus => ({
    tagName: "li",
    props: {
      style: { color: "white", fontSize: "10vw" }
    },
    children: `${bus.Minutes} Minutes`
  }));
  return {
    tagName: "ol",
    children: listItems
  };
}

function App({ busLine, nextBusses, busStops, busDirection }) {
  let children = [];
  if (!nextBusses) {
    children.push(BusLineInput({ busLine }));
    if (busStops && !busDirection) {
      children.push(BusStopDirections({
        directionOne: {
          name: busStops.Direction0[0].TripDirectionText,
          value: "Direction0"
        },
        directionTwo: {
          name: busStops.Direction1[0].TripDirectionText,
          value: "Direction1"
        }
      }));  
    }
    else if (busStops) {
      children.push(BusStopSelect({
        busStops: busStops[busDirection][0].StopTimes
      }));
    }
  }
  else {
    if (!nextBusses.length) {
      children.push({
        tagName: "h1",
        children: "No Upcoming Busses"
      });
    }
    else {

      children.push(
        { 
          tagName: "h1", 
          props: { 
            style: {
              color: "white",
              fontSize: "8vw"
            }
          },
          children: busLine 
        },
        NextBusList({ nextBusses })
      );
    }
  }
  return {
    tagName: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        "height": "100vh"
      }
    },
    children
  };
} 

store.subscribe(state => PutStuffOnWebsite.render(App(state), "#root"));

PutStuffOnWebsite.render(App(initialState), "#root");