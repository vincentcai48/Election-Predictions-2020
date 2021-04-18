import React from "react"
import { Link } from "react-router-dom";
import {pAuth, googleAuthProvider, pFirestore} from "../services/config";
import votePicture from "../images/votePicture.jpg"

class Header extends React.Component{
    constructor(){
        super();
        this.state={

        }
    }

    componentDidMount(){
        pAuth.onAuthStateChanged((user)=>{
            this.setState({});
            if(user){
                pFirestore.collection('users').doc(user.uid).get().then((doc)=>{
                    if(!doc.exists){
                        pFirestore.collection('users').doc(user.uid).set({
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            email: user.email,
                            id: user.uid,
                            presidential: []
                        })
                    }
                })
            }
            
            
        })
    }

    login = () => {
        pAuth.signInWithPopup(googleAuthProvider).then(()=>{

        }).catch(()=>{})
    }

    logout = () => {
        pAuth.signOut().then(()=>{}).catch((e)=>{})
    }


    render(){
        return(
        <header>
            <img className="votePicture" src={votePicture}></img>
            <Link to="/" className="react-link"><h1>Election Predictions 2020</h1></Link>
            <Link to="/" className="react-link">Make My Prediction</Link>
        <Link to="/analysis" className="react-link">Analysis {"&"} Results</Link>
            <div>
                {pAuth.currentUser?<button onClick={this.logout}>Sign Out of {pAuth.currentUser.displayName}</button>:<button className="bred" onClick={this.login}>Login With Google</button>}
            </div>
        </header>
        )
    }
}

export default Header 