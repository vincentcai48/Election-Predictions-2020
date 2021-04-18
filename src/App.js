import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom"
import RegressionAnalysis from "./components/AnalysisComponents/RegressionAnalysis";
import Header from "./components/Header"
import Predictions from "./components/Prediction"

function App() {
  return (
    <div className="App">
      <Router>
        <Header/>
        <Switch>
          <Route path="/" exact>
            <Predictions/>
          </Route>
          <Route path="/analysis">
            <RegressionAnalysis/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
